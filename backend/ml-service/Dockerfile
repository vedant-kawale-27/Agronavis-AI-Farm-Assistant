# ML Service Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies including OpenCV dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libfontconfig1 \
    libgthread-2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY backend/ml-service/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY backend/ml-service/ .

# Create non-root user
RUN addgroup --system --gid 1001 mluser
RUN adduser --system --uid 1001 mluser

# Change ownership of the app directory
RUN chown -R mluser:mluser /app

USER mluser

# Expose the port
EXPOSE 8001

# Health check disabled temporarily for debugging
# HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
#   CMD curl -f http://localhost:8001/health || exit 1

# Run the application
CMD ["python", "main.py"]