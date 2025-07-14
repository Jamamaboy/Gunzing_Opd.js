#!/bin/bash

echo "🚀 Starting development environment..."
echo "📦 Frontend will run locally with hot reload"
echo "🐳 Backend services will run in Docker"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start backend services
echo "🐳 Starting backend services (backend-api, ai-inference, db)..."
docker-compose -f docker-compose.dev.yml up -d

# Wait a moment for services to start
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are running
echo "📊 Checking service status..."
docker-compose -f docker-compose.dev.yml ps

echo ""
echo "✅ Backend services are starting up!"
echo ""
echo "📱 Now starting frontend locally..."
echo "🔥 Frontend will have hot reload enabled"
echo ""

# Navigate to frontend directory and start npm
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing npm dependencies..."
    npm install
fi

echo "🚀 Starting frontend development server..."
echo "📍 Frontend: http://localhost:5173 (or 3000)"
echo "📍 Backend API: http://localhost:8000"
echo "📍 AI Service: http://localhost:8080"
echo "📍 Database: localhost:5432"
echo ""

# Start the development server
npm run dev
