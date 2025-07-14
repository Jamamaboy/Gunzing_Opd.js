# Development Environment Setup

This setup allows you to run the frontend locally with hot reload while keeping backend services in Docker.

## 🚀 Quick Start

### Start Development Environment
```bash
./start-dev.sh
```

This script will:
1. Start backend services in Docker (backend-api, ai-inference, db)
2. Start frontend locally with `npm start` for hot reload

### Stop Development Environment
```bash
./stop-dev.sh
```

## 📍 Service URLs

- **Frontend (Local)**: http://localhost:5173 (Vite) or http://localhost:3000 (React)
- **Backend API**: http://localhost:8000
- **AI Inference Service**: http://localhost:8080
- **Database**: localhost:5432

## 🔧 Manual Commands

### Start only backend services
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Start frontend locally
```bash
cd frontend
npm install  # First time only
npm start
```

### Stop backend services
```bash
docker-compose -f docker-compose.dev.yml down
```

## 🔥 Benefits

- ✅ **Hot Reload**: Instant updates when you modify frontend code
- ✅ **Faster Development**: No need to rebuild Docker containers
- ✅ **Better Debugging**: Direct access to React DevTools
- ✅ **Network Access**: All services can communicate properly

## 📁 Files Created

- `docker-compose.dev.yml` - Development Docker Compose (frontend commented out)
- `start-dev.sh` - Start development environment
- `stop-dev.sh` - Stop development environment

## 🔄 Switching Between Modes

### Development Mode (Current Setup)
```bash
./start-dev.sh
```

### Production Mode (All services in Docker)
```bash
docker-compose up -d
```

## 🐛 Troubleshooting

### Port Conflicts
If you get port conflicts, make sure no other services are running on:
- Port 8000 (Backend API)
- Port 8080 (AI Service)
- Port 5432 (Database)
- Port 5173/3000 (Frontend)

### CORS Issues
The API configuration is already set up to handle localhost requests. If you encounter CORS issues, check the backend CORS settings.

### Environment Variables
The frontend `.env` file is already configured:
```
VITE_API_URL = 'http://localhost:8000'
```
