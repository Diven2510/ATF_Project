#!/bin/bash

# Online Judge Backend Container Management Script

case "$1" in
  "start")
    echo "🚀 Starting Online Judge Backend..."
    docker start online-judge-mongo online-judge-backend 2>/dev/null || {
      echo "❌ Containers not found. Run ./deploy.sh first."
      exit 1
    }
    echo "✅ Containers started!"
    ;;
    
  "stop")
    echo "🛑 Stopping Online Judge Backend..."
    docker stop online-judge-backend online-judge-mongo
    echo "✅ Containers stopped!"
    ;;
    
  "restart")
    echo "🔄 Restarting Online Judge Backend..."
    docker restart online-judge-backend online-judge-mongo
    echo "✅ Containers restarted!"
    ;;
    
  "logs")
    echo "📋 Backend logs:"
    docker logs -f online-judge-backend
    ;;
    
  "mongo-logs")
    echo "📋 MongoDB logs:"
    docker logs -f online-judge-mongo
    ;;
    
  "status")
    echo "📊 Container Status:"
    docker ps -a --filter "name=online-judge"
    ;;
    
  "clean")
    echo "🧹 Cleaning up containers and images..."
    docker stop online-judge-backend online-judge-mongo 2>/dev/null || true
    docker rm online-judge-backend online-judge-mongo 2>/dev/null || true
    docker rmi online-judge-backend 2>/dev/null || true
    docker volume rm mongo_data 2>/dev/null || true
    docker network rm online-judge-network 2>/dev/null || true
    echo "✅ Cleanup completed!"
    ;;
    
  *)
    echo "Usage: $0 {start|stop|restart|logs|mongo-logs|status|clean}"
    echo ""
    echo "Commands:"
    echo "  start      - Start the containers"
    echo "  stop       - Stop the containers"
    echo "  restart    - Restart the containers"
    echo "  logs       - Show backend logs"
    echo "  mongo-logs - Show MongoDB logs"
    echo "  status     - Show container status"
    echo "  clean      - Remove containers and images"
    exit 1
    ;;
esac 