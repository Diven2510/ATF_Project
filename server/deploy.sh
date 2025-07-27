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

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

echo "⏳ Waiting for services to be ready..."
sleep 10

# Check health
echo "🏥 Checking service health..."
if curl -f http://localhost:5000/api/auth/health; then
    echo "✅ Backend is healthy!"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
fi

echo "🎉 Deployment completed!"
echo "📊 Backend URL: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/api/auth/health" 