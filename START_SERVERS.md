# How to Start the Servers

## Quick Start

### Option 1: Use the Start Script (Recommended)
```powershell
.\scripts\start-all.ps1
```

### Option 2: Manual Start

#### 1. Start Backend Server
```powershell
cd backend
npm start
```
**Backend runs on:** http://localhost:5000

#### 2. Start Frontend Server (in a NEW terminal)
```powershell
cd frontend
npm run dev
```
**Frontend runs on:** http://localhost:3000

#### 3. Start QR Generator (optional, in a NEW terminal)
```powershell
cd qr-generator
python app.py
```
**QR Service runs on:** http://localhost:5001

## Access Points

- **Frontend (Main App):** http://localhost:3000
- **Backend API:** http://localhost:5000
- **Backend Health Check:** http://localhost:5000/health
- **Backend API Info:** http://localhost:5000/ (shows all endpoints)

## Troubleshooting

### Backend shows "Route not found" on root
- **Fixed!** The root route now shows API information
- If you still see 404, restart the backend server

### Frontend shows "Connection Refused"
1. Make sure the frontend server is running
2. Check the frontend terminal window for errors
3. Wait 10-15 seconds after starting (Vite needs time to compile)
4. Try accessing http://localhost:3000 again

### Port Already in Use
If you get "port already in use" errors:
1. Find and stop the process using the port:
   ```powershell
   # For port 5000 (backend)
   netstat -ano | findstr :5000
   # Kill the process ID shown
   
   # For port 3000 (frontend)
   netstat -ano | findstr :3000
   # Kill the process ID shown
   ```

2. Or change the port in:
   - Backend: `backend/.env` (PORT=5000)
   - Frontend: `frontend/vite.config.js` (server.port)

## Verification

After starting both servers:

1. **Check Backend:**
   - Visit: http://localhost:5000/health
   - Should show: `{"status":"ok","timestamp":"..."}`

2. **Check Frontend:**
   - Visit: http://localhost:3000
   - Should show the login page

3. **Test Login:**
   - Email: `admin@coffeetraining.com`
   - Password: `admin123`

## Notes

- Keep both terminal windows open while developing
- Backend must be running before frontend can make API calls
- Frontend uses Vite dev server with hot reload
- Backend uses nodemon (if installed) for auto-restart

