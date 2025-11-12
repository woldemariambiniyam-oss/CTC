#!/bin/bash
# Start All Services Script (Linux/Mac)

echo "Coffee Training Center - Starting All Services"
echo "============================================="
echo ""

ROOT_PATH="$(cd "$(dirname "$0")/.." && pwd)"

# Check if .env exists
if [ ! -f "$ROOT_PATH/backend/.env" ]; then
    echo "ERROR: backend/.env not found!"
    echo "Run: bash scripts/create-env.sh first"
    exit 1
fi

echo "Starting services..."
echo ""

# Start Backend
echo "1. Starting Backend (Port 5000)..."
cd "$ROOT_PATH/backend"
npm start &
BACKEND_PID=$!

sleep 3

# Start Frontend
echo "2. Starting Frontend (Port 3000)..."
cd "$ROOT_PATH/frontend"
npm run dev &
FRONTEND_PID=$!

sleep 3

# Start QR Generator
echo "3. Starting QR Generator (Port 5001)..."
cd "$ROOT_PATH/qr-generator"
source venv/bin/activate
python app.py &
QR_PID=$!

echo ""
echo "✓ All services started!"
echo ""
echo "Services running:"
echo "  - Backend:    http://localhost:5000"
echo "  - Frontend:   http://localhost:3000"
echo "  - QR Service: http://localhost:5001"
echo ""
echo "PIDs: Backend=$BACKEND_PID, Frontend=$FRONTEND_PID, QR=$QR_PID"
echo ""
echo "Default login:"
echo "  Email: admin@coffeetraining.com"
echo "  Password: admin123"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for user interrupt
trap "kill $BACKEND_PID $FRONTEND_PID $QR_PID 2>/dev/null; exit" INT
wait

