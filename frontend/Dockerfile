# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# ติดตั้ง dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build app
RUN npm run build

# Runtime stage
FROM nginx:alpine

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if needed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]