# Multi-stage build for all MeetMind services
# Deploys Frontend + Backend + Vector Service together on HF Spaces

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
ENV VITE_API_URL=/api

# Build without TypeScript check (faster)
RUN npm run build -- --mode production || npm run build

# Stage 2: Main image with all services
FROM python:3.11-slim

# Install Node.js, Nginx, and Supervisor
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    g++ \
    nginx \
    supervisor \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (vector service)
COPY vector-service/requirements.txt ./vector-requirements.txt
RUN pip install --no-cache-dir -r vector-requirements.txt

# Install Node.js dependencies (backend)
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production

# Copy application code
WORKDIR /app
COPY backend/ ./backend/
COPY vector-service/ ./vector-service/
COPY --from=frontend-builder /build/dist ./frontend/dist

# Configure Nginx
COPY deploy/nginx-all.conf /etc/nginx/sites-available/default
RUN rm -f /etc/nginx/sites-enabled/default && \
    ln -s /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default

# Configure Supervisor
COPY deploy/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Create log directories
RUN mkdir -p /var/log/supervisor /var/log/nginx

# Environment variables (can be overridden in HF Spaces settings)
ENV PORT=3001 \
    VECTOR_SERVICE_URL=http://localhost:8000 \
    NODE_ENV=production \
    WHISPER_MODEL=small \
    WHISPER_DEVICE=auto \
    WHISPER_COMPUTE_TYPE=int8 \
    MAX_AUDIO_FILE_MB=100

# Expose HF Spaces required port
EXPOSE 7860

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
  CMD curl -f http://localhost:7860/health || exit 1

# Start all services with supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
