# How to Register as an Instructor/Trainer

## ⚠️ Important: No Self-Registration

**Instructors/Trainers CANNOT self-register.** You must be created by an Administrator.

---

## 📋 Step-by-Step Process

### Step 1: Contact Administrator

1. **Reach out to your system administrator**
   - Email them or contact them directly
   - Request an instructor/trainer account

2. **Provide your information:**
   - Full name (First and Last)
   - Email address (will be your login)
   - Phone number (optional but recommended)
   - Any other required information

### Step 2: Admin Creates Your Account

The administrator will:
- Create your account with `trainer` role
- Set a temporary password
- Activate your account
- Send you an invitation email

### Step 3: Receive Invitation Email

You'll receive an email containing:
- **Your email address** (login username)
- **Temporary password**
- **Login URL**: http://localhost:3000
- Instructions to change password on first login

### Step 4: First Login

1. **Go to login page:**
   - URL: http://localhost:3000/login

2. **Enter credentials:**
   - Email: (from invitation email)
   - Password: (temporary password from email)

3. **Change password:**
   - After login, go to Profile/Settings
   - Change your temporary password
   - Use a strong password (8+ characters, mixed case, numbers)

4. **Enable 2FA (Recommended):**
   - Go to Security Settings
   - Enable Two-Factor Authentication
   - Scan QR code with authenticator app
   - This adds extra security to your account

---

## 🔧 For Administrators: Creating Instructor Accounts

### Method 1: Via API (Programmatic)

**Endpoint:**
```
POST /api/users
```

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "instructor@example.com",
  "password": "temporary_password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "trainer"
}
```

**Example using cURL:**
```bash
curl -X POST http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "temp123456",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "role": "trainer"
  }'
```

**Example using PowerShell:**
```powershell
$token = "YOUR_ADMIN_TOKEN"
$body = @{
    email = "instructor@example.com"
    password = "temp123456"
    firstName = "Jane"
    lastName = "Smith"
    phone = "+1234567890"
    role = "trainer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/users" `
  -Method Post `
  -Headers @{Authorization="Bearer $token"} `
  -ContentType "application/json" `
  -Body $body
```

### Method 2: Via Frontend (If UI Available)

1. Login as administrator
2. Navigate to User Management
3. Click "Create New User"
4. Fill in instructor details
5. Select role: "Trainer"
6. Set temporary password
7. Click "Create"
8. System sends invitation email automatically

### Method 3: Direct Database (Not Recommended)

Only for initial setup or emergencies:

```sql
USE coffee_training_center;

INSERT INTO users (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  phone, 
  role, 
  status
) VALUES (
  'instructor@example.com',
  '$2a$10$...', -- bcrypt hash of password
  'John',
  'Doe',
  '+1234567890',
  'trainer',
  'active'
);
```

**Note:** You'll need to generate a bcrypt hash for the password.

---

## ✅ After Account Creation

### What You Can Do as an Instructor:

- ✅ Manage assigned training sessions
- ✅ Update trainee attendance
- ✅ Create and evaluate online examinations
- ✅ Input performance assessments
- ✅ Review trainee progress
- ✅ Approve certification eligibility
- ✅ View session reports

### Security Best Practices:

1. **Change Password Immediately**
   - Use strong password (8+ characters)
   - Mix of uppercase, lowercase, numbers, symbols

2. **Enable 2FA**
   - Go to Security Settings
   - Scan QR code with authenticator app
   - Enter verification code to enable

3. **Keep Credentials Secure**
   - Don't share your password
   - Log out when done
   - Report suspicious activity

---

## 🔍 Troubleshooting

### "I didn't receive the invitation email"
- Check spam/junk folder
- Verify email address is correct
- Contact admin to resend invitation
- Check if SMTP is configured in backend

### "I can't login with temporary password"
- Make sure you're using the exact password from email
- Check for typos (copy-paste recommended)
- Contact admin to reset password
- Verify account status is "active"

### "I want to become an instructor but don't know who the admin is"
- Check with your organization/HR
- Look for system administrator contact info
- If you're setting up the system, use the default admin:
  - Email: `admin@coffeetraining.com`
  - Password: `admin123` (change immediately!)

---

## 📚 Related Documentation

- **Full Registration Guide:** `docs/USER_REGISTRATION_GUIDE.md`
- **Quick Summary:** `USER_LOGIN_SUMMARY.md`
- **API Documentation:** `docs/API.md` and `docs/ENHANCED_API.md`

---

## 🔐 Why This Security Model?

The system prevents self-registration for instructors because:

1. **Access Control:** Only verified personnel should have instructor privileges
2. **Accountability:** Admin knows who has instructor access
3. **Security:** Prevents unauthorized users from gaining elevated permissions
4. **Compliance:** Ensures proper vetting and approval process

---

## 💡 Quick Reference

| Action | Who Can Do It | How |
|--------|--------------|-----|
| **Self-register as Trainee** | Anyone | `/register` page |
| **Become Instructor** | Admin only | Admin creates account |
| **Become Admin** | Admin only | Admin creates account |
| **Verify Certificates** | Anyone | Public verification portal (no account needed) |

---

**Need Help?** Contact your system administrator or see the full documentation.

