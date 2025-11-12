# Coffee Training Center Management System

A comprehensive web-based training center management system built with React.js, Node.js, Express, and MySQL.

## Technology Stack

- **Frontend**: React.js with React Router
- **Backend**: Node.js with Express
- **Database**: MySQL
- **Notifications**: Twilio API (SMS), SMTP (Email)
- **QR Code Generation**: Python-based solution
- **Visualization**: Chart.js
- **PDF Export**: ReportLab

## Project Structure

```
CTC/
├── backend/          # Node.js/Express backend
├── frontend/         # React.js frontend
├── database/         # MySQL schema and migrations
├── qr-generator/     # Python QR code service
└── docs/            # Documentation and diagrams
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- MySQL (v8+)
- Python (v3.8+)
- npm or yarn

### Installation

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Configure .env with your database and API credentials
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create database
   mysql -u root -p < database/schema.sql
   ```

4. **QR Generator Setup**
   ```bash
   cd qr-generator
   pip install -r requirements.txt
   ```

### Running the Application

1. Start MySQL database
2. Start backend server: `cd backend && npm start`
3. Start frontend: `cd frontend && npm start`
4. Start QR generator service: `cd qr-generator && python app.py`

## Environment Variables

See `env.example` file in backend directory for required environment variables.

## Quick Setup

For automated setup, use the provided scripts:
- **Linux/Mac**: `bash scripts/setup.sh`
- **Windows**: `scripts\setup.bat`

Or follow the detailed instructions in [QUICKSTART.md](QUICKSTART.md) or [docs/SETUP.md](docs/SETUP.md).

## Features

- User authentication and authorization
- Trainee registration and management
- Training session scheduling
- Queue management system
- Examination interface
- Certificate generation with QR codes
- SMS and Email notifications
- Analytics dashboard
- PDF report generation

## API Documentation

See `docs/API.md` for detailed API endpoint documentation.

## Documentation

- [Quick Start Guide](QUICKSTART.md) - Get started in 5 minutes
- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [API Documentation](docs/API.md) - Complete API reference
- [Features](docs/FEATURES.md) - Feature documentation
- [Architecture](docs/ARCHITECTURE.md) - System architecture
- [Testing Guide](docs/TESTING.md) - Testing instructions
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- [Project Summary](PROJECT_SUMMARY.md) - Complete project overview

## License

MIT


