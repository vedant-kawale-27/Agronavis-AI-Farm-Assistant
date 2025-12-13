#!/bin/bash

echo "🚀 Starting ML Service separately..."
echo "📍 Location: backend/ml-service"
echo "🌐 Port: 8001"
echo ""

# Navigate to ML service directory
cd backend/ml-service

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📋 Installing dependencies..."
pip install -r requirements.txt

# Start the ML service
echo "🚀 Starting ML service on port 8001..."
echo "🌐 Health check: http://localhost:8001/health"
echo "📖 API docs: http://localhost:8001/docs"
echo ""
echo "Press Ctrl+C to stop the service"
echo ""

python main.py