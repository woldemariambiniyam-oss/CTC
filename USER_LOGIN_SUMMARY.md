# User Registration & Login - Quick Summary

## 🔐 How Each User Type Registers and Logs In

### 1. **TRAINEE** 👤
**Registration:**
- ✅ **Self-registration** - Anyone can register
- Go to: `http://localhost:3000/register`
- Fill form: Name, Email, Password, Phone (optional)
- System automatically assigns `trainee` role
- Account is immediately active

**Login:**
- Go to: `http://localhost:3000/login`
- Enter: Email + Password
- Access: Personal dashboard, enrollments, exams, certificates

---

### 2. **TRAINER/INSTRUCTOR** 🎓
**Registration:**
- ❌ **NO self-registration** - Must be created by Admin
- Admin creates account via: `POST /api/users` with `role: "trainer"`
- Trainer receives invitation email with:
  - Email address
  - Temporary password
  - Instructions to change password on first login

**Login:**
- Go to: `http://localhost:3000/login`
- Enter: Email + Temporary Password
- **2FA Recommended:** Can enable two-factor authentication
- Access: Session management, exam creation, trainee evaluation

**Admin Creates Trainer:**
```bash
POST /api/users
Headers: Authorization: Bearer <admin_token>
Body: {
  "email": "trainer@example.com",
  "password": "temp_password123",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "role": "trainer"
}
```

---

### 3. **ADMINISTRATOR** 🔑
**Registration:**
- ❌ **NO self-registration** - Must be created by:
  - Another Admin via `POST /api/users` with `role: "admin"`
  - Or manually via database (for initial admin)

**Initial Admin:**
- Email: `admin@coffeetraining.com`
- Password: `admin123` (⚠️ Change immediately!)

**Login:**
- Go to: `http://localhost:3000/login`
- Enter: Email + Password
- **2FA Strongly Recommended:** Should enable two-factor authentication
- Access: Full system access, user management, reports, configuration

**Admin Creates Another Admin:**
```bash
POST /api/users
Headers: Authorization: Bearer <admin_token>
Body: {
  "email": "newadmin@example.com",
  "password": "secure_password123",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```

---

### 4. **PUBLIC VERIFIER** 🌐
**Registration:**
- ❌ **NO registration needed**
- ❌ **NO login required**
- Public access to verification portal

**Access:**
- Direct URL: `http://localhost:5000/api/public-verify/certificate/{certificateNumber}`
- Or scan QR code on certificate
- View: Certificate validity, trainee name, course, dates
- **Read-only access** - No account needed

**Example:**
```
GET /api/public-verify/certificate/CTC-1234567890-ABCD1234
```

---

## 📊 Registration Methods Summary

| User Type | Registration Method | Who Can Create | Login Required |
|-----------|-------------------|----------------|----------------|
| **Trainee** | Self-registration | Anyone (public) | ✅ Yes |
| **Trainer** | Admin-created | Administrator only | ✅ Yes |
| **Admin** | Admin-created | Administrator or DB | ✅ Yes |
| **Public Verifier** | None | N/A | ❌ No |

---

## 🔒 Security Features

### Two-Factor Authentication (2FA)
- **Required for:** Admin and Trainer (optional but recommended)
- **Setup:** After login → Security Settings → Enable 2FA
- **Method:** TOTP (Google Authenticator, Authy, etc.)

### Password Requirements
- **Minimum:** 6 characters
- **Recommended:** 8+ characters with mixed case, numbers, symbols
- **Reset:** Available via "Forgot Password" link

### Session Management
- **Timeout:** 30 minutes of inactivity
- **Auto-logout:** On timeout
- **Multiple Devices:** Supported

---

## 🚀 Quick Start

### For Trainees:
1. Visit `http://localhost:3000/register`
2. Fill registration form
3. Login immediately after registration

### For Trainers/Admins:
1. Contact system administrator
2. Admin creates your account
3. Check email for invitation with credentials
4. Login and change password

### For Public Verification:
1. Visit `http://localhost:5000/api/public-verify/certificate/{number}`
2. Or scan QR code
3. View certificate information (no login needed)

---

## 📚 Full Documentation

See `docs/USER_REGISTRATION_GUIDE.md` for complete details including:
- Detailed step-by-step instructions
- API endpoint documentation
- Troubleshooting guide
- Best practices

---

## 🔧 Admin User Management API

### Create User (Admin Only)
```bash
POST /api/users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "trainer"  // or "admin" or "trainee"
}
```

### List Users (Admin Only)
```bash
GET /api/users?role=trainer&status=active&search=john
Authorization: Bearer <admin_token>
```

### Update User
```bash
PUT /api/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Updated Name",
  "status": "active"  // admin only
}
```

### Reset Password (Admin Only)
```bash
POST /api/users/:id/reset-password
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "newPassword": "new_secure_password"
}
```

---

## ⚠️ Important Notes

1. **Trainees** can only self-register as trainees
2. **Trainers** and **Admins** must be created by administrators
3. **Public Verifiers** don't need accounts - just use certificate number
4. Always enable 2FA for admin/trainer accounts
5. Change default passwords immediately
6. Use strong passwords for all accounts

---

**Need Help?** Contact your system administrator or see the full documentation.

