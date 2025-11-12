# System Architecture

## Overview

The Coffee Training Center Management System follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│                    (React.js + React Router)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │ Dashboard│  │  Queue   │  │  Exams   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Certificates│ │ Reports │  │  Charts  │  │  PDF     │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Backend Layer                           │
│              (Node.js + Express + JWT)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Auth   │  │  Queue   │  │  Exams   │  │  Notify  │    │
│  │Middleware│  │  Service │  │  Service │  │  Service │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Certificate│ │  Report  │  │   QR     │  │   PDF    │    │
│  │  Service  │ │  Service │  │ Generator│  │ Generator│    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ SQL Queries
                            │
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│                         (MySQL)                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Users   │  │ Sessions │  │  Exams   │  │Certificates│   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ External APIs
                            │
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  Twilio  │  │   SMTP   │  │   QR     │                  │
│  │   SMS    │  │  Email   │  │  Service │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

## Component Interactions

1. **Frontend → Backend**: RESTful API calls using Axios/Fetch
2. **Backend → Database**: MySQL connection pool with Sequelize or raw queries
3. **Backend → External Services**: HTTP requests to Twilio API, SMTP server, and Python QR service
4. **Authentication**: JWT tokens stored in HTTP-only cookies or localStorage

## Data Flow

### User Registration Flow
1. User submits registration form (Frontend)
2. Frontend sends POST request to `/api/auth/register`
3. Backend validates data and creates user in database
4. Backend sends welcome email via SMTP
5. Backend sends SMS confirmation via Twilio
6. Backend returns success response with JWT token

### Certificate Generation Flow
1. Trainee completes exam (Frontend)
2. Frontend sends POST request to `/api/certificates/generate`
3. Backend creates certificate record in database
4. Backend calls Python QR service to generate QR code
5. Backend stores QR code URL in database
6. Backend sends certificate notification via email/SMS
7. Backend returns certificate data to frontend

## Security Considerations

- JWT tokens for authentication
- Password hashing with bcrypt
- SQL injection prevention with parameterized queries
- CORS configuration for frontend-backend communication
- Rate limiting on API endpoints
- Input validation and sanitization


