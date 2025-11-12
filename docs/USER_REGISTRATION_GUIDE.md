# User Registration and Login Guide

## Overview

The Coffee Training Center Management System supports four user categories, each with different registration and login processes.

---

## 1. Trainee Registration & Login

### Registration Process
**Self-Registration (Public Access)**

Trainees can register themselves through the public registration form:

1. **Access Registration Page:**
   - URL: `http://localhost:3000/register`
   - Or click "Register here" on the login page

2. **Fill Registration Form:**
   - First Name (required)
   - Last Name (required)
   - Email (required, must be unique)
   - Phone (optional)
   - Password (minimum 6 characters)

3. **Submit Registration:**
   - System automatically assigns `trainee` role
   - Account is created with `active` status
   - Welcome email/SMS sent (if configured)
   - User is automatically logged in

### Login Process
1. **Access Login Page:**
   - URL: `http://localhost:3000/login`

2. **Enter Credentials:**
   - Email
   - Password

3. **Access Dashboard:**
   - After login, redirected to trainee dashboard
   - Can view: schedules, enrollments, exam results, certificates

### Trainee Capabilities
- ✅ Self-register and create profile
- ✅ Enroll in training programs
- ✅ Track progress and view dashboard
- ✅ Access schedules and notifications
- ✅ View exam results
- ✅ Verify issued certificates
- ❌ Cannot create trainers/admins
- ❌ Cannot manage sessions (unless assigned as trainer)

---

## 2. Trainer/Instructor Registration & Login

### Registration Process
**Admin-Created Account (No Self-Registration)**

Trainers **CANNOT** self-register. They must be created by an Administrator:

1. **Admin Creates Trainer Account:**
   - Admin logs in
   - Navigates to User Management
   - Creates new user with `trainer` role
   - System sends invitation email with temporary password
   - Trainer must change password on first login

2. **Alternative: Manual Creation by Admin**
   - Admin can create trainer account directly
   - Assigns email, name, phone
   - Sets initial password
   - Account is immediately active

### Login Process
1. **Access Login Page:**
   - URL: `http://localhost:3000/login`

2. **Enter Credentials:**
   - Email (provided by admin)
   - Password (temporary password or changed password)

3. **Two-Factor Authentication (Optional but Recommended):**
   - If 2FA is enabled, enter 6-digit code from authenticator app
   - Required for admin/trainer roles if enabled

4. **Access Dashboard:**
   - Trainer dashboard with session management
   - Can create exams, evaluate trainees, approve certificates

### Trainer Capabilities
- ✅ Manage assigned training sessions
- ✅ Update attendance
- ✅ Create and evaluate online examinations
- ✅ Input performance assessments
- ✅ Review trainee progress
- ✅ Approve certification eligibility
- ❌ Cannot create other trainers/admins
- ❌ Cannot access system-wide reports (admin only)

---

## 3. Administrator Registration & Login

### Registration Process
**Manual Creation (No Self-Registration)**

Administrators **CANNOT** self-register. They must be created by:

1. **Another Administrator:**
   - Existing admin logs in
   - Navigates to User Management
   - Creates new user with `admin` role
   - System sends invitation email

2. **Database Manual Entry:**
   - Direct database insertion (for initial admin)
   - Or using SQL script

3. **Initial Admin:**
   - Created via `database/schema.sql`
   - Email: `admin@coffeetraining.com`
   - Password: `admin123` (should be changed immediately)

### Login Process
1. **Access Login Page:**
   - URL: `http://localhost:3000/login`

2. **Enter Credentials:**
   - Email
   - Password

3. **Two-Factor Authentication (Recommended):**
   - If 2FA is enabled, enter 6-digit code
   - Strongly recommended for security

4. **Access Dashboard:**
   - Full system access
   - User management, reports, system configuration

### Administrator Capabilities
- ✅ Oversee all system operations
- ✅ Manage trainee/trainer accounts
- ✅ Configure training schedules
- ✅ Generate all reports
- ✅ Approve and issue certificates
- ✅ System configuration
- ✅ Create trainers and other admins

---

## 4. Public Verifier (External User)

### Registration Process
**NO REGISTRATION REQUIRED**

Public verifiers do **NOT** need to register or log in. They access the public verification portal directly.

### Access Process
1. **Access Public Verification Portal:**
   - URL: `http://localhost:5000/api/public-verify/certificate/{certificateNumber}`
   - Or via QR code scan

2. **Enter Certificate Number:**
   - Enter the certificate number
   - Or scan the QR code on the certificate

3. **View Verification Results:**
   - Certificate validity status
   - Trainee name
   - Course/session title
   - Issue date
   - Expiry date (if applicable)
   - Status (issued, expired, revoked)

### Public Verifier Capabilities
- ✅ Verify certificate authenticity
- ✅ View limited certificate information (read-only)
- ✅ Access via QR code or certificate number
- ❌ No login required
- ❌ No account creation
- ❌ Cannot access any other system features

---

## API Endpoints

### Registration
```
POST /api/auth/register
Body: {
  "email": "trainee@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890" (optional)
}
Response: {
  "message": "Registration successful",
  "token": "jwt_token",
  "user": { ... }
}
```
**Note:** Only creates `trainee` role. Trainers/admins must be created by admin.

### Login
```
POST /api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password123",
  "twoFactorToken": "123456" (optional, if 2FA enabled)
}
Response: {
  "message": "Login successful",
  "token": "jwt_token",
  "user": { ... }
}
```

### Public Verification (No Auth Required)
```
GET /api/public-verify/certificate/{certificateNumber}
Response: {
  "valid": true/false,
  "certificate": {
    "certificateNumber": "...",
    "traineeName": "...",
    "sessionTitle": "...",
    ...
  }
}
```

---

## Security Features

### Two-Factor Authentication (2FA)
- **Required for:** Admin and Trainer roles (optional but recommended)
- **Setup:** After login, navigate to Security Settings
- **Method:** TOTP (Time-based One-Time Password)
- **Apps:** Google Authenticator, Authy, Microsoft Authenticator

### Session Management
- **Timeout:** 30 minutes of inactivity (configurable)
- **Auto-logout:** Automatic on timeout
- **Multiple Sessions:** Supported (can login from multiple devices)

### Password Requirements
- **Minimum Length:** 6 characters
- **Recommendation:** Use strong passwords (8+ chars, mixed case, numbers, symbols)
- **Reset:** Available via "Forgot Password" link

---

## Role Assignment Summary

| User Type | Registration Method | Who Can Create | Role Assignment |
|-----------|-------------------|----------------|-----------------|
| **Trainee** | Self-registration | Anyone (public) | Automatic: `trainee` |
| **Trainer** | Admin-created | Administrator only | Manual: `trainer` |
| **Admin** | Admin-created or manual | Administrator or DB | Manual: `admin` |
| **Public Verifier** | No registration | N/A | No account needed |

---

## Troubleshooting

### Cannot Register as Trainer/Admin
- **Issue:** Registration form only creates trainees
- **Solution:** Contact administrator to create your account
- **Note:** This is by design for security

### Login Fails After Registration
- Check email confirmation (if required)
- Verify account status is `active`
- Try password reset if needed

### Public Verification Not Working
- Verify certificate number is correct
- Check certificate hasn't been revoked
- Ensure certificate hasn't expired

### 2FA Issues
- Ensure time is synchronized on device
- Re-scan QR code if needed
- Contact admin to reset 2FA

---

## Best Practices

1. **Trainees:** Use strong passwords, keep account secure
2. **Trainers:** Enable 2FA, regularly update passwords
3. **Admins:** Always use 2FA, audit account access regularly
4. **Public Verifiers:** No account needed, just use certificate number or QR code

---

## Support

For registration or login issues:
- Contact system administrator
- Check audit logs (admin only)
- Review error messages for specific issues

