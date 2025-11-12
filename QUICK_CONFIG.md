# Quick Configuration Guide

## ✅ Already Configured

- ✓ JWT_SECRET: Set with secure random key
- ✓ All dependencies installed
- ✓ Project structure ready

## 🔧 Required: Database Password

**Edit `backend/.env` and set your MySQL root password:**

```env
DB_PASSWORD=your_actual_mysql_password_here
```

**Then set up the database:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-database.ps1
```

This will:
- Create the database
- Create all tables
- Set up default admin user
- Update .env with your password

## 📧 Optional: Email & SMS Setup

### For Email (Gmail Example)

1. Go to https://myaccount.google.com/apppasswords
2. Generate an app password for "Mail"
3. Update `backend/.env`:
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_char_app_password
   ```

### For SMS (Twilio)

1. Sign up at https://www.twilio.com/try-twilio
2. Get credentials from Twilio Console
3. Update `backend/.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Note**: The system works without email/SMS, but notifications won't be sent.

## 🚀 Start Services

**Option 1: Automated (Recommended)**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-all.ps1
```

**Option 2: Manual**

Open 3 separate terminals:

**Terminal 1 - Backend:**
```powershell
cd backend
npm start
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```

**Terminal 3 - QR Generator:**
```powershell
cd qr-generator
.\venv\Scripts\Activate.ps1
python app.py
```

## 🌐 Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **QR Service**: http://localhost:5001
- **Health Check**: http://localhost:5000/health

## 🔑 Default Login

After database setup:
- **Email**: admin@coffeetraining.com
- **Password**: admin123

⚠️ **Change this password immediately after first login!**

## ✅ Verification Checklist

- [ ] Database password set in `backend/.env`
- [ ] Database created (run setup-database.ps1)
- [ ] All services start without errors
- [ ] Can access frontend at http://localhost:3000
- [ ] Can login with admin credentials
- [ ] (Optional) Email configured for notifications
- [ ] (Optional) SMS configured for notifications

## 📚 Need Help?

- See [SETUP_STATUS.md](SETUP_STATUS.md) for detailed status
- See [docs/SETUP.md](docs/SETUP.md) for full setup guide
- See [backend/CONFIGURATION_GUIDE.md](backend/CONFIGURATION_GUIDE.md) for configuration details

