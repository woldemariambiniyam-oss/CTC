# Quick Test Guide - Enhanced Features

## 🧪 Testing the New Features

### 1. Test Two-Factor Authentication (2FA)

**Setup 2FA (as Admin/Trainer):**
```bash
# Login first to get token
POST /api/auth/login
{
  "email": "admin@coffeetraining.com",
  "password": "admin123"
}

# Setup 2FA
POST /api/two-factor/setup
Headers: Authorization: Bearer <token>

# Response includes QR code - scan with authenticator app
# Then verify:
POST /api/two-factor/verify
{
  "token": "123456"  # From authenticator app
}
```

**Test Login with 2FA:**
```bash
POST /api/auth/login
{
  "email": "admin@coffeetraining.com",
  "password": "admin123",
  "twoFactorToken": "123456"
}
```

### 2. Test Password Reset

```bash
# Request reset
POST /api/password-reset/request
{
  "email": "user@example.com"
}

# Verify token
GET /api/password-reset/verify/{token}

# Reset password
POST /api/password-reset/reset
{
  "token": "reset_token",
  "password": "new_password123"
}
```

### 3. Test Question Bank

```bash
# Create question
POST /api/question-bank
Headers: Authorization: Bearer <admin_token>
{
  "questionText": "What is coffee?",
  "questionType": "multiple_choice",
  "category": "coffee_processing",
  "skillLevel": "beginner",
  "options": ["A beverage", "A fruit", "A vegetable"],
  "correctAnswer": "A beverage",
  "points": 1.0
}

# Get random questions
POST /api/question-bank/random
{
  "count": 10,
  "category": "coffee_processing",
  "skillLevel": "beginner"
}
```

### 4. Test Rankings

```bash
# Calculate ranking for a trainee
POST /api/rankings/calculate/1
Headers: Authorization: Bearer <admin_token>
{
  "traineeId": 2
}

# Get leaderboard
GET /api/rankings/leaderboard/1?limit=10

# Get my ranking
GET /api/rankings/my/1
```

### 5. Test Certificate Collection

```bash
# Mark certificate as ready
POST /api/certificate-collection/ready/1
Headers: Authorization: Bearer <admin_token>

# Collect certificate (in-person)
POST /api/certificate-collection/collect/{referenceCode}
Headers: Authorization: Bearer <admin_token>
{
  "idDocumentType": "National ID",
  "idDocumentNumber": "ID123456"
}

# Check collection status
GET /api/certificate-collection/status/1
```

### 6. Test Public Verification

```bash
# Verify certificate (no auth required)
GET /api/public-verify/certificate/CTC-1234567890-ABCD1234

# Should return:
{
  "valid": true,
  "certificate": {
    "certificateNumber": "...",
    "traineeName": "...",
    "sessionTitle": "...",
    ...
  }
}
```

### 7. Test Communication Dashboard

```bash
# Get dashboard stats
GET /api/communication/dashboard
Headers: Authorization: Bearer <admin_token>

# Get notification logs
GET /api/communication/logs?status=sent&limit=50

# Broadcast to session
POST /api/communication/broadcast
{
  "sessionId": 1,
  "subject": "Important Update",
  "message": "Your session has been rescheduled"
}
```

### 8. Test Enhanced Reports

```bash
# Get trainer metrics
GET /api/reports/trainer-metrics?trainerId=1

# Custom report
POST /api/reports/custom
{
  "reportType": "attendance",
  "filters": {
    "sessionId": 1
  },
  "groupBy": "trainee",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  }
}
```

### 9. Test Audit Logs

All actions are automatically logged. To view (if you add an audit endpoint):

```bash
# View audit logs (would need to add endpoint)
# Currently logged automatically for:
# - Login attempts
# - Data updates
# - Certificate operations
# - All user actions
```

### 10. Test Session Management

- Login to the system
- Wait 30+ minutes without activity
- Try to access a protected endpoint
- Should receive "Session expired" error

## 🎯 Quick Verification Checklist

- [ ] Backend starts without errors
- [ ] Database connection successful
- [ ] Can login (with or without 2FA)
- [ ] 2FA setup works (admin/trainer)
- [ ] Password reset flow works
- [ ] Question bank CRUD works
- [ ] Rankings can be calculated
- [ ] Certificate collection workflow works
- [ ] Public verification works
- [ ] Communication dashboard accessible
- [ ] Enhanced reports work

## 🔍 Using Postman or curl

All endpoints can be tested using:
- **Postman**: Import the API endpoints
- **curl**: Use curl commands
- **Frontend**: Once UI is updated

## 📝 Notes

- Some features require admin/trainer roles
- 2FA is optional but recommended for security
- Session timeout is 30 minutes by default
- All actions are logged in audit_logs table

---

**Happy Testing!** 🚀

