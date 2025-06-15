#!/bin/bash

# Azure Resource Group
RESOURCE_GROUP="raven-app-rg"
LOCATION="southeastasia"

# Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plans
az appservice plan create \
    --name "raven-frontend-plan" \
    --resource-group $RESOURCE_GROUP \
    --sku P1V2 \
    --is-linux

az appservice plan create \
    --name "raven-backend-plan" \
    --resource-group $RESOURCE_GROUP \
    --sku P1V2 \
    --is-linux

az appservice plan create \
    --name "raven-ai-plan" \
    --resource-group $RESOURCE_GROUP \
    --sku P1V2 \
    --is-linux

# Create Web Apps
az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan "raven-frontend-plan" \
    --name "raven-frontend" \
    --deployment-container-image-name "raven-frontend:latest"

az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan "raven-backend-plan" \
    --name "raven-backend" \
    --deployment-container-image-name "raven-backend:latest"

az webapp create \
    --resource-group $RESOURCE_GROUP \
    --plan "raven-ai-plan" \
    --name "raven-ai" \
    --deployment-container-image-name "raven-ai:latest"

# Configure environment variables for Frontend
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name "raven-frontend" \
    --settings \
    VITE_API_URL="https://raven-backend.azurewebsites.net" \
    VITE_AI_SERVICE_URL="https://raven-ai.azurewebsites.net"

# Configure environment variables for Backend
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name "raven-backend" \
    --settings \
    DATABASE_URL="postgresql://postgres:password@raven-db.postgres.database.azure.com:5432/raven_db" \
    ML_SERVICE_URL="https://raven-ai.azurewebsites.net"

# Enable container logging
az webapp log config \
    --resource-group $RESOURCE_GROUP \
    --name "raven-frontend" \
    --docker-container-logging filesystem

az webapp log config \
    --resource-group $RESOURCE_GROUP \
    --name "raven-backend" \
    --docker-container-logging filesystem

az webapp log config \
    --resource-group $RESOURCE_GROUP \
    --name "raven-ai" \
    --docker-container-logging filesystem 