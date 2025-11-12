# Setup Status

## ✅ Completed Steps

### 1. Environment Configuration
- [x] Created `backend/.env` file from template
- [x] Configured JWT_SECRET with secure random key
- [x] Set default values for all configuration options

### 2. Dependencies Installation
- [x] Backend dependencies installed (npm packages)
- [x] Frontend dependencies installed (npm packages)
- [x] QR Generator dependencies installed (Python packages)
- [x] Python virtual environment created

### 3. Project Structure
- [x] All directories created
- [x] QR generator uploads directory created
- [x] Configuration files in place

## ⚠️ Required Configuration

### Database Setup (REQUIRED)

**Option 1: Use Setup Script**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-database.ps1
```

**Option 2: Manual Setup**
1. Open MySQL command line or MySQL Workbench
2. Run the schema file:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Update `backend/.env` with your MySQL password:
   ```env
   DB_PASSWORD=your_mysql_password
   ```

### Optional: Twilio SMS Setup

1. Sign up at https://www.twilio.com/try-twilio
2. Get Account SID, Auth Token, and Phone Number
3. Update `backend/.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
4. See [docs/TWILIO_SETUP.md](docs/TWILIO_SETUP.md) for detailed instructions

### Optional: SMTP Email Setup

**For Gmail:**
1. Enable 2-Factor Authentication
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Update `backend/.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_char_app_password
   SMTP_FROM_EMAIL=your_email@gmail.com
   ```
4. See [docs/SMTP_SETUP.md](docs/SMTP_SETUP.md) for detailed instructions

## 🚀 Starting the Services

### Option 1: Use Startup Script (Recommended)
```powershell
# Windows
powershell -ExecutionPolicy Bypass -File scripts\start-all.ps1

# Linux/Mac
bash scripts/start-all.sh
```

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - QR Generator:**
```bash
cd qr-generator
# Windows
venv\Scripts\Activate.ps1
python app.py

# Linux/Mac
source venv/bin/activate
python app.py
```

## 📋 Current Configuration

### ✅ Configured
- JWT_SECRET: Set with secure random key
- Server ports: Default ports configured
- QR Service URL: http://localhost:5001
- Frontend URL: http://localhost:3000

### ⚠️ Needs Configuration
- DB_PASSWORD: **REQUIRED** - Set your MySQL root password
- TWILIO_ACCOUNT_SID: Optional - For SMS notifications
- TWILIO_AUTH_TOKEN: Optional - For SMS notifications
- TWILIO_PHONE_NUMBER: Optional - For SMS notifications
- SMTP_USER: Optional - For email notifications
- SMTP_PASSWORD: Optional - For email notifications

## 🧪 Testing the System

After starting all services:

1. **Access Frontend**: http://localhost:3000
2. **Test Backend API**: http://localhost:5000/health
3. **Test QR Service**: http://localhost:5001/health

### Default Login
- **Email**: admin@coffeetraining.com
- **Password**: admin123

⚠️ **IMPORTANT**: Change the admin password after first login!

## 📝 Next Steps

1. **Set up database** (if not done):
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\setup-database.ps1
   ```

2. **Configure database password** in `backend/.env`

3. **Start all services**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts\start-all.ps1
   ```

4. **Test the application**:
   - Register a new trainee account
   - Create a training session (as admin)
   - Enroll in the session (as trainee)
   - Create and take an exam
   - Generate a certificate

## 📚 Documentation

- [Quick Start Guide](QUICKSTART.md)
- [Setup Guide](docs/SETUP.md)
- [Configuration Guide](backend/CONFIGURATION_GUIDE.md)
- [Twilio Setup](docs/TWILIO_SETUP.md)
- [SMTP Setup](docs/SMTP_SETUP.md)
- [API Documentation](docs/API.md)

## ❓ Troubleshooting

### Backend won't start
- Check if port 5000 is available
- Verify database connection in `backend/.env`
- Check MySQL is running

### Frontend won't start
- Check if port 3000 is available
- Verify backend is running first
- Check for dependency errors

### QR Service won't start
- Verify Python virtual environment is activated
- Check if port 5001 is available
- Ensure uploads directory exists

### Database connection errors
- Verify MySQL is running
- Check DB_PASSWORD in `backend/.env`
- Test connection: `mysql -u root -p`

---

**Last Updated**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

