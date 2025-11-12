# SMTP Email Setup Guide

## Overview
SMTP is used for sending email notifications to trainees. This is optional - the system will work without it, but email notifications won't be sent.

## Setup Options

### Option 1: Gmail (Recommended for Development)

#### Step 1: Enable 2-Factor Authentication
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification

#### Step 2: Generate App Password
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Other (Custom name)"
3. Enter "Coffee Training Center"
4. Click "Generate"
5. Copy the 16-character password (no spaces)

#### Step 3: Configure in .env
Update `backend/.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_16_char_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Coffee Training Center
```

### Option 2: Other Email Providers

#### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_USER=your_email@outlook.com
SMTP_PASSWORD=your_password
```

#### Yahoo Mail
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=your_email@yahoo.com
SMTP_PASSWORD=your_app_password
```

#### Custom SMTP Server
```env
SMTP_HOST=your_smtp_server.com
SMTP_PORT=587
SMTP_USER=your_username
SMTP_PASSWORD=your_password
```

## Testing Email Configuration

After configuring, restart the backend server and:
1. Register a new user
2. Check if welcome email is received
3. Check backend logs for any errors

## Troubleshooting

### Gmail Issues
- **"Less secure app access"**: Use App Password instead
- **"Authentication failed"**: Verify App Password is correct
- **"Connection timeout"**: Check firewall/network settings

### General Issues
- **"Invalid credentials"**: Double-check username and password
- **"Connection refused"**: Verify SMTP host and port
- **No emails sent**: Check backend logs for error messages

## Production Recommendations

For production, consider:
- **SendGrid**: https://sendgrid.com (Free tier: 100 emails/day)
- **Mailgun**: https://www.mailgun.com (Free tier: 5,000 emails/month)
- **Amazon SES**: https://aws.amazon.com/ses/ (Pay as you go)
- **Postmark**: https://postmarkapp.com/ (Free tier: 100 emails/month)

These services provide:
- Better deliverability
- Analytics and tracking
- Higher sending limits
- Professional email templates

## Security Notes
- Never commit `.env` file to version control
- Use App Passwords, not your main password
- Rotate credentials regularly
- Use environment-specific credentials for production


