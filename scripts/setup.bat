@echo off
REM Coffee Training Center - Setup Script (Windows)
REM This script helps set up the development environment

echo ☕ Coffee Training Center - Setup Script
echo ========================================
echo.

REM Check prerequisites
echo Checking prerequisites...

REM Check Node.js
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
    echo ✓ Node.js installed: %NODE_VERSION%
) else (
    echo ✗ Node.js not found. Please install Node.js v16+
    exit /b 1
)

REM Check Python
where python >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
    echo ✓ Python installed: %PYTHON_VERSION%
) else (
    echo ✗ Python not found. Please install Python 3.8+
    exit /b 1
)

echo.
echo Setting up backend...
cd backend
if not exist ".env" (
    if exist "env.example" (
        copy env.example .env
        echo ⚠ Created .env file. Please configure it with your settings.
    ) else (
        echo ✗ env.example not found
    )
) else (
    echo ✓ .env file already exists
)

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    echo ✓ Backend dependencies installed
) else (
    echo ✓ Backend dependencies already installed
)

cd ..

echo.
echo Setting up frontend...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    echo ✓ Frontend dependencies installed
) else (
    echo ✓ Frontend dependencies already installed
)

cd ..

echo.
echo Setting up QR generator...
cd qr-generator
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
)

if not exist "uploads" (
    mkdir uploads
    echo ✓ Created uploads directory
)

echo Installing Python dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo ✓ QR generator dependencies installed
call venv\Scripts\deactivate.bat

cd ..

echo.
echo ✓ Setup complete!
echo.
echo Next steps:
echo 1. Configure backend\.env with your database and API credentials
echo 2. Set up the database: mysql -u root -p ^< database\schema.sql
echo 3. Start the services:
echo    - Backend: cd backend ^&^& npm start
echo    - Frontend: cd frontend ^&^& npm run dev
echo    - QR Service: cd qr-generator ^&^& venv\Scripts\activate ^&^& python app.py
echo.
echo See QUICKSTART.md for more details.

pause

