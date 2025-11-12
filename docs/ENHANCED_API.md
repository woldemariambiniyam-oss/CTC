# Enhanced API Documentation

## New Endpoints

### Two-Factor Authentication

#### POST `/api/two-factor/setup`
Setup 2FA for admin/trainer.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "secret": "base32_secret",
  "qrCodeUrl": "data:image/png;base64,...",
  "message": "Scan QR code with authenticator app and verify to enable 2FA"
}
```

#### POST `/api/two-factor/verify`
Verify and enable 2FA.

**Body**:
```json
{
  "token": "123456"
}
```

#### POST `/api/two-factor/disable`
Disable 2FA (requires verification token).

#### GET `/api/two-factor/status`
Check if 2FA is enabled.

---

### Password Reset

#### POST `/api/password-reset/request`
Request password reset.

**Body**:
```json
{
  "email": "user@example.com"
}
```

#### GET `/api/password-reset/verify/:token`
Verify reset token validity.

#### POST `/api/password-reset/reset`
Reset password.

**Body**:
```json
{
  "token": "reset_token",
  "password": "new_password"
}
```

---

### Rankings & Leaderboard

#### POST `/api/rankings/calculate/:sessionId`
Calculate ranking for a trainee.

**Body**:
```json
{
  "traineeId": 1
}
```

#### GET `/api/rankings/leaderboard/:sessionId`
Get leaderboard for a session.

**Query**: `?limit=10`

#### GET `/api/rankings/my/:sessionId`
Get my ranking for a session.

#### GET `/api/rankings/session/:sessionId`
Get all rankings for a session (admin/trainer).

#### POST `/api/rankings/recalculate/:sessionId`
Recalculate all rankings for a session.

---

### Question Bank

#### GET `/api/question-bank`
List questions with filters.

**Query**: `?category=coffee&skillLevel=beginner&search=text`

#### GET `/api/question-bank/:id`
Get single question.

#### POST `/api/question-bank`
Create question.

**Body**:
```json
{
  "questionText": "Question text",
  "questionType": "multiple_choice",
  "category": "coffee_processing",
  "skillLevel": "beginner",
  "options": ["Option A", "Option B", "Option C"],
  "correctAnswer": "Option A",
  "points": 1.0
}
```

#### PUT `/api/question-bank/:id`
Update question.

#### DELETE `/api/question-bank/:id`
Delete question.

#### POST `/api/question-bank/random`
Get random questions.

**Body**:
```json
{
  "count": 10,
  "category": "coffee_processing",
  "skillLevel": "intermediate"
}
```

---

### Certificate Collection

#### POST `/api/certificate-collection/ready/:certificateId`
Mark certificate as ready for collection (admin).

**Response**:
```json
{
  "message": "Certificate marked as ready for collection",
  "referenceCode": "CTC-1234567890-ABCD1234"
}
```

#### POST `/api/certificate-collection/collect/:referenceCode`
Collect certificate in-person (admin).

**Body**:
```json
{
  "idDocumentType": "National ID",
  "idDocumentNumber": "ID123456",
  "notes": "Optional notes"
}
```

#### GET `/api/certificate-collection/status/:certificateId`
Get collection status.

#### GET `/api/certificate-collection/my/ready`
Get my certificates ready for collection.

#### GET `/api/certificate-collection/pending`
Get all pending collections (admin).

---

### Public Verification

#### GET `/api/public-verify/certificate/:certificateNumber`
Verify certificate (public, no auth required).

**Response**:
```json
{
  "valid": true,
  "certificate": {
    "certificateNumber": "CTC-...",
    "traineeName": "John Doe",
    "sessionTitle": "Coffee Processing",
    "issueDate": "2024-01-01",
    "expiryDate": "2025-01-01",
    "status": "issued",
    "expired": false
  },
  "verificationDate": "2024-01-15T10:00:00Z",
  "verifiedBy": "Coffee Training Center Public Verification System"
}
```

#### GET `/api/public-verify/qr/:qrData`
QR code verification (redirects to certificate verification).

---

### Communication Dashboard

#### GET `/api/communication/dashboard`
Get communication statistics (admin/trainer).

**Query**: `?startDate=2024-01-01&endDate=2024-12-31`

#### GET `/api/communication/logs`
Get notification logs.

**Query**: `?status=sent&type=email&userId=1&limit=100`

#### POST `/api/communication/broadcast`
Broadcast notification to session trainees.

**Body**:
```json
{
  "sessionId": 1,
  "subject": "Important Update",
  "message": "Your session has been rescheduled"
}
```

#### GET `/api/communication/templates`
Get notification templates.

**Query**: `?language=en`

---

### Enhanced Reports

#### GET `/api/reports/trainer-metrics`
Get trainer evaluation metrics.

**Query**: `?trainerId=1&startDate=2024-01-01&endDate=2024-12-31`

#### POST `/api/reports/custom`
Custom report builder.

**Body**:
```json
{
  "reportType": "attendance",
  "filters": {
    "sessionId": 1,
    "traineeId": 2,
    "trainerId": 3
  },
  "groupBy": "session",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  }
}
```

---

## Updated Endpoints

### POST `/api/auth/login`
Now supports 2FA:

**Request** (if 2FA enabled):
```json
{
  "email": "admin@example.com",
  "password": "password",
  "twoFactorToken": "123456"
}
```

**Response** (if 2FA required):
```json
{
  "requiresTwoFactor": true,
  "message": "Two-factor authentication required"
}
```

### GET `/api/exams/:id`
Now supports randomized questions - returns unique question set per trainee if exam uses randomization.

### POST `/api/exams/:id/start`
Automatically creates randomized question set if exam has `use_randomized_questions` enabled.

---

## Authentication Changes

All authenticated endpoints now:
- Check session timeout
- Update session activity
- Log actions to audit trail

Session expires after inactivity (default: 30 minutes, configurable per user).

---

## Error Responses

All endpoints return standard error format:

```json
{
  "error": "Error message"
}
```

Status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized (authentication required or session expired)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error

