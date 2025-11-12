# Testing Guide

## Unit Testing

### Backend Tests

Create test files in `backend/tests/` directory:

```javascript
// Example test structure
describe('Auth Routes', () => {
  test('should register a new user', async () => {
    // Test implementation
  });
  
  test('should login with valid credentials', async () => {
    // Test implementation
  });
});
```

### Frontend Tests

Use React Testing Library for component tests:

```javascript
// Example test structure
import { render, screen } from '@testing-library/react';
import Login from './Login';

test('renders login form', () => {
  render(<Login />);
  const emailInput = screen.getByLabelText(/email/i);
  expect(emailInput).toBeInTheDocument();
});
```

## Integration Testing

### API Endpoint Testing

Test API endpoints using tools like Postman, Insomnia, or automated tests:

1. **Authentication Flow**:
   - Register new user
   - Login with credentials
   - Access protected routes with token

2. **Session Management**:
   - Create session (admin/trainer)
   - Enroll in session (trainee)
   - View enrollments

3. **Exam Flow**:
   - Create exam
   - Add questions
   - Start exam attempt
   - Submit answers
   - Verify grading

4. **Certificate Flow**:
   - Generate certificate
   - Verify certificate
   - Check QR code

## User Acceptance Testing (UAT)

### Test Scenarios

#### Trainee Workflow
1. Register as trainee
2. Browse available sessions
3. Enroll in a session
4. Join queue if needed
5. Take exam
6. View results
7. Download certificate
8. Verify certificate

#### Trainer Workflow
1. Login as trainer
2. Create training session
3. Create exam for session
4. Add questions to exam
5. Process queue
6. Generate certificates
7. View reports

#### Admin Workflow
1. Login as admin
2. View all sessions
3. Manage users
4. Generate reports
5. Export PDFs
6. View analytics

### Test Checklist

- [ ] User registration works
- [ ] Login/logout works
- [ ] Session enrollment works
- [ ] Queue management works
- [ ] Exam taking works
- [ ] Certificate generation works
- [ ] Certificate verification works
- [ ] Notifications are sent
- [ ] Reports display correctly
- [ ] PDF export works
- [ ] QR codes are generated
- [ ] Role-based access works
- [ ] Error handling works
- [ ] Validation works

## Performance Testing

### Load Testing
- Test with multiple concurrent users
- Test database query performance
- Test API response times
- Test file upload/download

### Stress Testing
- Test system limits
- Test error recovery
- Test database connection pooling

## Security Testing

### Security Checklist
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Authentication tokens are secure
- [ ] Passwords are hashed
- [ ] Rate limiting works
- [ ] CORS is configured correctly
- [ ] Input validation works
- [ ] Error messages don't leak sensitive info

## Manual Testing Guide

### 1. Setup Test Environment
1. Install all dependencies
2. Configure database
3. Set up environment variables
4. Start all services

### 2. Test Registration
- Register with valid data
- Try duplicate email
- Try invalid email format
- Try weak password

### 3. Test Login
- Login with valid credentials
- Try invalid credentials
- Check token is received
- Verify token works for protected routes

### 4. Test Session Management
- Create session (admin/trainer)
- View sessions (all users)
- Enroll in session (trainee)
- Check capacity limits

### 5. Test Queue
- Join queue
- View queue position
- Process queue (admin/trainer)
- Leave queue

### 6. Test Exams
- Create exam
- Add questions
- Start exam
- Submit answers
- Verify grading

### 7. Test Certificates
- Generate certificate
- View certificate
- Verify certificate
- Check QR code

### 8. Test Notifications
- Verify email is sent on registration
- Verify SMS is sent (if configured)
- Check notification history

### 9. Test Reports
- View dashboard statistics
- View attendance reports
- View performance reports
- View enrollment trends

### 10. Test PDF Export
- Generate certificate PDF
- Generate report PDF
- Verify PDF content

## Automated Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

### Test Coverage

Aim for:
- 80%+ code coverage
- All critical paths tested
- Edge cases covered
- Error scenarios tested

## Bug Reporting

When reporting bugs, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Environment details
5. Error messages/logs
6. Screenshots (if applicable)


