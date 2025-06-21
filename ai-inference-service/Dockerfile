FROM python:3.10-slim

# ติดตั้ง dependencies สำหรับ OpenCV และ ML libraries
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create logs directory
RUN mkdir -p /app/logs && chmod 777 /app/logs

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install -r requirements.txt

# Create model directory
RUN mkdir -p /app/model

# Copy source code and models (excluding .venv)
COPY . .

# Verify models exist
RUN ls -la /app/model && \
    echo "Verifying model files..." && \
    echo "All model files verified successfully"

# Environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    HOST=0.0.0.0 \
    PORT=8080 \
    LOG_LEVEL=INFO \
    MODEL_PATH=/app/model

# Enhanced health check with readiness probe
HEALTHCHECK --interval=30s --timeout=10s --start-period=300s --retries=3 \
  CMD curl -f http://localhost:8080/ready || exit 1

# รัน AI service
EXPOSE 8080
CMD ["python", "-u", "app.py"]