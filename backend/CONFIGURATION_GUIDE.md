# Backend Configuration Guide

## Quick Setup

1. **Create .env file** (if not exists):
   ```bash
   copy env.example .env
   ```

2. **Edit .env file** with your settings:

### Required Configuration

```env
# Database - REQUIRED
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=coffee_training_center
DB_PORT=3306

# JWT - REQUIRED (use the generated secret below)
JWT_SECRET=07ae671ade93b9a0be21915d0a8b943c696b5da0eda243647ae374014d25a04f
JWT_EXPIRES_IN=7d
```

### Optional Configuration (Notifications)

#### For SMS (Twilio):
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
```
See [docs/TWILIO_SETUP.md](../docs/TWILIO_SETUP.md) for setup instructions.

#### For Email (SMTP):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Coffee Training Center
```
See [docs/SMTP_SETUP.md](../docs/SMTP_SETUP.md) for setup instructions.

## Generated JWT Secret

A secure JWT secret has been generated for you:
```
07ae671ade93b9a0be21915d0a8b943c696b5da0eda243647ae374014d25a04f
```

Copy this into your `.env` file for the `JWT_SECRET` value.

## Testing Configuration

After setting up `.env`, test the configuration:

1. **Test database connection**:
   ```bash
   node -e "require('dotenv').config(); const pool = require('./config/database'); pool.getConnection().then(() => { console.log('Database connected!'); process.exit(0); }).catch(err => { console.error('Database error:', err.message); process.exit(1); });"
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Check health endpoint**:
   ```bash
   curl http://localhost:5000/health
   ```

## Notes

- The system will work without Twilio/SMTP configured, but notifications won't be sent
- For development, you can leave Twilio/SMTP empty
- For production, configure both for full functionality


