# Azure Web App Services Deployment Guide

## Prerequisites
1. Azure Account
2. Azure CLI installed
3. Docker installed
4. Azure Container Registry (ACR)

## Deployment Steps

### 1. Login to Azure
```bash
az login
```

### 2. Create Azure Container Registry
```bash
az acr create --resource-group raven-app-rg --name ravenregistry --sku Basic
```

### 3. Build and Push Docker Images
```bash
# Login to ACR
az acr login --name ravenregistry

# Build images
docker build -t ravenregistry.azurecr.io/raven-frontend:latest ./frontend
docker build -t ravenregistry.azurecr.io/raven-backend:latest ./backend-api
docker build -t ravenregistry.azurecr.io/raven-ai:latest ./ai-inference-service

# Push images
docker push ravenregistry.azurecr.io/raven-frontend:latest
docker push ravenregistry.azurecr.io/raven-backend:latest
docker push ravenregistry.azurecr.io/raven-ai:latest
```

### 4. Create Azure Database for PostgreSQL
```bash
az postgres flexible-server create \
    --resource-group raven-app-rg \
    --name raven-db \
    --location southeastasia \
    --admin-user postgres \
    --admin-password <your-password> \
    --sku-name Standard_B1ms
```

### 5. Run Deployment Script
```bash
chmod +x azure-deploy.sh
./azure-deploy.sh
```

### 6. Configure Continuous Deployment (Optional)
1. Go to Azure Portal
2. Navigate to your Web App
3. Go to Deployment Center
4. Configure GitHub Actions or Azure DevOps

## Environment Variables
Make sure to update the following environment variables in Azure Portal:

### Frontend
- VITE_API_URL
- VITE_AI_SERVICE_URL

### Backend
- DATABASE_URL
- ML_SERVICE_URL

## Monitoring
1. Application Insights
2. Container Logs
3. Performance Metrics

## Scaling
- Configure auto-scaling rules in Azure Portal
- Set up load balancing if needed

## Backup
- Configure automated backups for PostgreSQL
- Set up storage account for AI model backups

## Security
1. Enable HTTPS
2. Configure firewall rules
3. Set up managed identities
4. Enable Azure Security Center

## Troubleshooting
1. Check container logs
2. Monitor application insights
3. Verify environment variables
4. Check database connectivity 