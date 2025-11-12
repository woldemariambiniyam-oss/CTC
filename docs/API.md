# API Documentation

Base URL: `http://localhost:5000/api`

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth Routes (`/api/auth`)

#### POST `/register`
Register a new trainee account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "message": "Registration successful",
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "trainee"
  }
}
```

#### POST `/login`
Login and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": { ... }
}
```

#### GET `/me`
Get current user profile (requires authentication).

---

### Session Routes (`/api/sessions`)

#### GET `/`
Get all training sessions (requires authentication).

**Query Parameters:**
- `status`: Filter by status (scheduled, in_progress, completed, cancelled)
- `upcoming`: Filter upcoming sessions (true/false)

#### GET `/:id`
Get single training session with enrollments.

#### POST `/`
Create new training session (admin/trainer only).

#### POST `/:id/enroll`
Enroll in a training session (trainee only).

#### GET `/my/enrollments`
Get current user's enrollments.

---

### Queue Routes (`/api/queue`)

#### POST `/join/:sessionId`
Join queue for a session.

#### GET `/session/:sessionId`
Get queue for a session.

#### GET `/my/queues`
Get current user's queue positions.

#### POST `/process/:sessionId`
Process next person in queue (admin/trainer only).

#### DELETE `/leave/:queueId`
Leave queue.

---

### Exam Routes (`/api/exams`)

#### GET `/`
Get all exams.

**Query Parameters:**
- `sessionId`: Filter by session
- `status`: Filter by status

#### GET `/:id`
Get exam with questions.

#### POST `/`
Create exam (admin/trainer only).

#### POST `/:id/questions`
Add question to exam (admin/trainer only).

#### POST `/:id/start`
Start exam attempt.

#### POST `/:id/submit`
Submit exam answers.

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": 1,
      "answerText": "Answer text"
    }
  ]
}
```

#### GET `/my/attempts`
Get current user's exam attempts.

---

### Certificate Routes (`/api/certificates`)

#### POST `/generate`
Generate certificate (admin/trainer only).

**Request Body:**
```json
{
  "traineeId": 1,
  "sessionId": 1,
  "examAttemptId": 1
}
```

#### GET `/my`
Get current user's certificates.

#### GET `/`
Get all certificates (admin/trainer only).

#### GET `/verify/:certificateNumber`
Verify certificate (public endpoint).

---

### Report Routes (`/api/reports`)

#### GET `/dashboard`
Get dashboard statistics.

#### GET `/attendance`
Get attendance statistics (admin/trainer only).

#### GET `/performance`
Get performance statistics (admin/trainer only).

#### GET `/enrollment-trends`
Get enrollment trends (admin/trainer only).

#### GET `/certificates`
Get certificate statistics (admin/trainer only).

---

## Error Responses

All errors follow this format:
```json
{
  "error": "Error message"
}
```

Status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `409`: Conflict
- `500`: Internal Server Error


