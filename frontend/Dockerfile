# Build stage
FROM node:24-alpine3.21 AS build

WORKDIR /app

# Install dependencies only when needed
COPY package.json package-lock.json ./
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy only necessary files for build
COPY . .

# Build app
RUN npm run build

# Production stage
FROM nginx:1.25-alpine AS production

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx config if present
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Set non-root user for security (optional, if permissions allow)
# USER nginx

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]