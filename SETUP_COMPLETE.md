# 🎉 Setup Complete - Next Steps

## ✅ What's Been Done

1. **Environment Configuration**
   - ✓ Created `backend/.env` file
   - ✓ Configured secure JWT_SECRET
   - ✓ Set default configuration values

2. **Dependencies Installed**
   - ✓ Backend: All npm packages installed
   - ✓ Frontend: All npm packages installed  
   - ✓ QR Generator: Python packages installed in virtual environment

3. **Project Structure**
   - ✓ All directories created
   - ✓ QR generator uploads folder created
   - ✓ Configuration files ready

## 🔧 What You Need to Do

### Step 1: Configure Database Password (REQUIRED)

**Edit `backend/.env` file and change:**
```env
DB_PASSWORD=your_password
```
**To your actual MySQL root password:**
```env
DB_PASSWORD=your_actual_mysql_password
```

### Step 2: Set Up Database

Run the database setup script:
```powershell
powershell -ExecutionPolicy Bypass -File scripts\setup-database.ps1
```

This will:
- Create the `coffee_training_center` database
- Create all required tables
- Set up the default admin user
- Update `.env` with your password automatically

**OR manually:**
```bash
mysql -u root -p < database/schema.sql
```

### Step 3: (Optional) Configure Notifications

#### For Email Notifications:
1. Get Gmail App Password: https://myaccount.google.com/apppasswords
2. Update `backend/.env`:
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_char_app_password
   ```

#### For SMS Notifications:
1. Sign up at https://www.twilio.com/try-twilio
2. Get credentials from Twilio Console
3. Update `backend/.env`:
   ```env
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

**Note**: System works without these, but notifications won't be sent.

### Step 4: Start All Services

**Easiest way - Use the startup script:**
```powershell
powershell -ExecutionPolicy Bypass -File scripts\start-all.ps1
```

This opens 3 separate windows for:
- Backend (port 5000)
- Frontend (port 3000)
- QR Generator (port 5001)

**OR start manually in 3 terminals:**

**Terminal 1:**
```powershell
cd backend
npm start
```

**Terminal 2:**
```powershell
cd frontend
npm run dev
```

**Terminal 3:**
```powershell
cd qr-generator
.\venv\Scripts\Activate.ps1
python app.py
```

## 🌐 Access Your Application

Once all services are running:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **QR Service**: http://localhost:5001

## 🔑 Default Login Credentials

After database setup, you can login with:

- **Email**: `admin@coffeetraining.com`
- **Password**: `admin123`

⚠️ **IMPORTANT**: Change this password immediately after first login!

## ✅ Verification

After starting services, verify:

1. **Backend is running**: Visit http://localhost:5000/health
   - Should see: `{"status":"ok","timestamp":"..."}`

2. **Frontend is running**: Visit http://localhost:3000
   - Should see the login page

3. **QR Service is running**: Visit http://localhost:5001/health
   - Should see: `{"status":"ok"}`

4. **Database connection**: Check backend console for "Database connected successfully"

## 🧪 Test the System

1. **Login** with admin credentials
2. **Register a new trainee** account
3. **Create a training session** (as admin)
4. **Enroll in session** (as trainee)
5. **Create an exam** (as admin)
6. **Take the exam** (as trainee)
7. **Generate certificate** (as admin)
8. **View certificate** (as trainee)

## 📋 Current Configuration Status

| Item | Status | Action Needed |
|------|--------|---------------|
| JWT_SECRET | ✅ Configured | None |
| DB_PASSWORD | ⚠️ Needs Setup | Set your MySQL password |
| Database | ⚠️ Not Created | Run setup-database.ps1 |
| Twilio SMS | ⚠️ Optional | Configure if needed |
| SMTP Email | ⚠️ Optional | Configure if needed |
| Dependencies | ✅ Installed | None |
| Services | ⚠️ Not Started | Run start-all.ps1 |

## 📚 Documentation

- **[QUICK_CONFIG.md](QUICK_CONFIG.md)** - Quick reference
- **[SETUP_STATUS.md](SETUP_STATUS.md)** - Detailed status
- **[docs/SETUP.md](docs/SETUP.md)** - Full setup guide
- **[docs/TWILIO_SETUP.md](docs/TWILIO_SETUP.md)** - Twilio setup
- **[docs/SMTP_SETUP.md](docs/SMTP_SETUP.md)** - Email setup
- **[backend/CONFIGURATION_GUIDE.md](backend/CONFIGURATION_GUIDE.md)** - Config details

## ❓ Troubleshooting

### "Cannot connect to database"
- Check MySQL is running
- Verify DB_PASSWORD in `backend/.env`
- Test: `mysql -u root -p`

### "Port already in use"
- Stop other services using ports 3000, 5000, or 5001
- Or change ports in configuration files

### "Module not found"
- Run `npm install` in backend and frontend directories
- For QR service: activate venv and run `pip install -r requirements.txt`

### Services won't start
- Check all dependencies are installed
- Verify `.env` file exists in backend directory
- Check console for error messages

## 🎯 Quick Start Commands

```powershell
# 1. Set database password in backend\.env
# (Edit the file manually)

# 2. Set up database
powershell -ExecutionPolicy Bypass -File scripts\setup-database.ps1

# 3. Start all services
powershell -ExecutionPolicy Bypass -File scripts\start-all.ps1

# 4. Open browser
# http://localhost:3000
```

---

**You're almost there!** Just set the database password and start the services. 🚀

