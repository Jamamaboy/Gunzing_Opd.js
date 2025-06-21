#!/bin/bash

echo "🔄 Restarting services with updated configuration..."

# Stop all services
echo "⏹️  Stopping services..."
docker-compose -f docker-compose.prod.yml down

# Remove old containers and volumes (optional)
echo "🧹 Cleaning up old containers..."
docker-compose -f docker-compose.prod.yml down -v

# Rebuild and start services
echo "🔨 Rebuilding and starting services..."
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check service status
echo "📊 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

echo "✅ Services restarted successfully!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend: http://localhost:8000"
echo "📊 Debug: http://localhost:8000/api/debug" 