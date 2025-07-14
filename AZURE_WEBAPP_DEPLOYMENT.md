# Azure Web App Services Deployment Guide

## Prerequisites
1. Azure Account
2. Azure CLI installed
3. Node.js installed (for frontend)
4. Python installed (for backend and AI service)

## Deployment Steps

### 1. Login to Azure
```bash
az login
```

### 2. Create Resource Group
```bash
az group create --name raven-app-rg --location southeastasia
```

### 3. Create App Service Plans
```bash
# Frontend Plan (Node.js)
az appservice plan create \
    --name raven-frontend-plan \
    --resource-group raven-app-rg \
    --sku P1V2 \
    --is-linux

# Backend Plan (Python)
az appservice plan create \
    --name raven-backend-plan \
    --resource-group raven-app-rg \
    --sku P1V2 \
    --is-linux

# AI Service Plan (Python)
az appservice plan create \
    --name raven-ai-plan \
    --resource-group raven-app-rg \
    --sku P1V2 \
    --is-linux
```

### 4. Create Web Apps
```bash
# Frontend Web App
az webapp create \
    --resource-group raven-app-rg \
    --plan raven-frontend-plan \
    --name raven-frontend \
    --runtime "NODE:18-lts"

# Backend Web App
az webapp create \
    --resource-group raven-app-rg \
    --plan raven-backend-plan \
    --name raven-backend \
    --runtime "PYTHON:3.9"

# AI Service Web App
az webapp create \
    --resource-group raven-app-rg \
    --plan raven-ai-plan \
    --name raven-ai \
    --runtime "PYTHON:3.9"
```

### 5. Configure Environment Variables

#### Frontend
```bash
az webapp config appsettings set \
    --resource-group raven-app-rg \
    --name raven-frontend \
    --settings \
    VITE_API_URL="https://raven-backend.azurewebsites.net" \
    VITE_AI_SERVICE_URL="https://raven-ai.azurewebsites.net"
```

#### Backend
```bash
az webapp config appsettings set \
    --resource-group raven-app-rg \
    --name raven-backend \
    --settings \
    DATABASE_URL="postgresql://postgres:password@raven-db.postgres.database.azure.com:5432/raven_db" \
    ML_SERVICE_URL="https://raven-ai.azurewebsites.net"
```

### 6. Deploy Code

#### Frontend Deployment
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Azure
az webapp deployment source config-local-git --name raven-frontend --resource-group raven-app-rg
git remote add azure <git-url-from-previous-command>
git push azure main
```

#### Backend Deployment
```bash
# Deploy backend
cd backend-api
az webapp deployment source config-local-git --name raven-backend --resource-group raven-app-rg
git remote add azure <git-url-from-previous-command>
git push azure main
```

#### AI Service Deployment
```bash
# Deploy AI service
cd ai-inference-service
az webapp deployment source config-local-git --name raven-ai --resource-group raven-app-rg
git remote add azure <git-url-from-previous-command>
git push azure main
```

### 7. Configure Database
```bash
# Create Azure Database for PostgreSQL
az postgres flexible-server create \
    --resource-group raven-app-rg \
    --name raven-db \
    --location southeastasia \
    --admin-user postgres \
    --admin-password <your-password> \
    --sku-name Standard_B1ms
```

## Application Configuration

### Frontend (Node.js)
1. Create `web.config` in frontend root:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <webSocket enabled="false" />
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    <httpErrors existingResponse="PassThrough" />
  </system.webServer>
</configuration>
```

### Backend (Python)
1. Create `web.config` in backend root:
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="PythonHandler" path="*" verb="*" modules="FastCgiModule" scriptProcessor="D:\Python39\python.exe|D:\Python39\wfastcgi.py" resourceType="Unspecified" requireAccess="Script" />
    </handlers>
  </system.webServer>
</configuration>
```

## Monitoring and Maintenance

### Application Insights
1. Enable Application Insights for each Web App
2. Configure logging and monitoring

### Scaling
1. Configure auto-scaling rules in Azure Portal
2. Set up load balancing if needed

### Backup
1. Configure automated backups
2. Set up database backups

### Security
1. Enable HTTPS
2. Configure firewall rules
3. Set up managed identities

## Troubleshooting
1. Check application logs in Azure Portal
2. Monitor Application Insights
3. Verify environment variables
4. Check database connectivity 