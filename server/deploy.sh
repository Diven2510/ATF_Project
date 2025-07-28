#!/bin/bash

# Backend Server Deployment Script

echo "🚀 Starting Online Judge Backend Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production
GEMINI_API_KEY=your_gemini_api_key_here
EOF
    echo "⚠️  Please update .env file with your actual API keys!"
fi

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

echo "🐳 Docker found: $(docker --version)"

# Stop and remove existing containers if they exist
echo "🧹 Cleaning up existing containers..."
docker stop online-judge-backend online-judge-mongo 2>/dev/null || true
docker rm online-judge-backend online-judge-mongo 2>/dev/null || true

# Build the backend image
echo "🔨 Building backend Docker image..."
docker build -f Dockerfile.simple -t online-judge-backend .

# Create a custom network for the containers
echo "🌐 Creating Docker network..."
docker network create online-judge-network 2>/dev/null || true

# Start MongoDB container
echo "🚀 Starting MongoDB container..."
docker run -d \
  --name online-judge-mongo \
  --network online-judge-network \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password123 \
  -v mongo_data:/data/db \
  --restart unless-stopped \
  mongo:6.0

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
sleep 15

# Start backend container
echo "🚀 Starting backend container..."
docker run -d \
  --name online-judge-backend \
  --network online-judge-network \
  -p 5000:5000 \
  -e MONGO_URI=mongodb://admin:password123@online-judge-mongo:27017/online-judge?authSource=admin \
  -e JWT_SECRET=your_super_secret_jwt_key_here \
  -e GEMINI_API_KEY=your_gemini_api_key_here \
  -e NODE_ENV=production \
  -e PUBLIC_IP=16.170.128.111 \
  --restart unless-stopped \
  online-judge-backend

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo "🏥 Checking service health..."
if curl -f http://localhost:5000/api/auth/health; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend health check failed"
    echo "📋 Backend logs:"
    docker logs online-judge-backend
    echo "📋 MongoDB logs:"
    docker logs online-judge-mongo
fi

echo "🎉 Deployment completed!"
echo "📊 Backend URL: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/api/auth/health" 