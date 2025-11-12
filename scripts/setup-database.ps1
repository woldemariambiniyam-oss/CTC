# Database Setup Script
Write-Host "Coffee Training Center - Database Setup" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

$dbPassword = Read-Host "Enter MySQL root password (press Enter if no password)"
$schemaFile = Join-Path $PSScriptRoot "..\database\schema.sql"

if (-not (Test-Path $schemaFile)) {
    Write-Host "ERROR: schema.sql not found at $schemaFile" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Setting up database..." -ForegroundColor Yellow

if ($dbPassword) {
    $mysqlCmd = "mysql -u root -p$dbPassword"
} else {
    $mysqlCmd = "mysql -u root"
}

try {
    # Test connection first
    if ($dbPassword) {
        $testResult = & mysql -u root -p$dbPassword -e "SELECT 1;" 2>&1
    } else {
        $testResult = & mysql -u root -e "SELECT 1;" 2>&1
    }
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERROR: Cannot connect to MySQL. Please check:" -ForegroundColor Red
        Write-Host "  1. MySQL is running" -ForegroundColor Yellow
        Write-Host "  2. Password is correct" -ForegroundColor Yellow
        Write-Host "  3. MySQL is in your PATH" -ForegroundColor Yellow
        exit 1
    }
    
    # Create database
    Write-Host "Creating database and tables..." -ForegroundColor Yellow
    if ($dbPassword) {
        Get-Content $schemaFile | & mysql -u root -p$dbPassword 2>&1
    } else {
        Get-Content $schemaFile | & mysql -u root 2>&1
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database setup completed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Default admin account:" -ForegroundColor Cyan
        Write-Host "  Email: admin@coffeetraining.com" -ForegroundColor White
        Write-Host "  Password: admin123" -ForegroundColor White
        Write-Host ""
        Write-Host "⚠ IMPORTANT: Change the admin password after first login!" -ForegroundColor Yellow
        
        # Update .env file with password
        $envFile = Join-Path $PSScriptRoot "..\backend\.env"
        if (Test-Path $envFile) {
            if ($dbPassword) {
                (Get-Content $envFile) -replace 'DB_PASSWORD=', "DB_PASSWORD=$dbPassword" | Set-Content $envFile
                Write-Host "✓ Updated DB_PASSWORD in backend\.env" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "ERROR: Database setup failed. Check MySQL error messages above." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

