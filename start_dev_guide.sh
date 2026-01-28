#!/bin/bash
echo "Starting Databases and Backends with Docker Compose..."
docker-compose up -d

echo "Waiting for backends to initialize..."
sleep 10

echo "Installing Kiosk UI Dependencies..."
cd apps/kiosk-ui && npm install && cd ../..

echo "Installing Web Portal Dependencies..."
cd apps/web-portal && npm install && cd ../..

echo "=================================================="
echo "GINHAWA DEVELOPMENT ENVIRONMENT"
echo "=================================================="
echo "1. Backends are running in Docker:"
echo "   - Kiosk Backend: http://localhost:8000"
echo "   - Cloud Backend: http://localhost:8001"
echo "   - Adminer (DB GUI): http://localhost:8080"
echo ""
echo "2. Run the Frontends in separate terminals:"
echo "   [Terminal A] Kiosk UI:"
echo "   cd apps/kiosk-ui && npm run dev"
echo "   (Access at http://localhost:3000)"
echo ""
echo "   [Terminal B] Web Portal:"
echo "   cd apps/web-portal && npm run dev -- -p 3001"
echo "   (Access at http://localhost:3001)"
echo "=================================================="
