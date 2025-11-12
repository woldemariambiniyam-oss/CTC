#!/bin/bash

# Coffee Training Center - Setup Script
# This script helps set up the development environment

echo "☕ Coffee Training Center - Setup Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo -e "${GREEN}✓${NC} Node.js installed: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js v16+"
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    echo -e "${GREEN}✓${NC} MySQL installed"
else
    echo -e "${YELLOW}⚠${NC} MySQL not found. Please ensure MySQL is installed and running"
fi

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python installed: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python3 not found. Please install Python 3.8+"
    exit 1
fi

echo ""
echo "Setting up backend..."
cd backend
if [ ! -f ".env" ]; then
    if [ -f "env.example" ]; then
        cp env.example .env
        echo -e "${YELLOW}⚠${NC} Created .env file. Please configure it with your settings."
    else
        echo -e "${RED}✗${NC} env.example not found"
    fi
else
    echo -e "${GREEN}✓${NC} .env file already exists"
fi

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${GREEN}✓${NC} Backend dependencies already installed"
fi

cd ..

echo ""
echo "Setting up frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${GREEN}✓${NC} Frontend dependencies already installed"
fi

cd ..

echo ""
echo "Setting up QR generator..."
cd qr-generator
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

if [ ! -d "uploads" ]; then
    mkdir uploads
    echo -e "${GREEN}✓${NC} Created uploads directory"
fi

echo "Installing Python dependencies..."
source venv/bin/activate 2>/dev/null || . venv/bin/activate
pip install -r requirements.txt
echo -e "${GREEN}✓${NC} QR generator dependencies installed"
deactivate 2>/dev/null

cd ..

echo ""
echo -e "${GREEN}✓${NC} Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure backend/.env with your database and API credentials"
echo "2. Set up the database: mysql -u root -p < database/schema.sql"
echo "3. Start the services:"
echo "   - Backend: cd backend && npm start"
echo "   - Frontend: cd frontend && npm run dev"
echo "   - QR Service: cd qr-generator && source venv/bin/activate && python app.py"
echo ""
echo "See QUICKSTART.md for more details."

