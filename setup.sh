#!/bin/bash

# AgroNavis - Docker Setup Script
echo "🌾 Setting up AgroNavis with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install docker-compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration values before running the containers."
    echo "   - Update SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY"
    echo "   - Update WEATHER_API_KEY with your OpenWeather API key"
    echo "   - Update JWT_SECRET with a secure random string (min 32 chars)"
    read -p "Press enter to continue after updating .env file..."
fi

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p backend/ml-service/data/input
mkdir -p backend/ml-service/data/output
mkdir -p backend/ml-service/models

# Stop any running containers
echo "🛑 Stopping any running containers..."
docker-compose down

# Build and start all services
echo "🔨 Building and starting all services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check service status
echo "🔍 Checking service status..."
docker-compose ps

# Show logs if there are any issues
echo ""
echo "📋 Service URLs:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:3001"
echo "  ML Service: http://localhost:8000"
echo "  PostgreSQL: localhost:5432"
echo ""
echo "🎯 Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Check logs with: docker-compose logs -f [service-name]"
echo "  3. Stop services with: docker-compose down"
echo ""
echo "✅ Setup complete! Your AgroNavis app is running."