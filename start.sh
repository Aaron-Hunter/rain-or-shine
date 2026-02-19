#!/bin/bash

# Rain or Shine - Quick Start Script

echo "🌦️  Starting Rain or Shine services..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Stop any existing services
echo "🧹 Cleaning up existing services..."
docker stop $(docker ps -q --filter ancestor=maptiler/tileserver-gl:latest) 2>/dev/null
pkill -f "go run" 2>/dev/null

# Start TileServer GL
echo "🗺️  Starting TileServer GL on port 8080..."
cd map-data
docker run --rm -d \
  -v "$(pwd)/mbtiles:/data" \
  -p 8080:8080 \
  maptiler/tileserver-gl:latest
cd ..

sleep 2

# Start Go Backend
echo "🔧 Starting Go backend on port 8081..."
cd map-demo
go mod download
go mod tidy
go run . &
GO_PID=$!
cd ..

sleep 2

# Start Vite Frontend
echo "⚛️  Starting Vite frontend on port 5173..."
cd frontend
npm install
npm run dev &
VITE_PID=$!
cd ..

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Frontend:   http://localhost:5173"
echo "🗺️  TileServer: http://localhost:8080"
echo "🔧 Backend API: http://localhost:8081"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping services...'; kill $GO_PID $VITE_PID 2>/dev/null; docker stop \$(docker ps -q --filter ancestor=maptiler/tileserver-gl:latest) 2>/dev/null; echo '✅ All services stopped'; exit" INT

wait
