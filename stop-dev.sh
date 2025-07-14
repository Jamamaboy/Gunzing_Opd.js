#!/bin/bash

echo "🛑 Stopping development environment..."

# Stop Docker services
echo "🐳 Stopping Docker services..."
docker-compose -f docker-compose.dev.yml down

echo "✅ Development environment stopped!"
echo ""
echo "💡 To start again, run: ./start-dev.sh"
