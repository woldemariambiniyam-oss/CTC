# Setup Guide

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- Python (v3.8 or higher)
- npm or yarn

## Installation Steps

### 1. Database Setup

1. Start MySQL server
2. Create the database:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
3. Or manually:
   ```sql
   mysql -u root -p
   CREATE DATABASE coffee_training_center;
   USE coffee_training_center;
   SOURCE database/schema.sql;
   ```

### 2. Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure `.env` with your settings:
   - Database credentials
   - JWT secret key
   - Twilio credentials (for SMS)
   - SMTP credentials (for email)
   - QR service URL

5. Start the backend server:
   ```bash
   npm start
   # or for development
   npm run dev
   ```

   Backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

### 4. QR Generator Service Setup

1. Navigate to qr-generator directory:
   ```bash
   cd qr-generator
   ```

2. Create virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the QR service:
   ```bash
   python app.py
   ```

   QR service will run on `http://localhost:5001`

## Configuration

### Environment Variables

#### Backend (.env)
- `DB_HOST`: MySQL host (default: localhost)
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: Database name
- `JWT_SECRET`: Secret key for JWT tokens
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio auth token
- `TWILIO_PHONE_NUMBER`: Twilio phone number
- `SMTP_HOST`: SMTP server host
- `SMTP_PORT`: SMTP server port
- `SMTP_USER`: SMTP username
- `SMTP_PASSWORD`: SMTP password
- `QR_SERVICE_URL`: QR generator service URL
- `FRONTEND_URL`: Frontend application URL

### Default Admin Account

After running the database schema, a default admin account is created:
- Email: `admin@coffeetraining.com`
- Password: `admin123` (change immediately!)

## Running the Application

1. Start MySQL database
2. Start QR generator service: `cd qr-generator && python app.py`
3. Start backend: `cd backend && npm start`
4. Start frontend: `cd frontend && npm run dev`

## Testing

### Backend API Testing

Use tools like Postman or curl to test API endpoints:

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env`
- Ensure database exists

### Port Conflicts
- Backend default: 5000
- Frontend default: 3000
- QR service default: 5001
- Change ports in configuration files if needed

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- Check CORS configuration in `backend/server.js`

### QR Code Service Issues
- Ensure Python dependencies are installed
- Check that port 5001 is available
- Verify `uploads` directory exists in `qr-generator/`

## Production Deployment

1. Set `NODE_ENV=production` in backend `.env`
2. Build frontend: `cd frontend && npm run build`
3. Use a process manager like PM2 for Node.js services
4. Configure reverse proxy (nginx) for production
5. Use environment-specific database credentials
6. Enable HTTPS
7. Configure proper CORS origins
8. Set up monitoring and logging


