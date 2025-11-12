# Quick Start Guide

Get the Coffee Training Center Management System up and running in minutes!

## Prerequisites Check

Before starting, ensure you have:
- ✅ Node.js (v16+) installed
- ✅ MySQL (v8+) installed and running
- ✅ Python (v3.8+) installed
- ✅ npm or yarn installed

## Quick Setup (5 Steps)

### Step 1: Database Setup
```bash
# Create database
mysql -u root -p < database/schema.sql
```

### Step 2: Backend Setup
```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database credentials
npm start
```

### Step 3: Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

### Step 4: QR Service Setup (New Terminal)
```bash
cd qr-generator
pip install -r requirements.txt
python app.py
```

### Step 5: Access Application
Open your browser and navigate to:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **QR Service**: http://localhost:5001

## Default Login

After database setup, you can login with:
- **Email**: admin@coffeetraining.com
- **Password**: admin123

⚠️ **Important**: Change this password immediately after first login!

## First Steps

1. **Login** with the default admin account
2. **Create a Training Session** from the Sessions page
3. **Register a Trainee** account (or use registration page)
4. **Enroll in Session** as the trainee
5. **Create an Exam** for the session
6. **Take the Exam** as the trainee
7. **Generate Certificate** after passing the exam

## Configuration

### Minimal Configuration (Required)
Edit `backend/.env`:
```env
DB_PASSWORD=your_mysql_password
JWT_SECRET=any_random_string_for_development
```

### Full Configuration (Optional)
For SMS and Email notifications, configure:
- Twilio credentials (SMS)
- SMTP credentials (Email)

See `backend/env.example` for all options.

## Troubleshooting

### Port Already in Use
If ports 3000, 5000, or 5001 are in use:
- Change ports in configuration files
- Or stop the service using those ports

### Database Connection Error
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `backend/.env`
- Ensure database exists: `SHOW DATABASES;`

### Module Not Found
- Run `npm install` in backend and frontend directories
- Run `pip install -r requirements.txt` in qr-generator

## Next Steps

- Read [SETUP.md](docs/SETUP.md) for detailed setup instructions
- Read [FEATURES.md](docs/FEATURES.md) to understand all features
- Read [API.md](docs/API.md) for API documentation
- Read [TESTING.md](docs/TESTING.md) for testing guidelines
- Read [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production deployment

## Need Help?

- Check the documentation in the `docs/` folder
- Review error messages in the console
- Verify all services are running
- Check environment variables are set correctly

## Project Structure

```
CTC/
├── backend/          # Node.js/Express API
├── frontend/         # React.js application
├── database/         # MySQL schema
├── qr-generator/     # Python QR service
└── docs/            # Documentation
```

Happy Training! ☕


