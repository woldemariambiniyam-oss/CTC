# Start All Services Script
Write-Host "Coffee Training Center - Starting All Services" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

$rootPath = Split-Path -Parent $PSScriptRoot

# Check if .env exists
$envFile = Join-Path $rootPath "backend\.env"
if (-not (Test-Path $envFile)) {
    Write-Host "ERROR: backend\.env not found!" -ForegroundColor Red
    Write-Host "Run: scripts\create-env.ps1 first" -ForegroundColor Yellow
    exit 1
}

# Check database password is set
$envContent = Get-Content $envFile -Raw
if ($envContent -match 'DB_PASSWORD=your_password' -or $envContent -match 'DB_PASSWORD=$') {
    Write-Host "WARNING: DB_PASSWORD not configured in backend\.env" -ForegroundColor Yellow
    Write-Host "The backend may fail to connect to the database." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit 1
    }
}

Write-Host "Starting services in separate windows..." -ForegroundColor Yellow
Write-Host ""

# Start Backend
Write-Host "1. Starting Backend (Port 5000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\backend'; npm start" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start Frontend
Write-Host "2. Starting Frontend (Port 3000)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\frontend'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

# Start QR Generator
Write-Host "3. Starting QR Generator (Port 5001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootPath\qr-generator'; .\venv\Scripts\Activate.ps1; python app.py" -WindowStyle Normal

Write-Host ""
Write-Host "✓ All services started!" -ForegroundColor Green
Write-Host ""
Write-Host "Services running:" -ForegroundColor Cyan
Write-Host "  - Backend:    http://localhost:5000" -ForegroundColor White
Write-Host "  - Frontend:   http://localhost:3000" -ForegroundColor White
Write-Host "  - QR Service: http://localhost:5001" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the services." -ForegroundColor Yellow
Write-Host ""
Write-Host "Default login:" -ForegroundColor Cyan
Write-Host "  Email: admin@coffeetraining.com" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White

