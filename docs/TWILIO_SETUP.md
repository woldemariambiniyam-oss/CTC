# Twilio SMS Setup Guide

## Overview
Twilio is used for sending SMS notifications to trainees. This is optional - the system will work without it, but SMS notifications won't be sent.

## Setup Steps

### 1. Create Twilio Account
1. Go to https://www.twilio.com/try-twilio
2. Sign up for a free account
3. Verify your phone number

### 2. Get Your Credentials
1. Log in to Twilio Console: https://console.twilio.com
2. Go to Account → Account Info
3. Copy your:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click to reveal)

### 3. Get a Phone Number
1. In Twilio Console, go to Phone Numbers → Manage → Buy a number
2. Select a number (free trial accounts get a number)
3. Copy the phone number (format: +1234567890)

### 4. Configure in .env
Update `backend/.env`:
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 5. Test
After configuring, restart the backend server. SMS notifications will be sent for:
- User registration
- Exam reminders
- Certificate issuance

## Free Trial Limitations
- Twilio free trial has limitations
- You can only send SMS to verified numbers during trial
- Upgrade to paid account for production use

## Troubleshooting
- **Error: "Invalid credentials"**: Check Account SID and Auth Token
- **Error: "Phone number not verified"**: Verify recipient number in Twilio Console (trial accounts)
- **No SMS received**: Check Twilio Console logs for errors

## Cost
- Free trial includes $15.50 credit
- SMS costs vary by country (~$0.0075 per SMS in US)
- See Twilio pricing: https://www.twilio.com/sms/pricing


