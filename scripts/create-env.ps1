# Create .env file for backend
$backendPath = Join-Path $PSScriptRoot "..\backend"
$envExample = Join-Path $backendPath "env.example"
$envFile = Join-Path $backendPath ".env"

if (Test-Path $envFile) {
    Write-Host ".env file already exists. Skipping creation." -ForegroundColor Yellow
    Write-Host "If you want to recreate it, delete it first." -ForegroundColor Yellow
} else {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "✓ Created .env file from env.example" -ForegroundColor Green
        Write-Host ""
        Write-Host "IMPORTANT: Edit backend\.env and configure:" -ForegroundColor Yellow
        Write-Host "  1. DB_PASSWORD - Your MySQL root password" -ForegroundColor Cyan
        Write-Host "  2. JWT_SECRET - Use: 07ae671ade93b9a0be21915d0a8b943c696b5da0eda243647ae374014d25a04f" -ForegroundColor Cyan
        Write-Host "  3. (Optional) Twilio credentials for SMS" -ForegroundColor Cyan
        Write-Host "  4. (Optional) SMTP credentials for Email" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "See backend\CONFIGURATION_GUIDE.md for details" -ForegroundColor Gray
    } else {
        Write-Host 'ERROR: env.example not found!' -ForegroundColor Red
        exit 1
    }
}


