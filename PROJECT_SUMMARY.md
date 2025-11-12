# Coffee Training Center Management System - Project Summary

## Overview

A comprehensive web-based training center management system designed for the Coffee Training Center. The system manages trainee registration, training sessions, examinations, certificates, and provides analytics and reporting capabilities.

## Technology Stack

### Frontend
- **React.js 18.2** - Modern UI framework
- **React Router 6** - Client-side routing
- **Tailwind CSS 3** - Utility-first CSS framework
- **Chart.js 4** - Data visualization
- **Vite** - Build tool and dev server
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js 4** - Web framework
- **MySQL2** - Database driver
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Nodemailer** - Email service
- **Twilio** - SMS service

### Database
- **MySQL 8+** - Relational database

### Additional Services
- **Python 3.8+** - QR code generation service
- **Flask** - QR service framework
- **qrcode** - QR code library

## System Architecture

### Three-Tier Architecture
1. **Presentation Layer**: React.js frontend
2. **Application Layer**: Node.js/Express backend
3. **Data Layer**: MySQL database

### External Integrations
- Twilio API for SMS notifications
- SMTP server for email notifications
- Python-based QR code generation service

## Key Features Implemented

### 1. User Management
- ✅ User registration and authentication
- ✅ JWT-based session management
- ✅ Role-based access control (Trainee, Trainer, Admin)
- ✅ Password hashing and security

### 2. Training Session Management
- ✅ Create and manage training sessions
- ✅ Session enrollment with capacity tracking
- ✅ Attendance tracking
- ✅ Session status management

### 3. Queue Management
- ✅ Join queue for sessions
- ✅ Queue position tracking
- ✅ Process queue (admin/trainer)
- ✅ Real-time queue updates

### 4. Examination System
- ✅ Create exams with multiple question types
- ✅ Exam attempt management
- ✅ Automatic grading
- ✅ Score calculation and pass/fail determination
- ✅ Exam history tracking

### 5. Certificate Management
- ✅ Certificate generation
- ✅ Unique certificate numbers
- ✅ QR code integration for verification
- ✅ Certificate expiry tracking
- ✅ Public verification endpoint

### 6. Notification System
- ✅ Email notifications (SMTP)
- ✅ SMS notifications (Twilio)
- ✅ Registration confirmations
- ✅ Exam reminders
- ✅ Certificate issuance notifications

### 7. Reporting & Analytics
- ✅ Dashboard statistics
- ✅ Attendance reports
- ✅ Performance analytics
- ✅ Enrollment trends
- ✅ Certificate statistics
- ✅ Interactive charts (Chart.js)

### 8. PDF Export
- ✅ Certificate PDF generation
- ✅ Report PDF export
- ✅ HTML to PDF conversion

## Database Schema

### Core Tables
- `users` - User accounts and profiles
- `training_sessions` - Training session details
- `session_enrollments` - Enrollment records
- `queue_entries` - Queue management
- `examinations` - Exam definitions
- `exam_questions` - Exam questions
- `exam_attempts` - Exam attempts
- `exam_answers` - Answer records
- `certificates` - Certificate records
- `notifications` - Notification history
- `system_settings` - System configuration

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - User registration
- `POST /login` - User login
- `GET /me` - Get current user

### Sessions (`/api/sessions`)
- `GET /` - List sessions
- `GET /:id` - Get session details
- `POST /` - Create session (admin/trainer)
- `POST /:id/enroll` - Enroll in session
- `GET /my/enrollments` - Get my enrollments

### Queue (`/api/queue`)
- `POST /join/:sessionId` - Join queue
- `GET /session/:sessionId` - Get queue
- `GET /my/queues` - Get my queues
- `POST /process/:sessionId` - Process queue (admin/trainer)
- `DELETE /leave/:queueId` - Leave queue

### Exams (`/api/exams`)
- `GET /` - List exams
- `GET /:id` - Get exam details
- `POST /` - Create exam (admin/trainer)
- `POST /:id/questions` - Add question (admin/trainer)
- `POST /:id/start` - Start exam
- `POST /:id/submit` - Submit exam
- `GET /my/attempts` - Get my attempts

### Certificates (`/api/certificates`)
- `POST /generate` - Generate certificate (admin/trainer)
- `GET /my` - Get my certificates
- `GET /` - Get all certificates (admin/trainer)
- `GET /verify/:certificateNumber` - Verify certificate (public)

### Reports (`/api/reports`)
- `GET /dashboard` - Dashboard statistics
- `GET /attendance` - Attendance reports (admin/trainer)
- `GET /performance` - Performance reports (admin/trainer)
- `GET /enrollment-trends` - Enrollment trends (admin/trainer)
- `GET /certificates` - Certificate statistics (admin/trainer)

### PDF (`/api/pdf`)
- `GET /certificate/:certificateId` - Generate certificate PDF
- `POST /report` - Generate report PDF (admin/trainer)

## Frontend Pages

1. **Login** - User authentication
2. **Register** - New user registration
3. **Dashboard** - Overview statistics
4. **Sessions** - Training session management
5. **Queue** - Queue management
6. **Exams** - Examination interface
7. **Exam Take** - Exam taking interface
8. **Certificates** - Certificate management
9. **Certificate Verify** - Public certificate verification
10. **Reports** - Analytics and reports

## Security Features

- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention
- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting
- ✅ Role-based authorization
- ✅ Secure error handling

## File Structure

```
CTC/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── sessions.js
│   │   ├── queue.js
│   │   ├── exams.js
│   │   ├── certificates.js
│   │   ├── reports.js
│   │   └── pdf.js
│   ├── services/
│   │   ├── notificationService.js
│   │   ├── qrService.js
│   │   └── pdfService.js
│   ├── server.js
│   ├── package.json
│   └── env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   └── PrivateRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sessions.jsx
│   │   │   ├── Queue.jsx
│   │   │   ├── Exams.jsx
│   │   │   ├── ExamTake.jsx
│   │   │   ├── Certificates.jsx
│   │   │   ├── CertificateVerify.jsx
│   │   │   └── Reports.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── schema.sql
│   └── ERD.md
├── qr-generator/
│   ├── app.py
│   └── requirements.txt
└── docs/
    ├── ARCHITECTURE.md
    ├── API.md
    ├── SETUP.md
    ├── FEATURES.md
    ├── TESTING.md
    └── DEPLOYMENT.md
```

## Development Status

### ✅ Completed
- System architecture design
- Database schema and ERD
- Backend API implementation
- Frontend React application
- Authentication and authorization
- Queue management
- Notification integration (SMS & Email)
- QR code generation
- Reporting dashboard
- PDF export functionality
- Documentation

### 🔄 Future Enhancements
- Real-time notifications (WebSocket)
- File upload for certificates
- Advanced search and filtering
- Bulk operations
- Email templates customization
- Multi-language support
- Mobile app
- Advanced analytics
- Automated testing suite

## Getting Started

1. **Quick Start**: See [QUICKSTART.md](QUICKSTART.md)
2. **Detailed Setup**: See [docs/SETUP.md](docs/SETUP.md)
3. **API Documentation**: See [docs/API.md](docs/API.md)
4. **Features**: See [docs/FEATURES.md](docs/FEATURES.md)

## Default Credentials

After database setup:
- **Email**: admin@coffeetraining.com
- **Password**: admin123

⚠️ **Change immediately in production!**

## Support & Documentation

- **Architecture**: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- **API Reference**: [docs/API.md](docs/API.md)
- **Setup Guide**: [docs/SETUP.md](docs/SETUP.md)
- **Testing Guide**: [docs/TESTING.md](docs/TESTING.md)
- **Deployment Guide**: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## License

MIT License - See LICENSE file for details

---

**Project Status**: ✅ Complete and Ready for Deployment

**Last Updated**: 2024

