const twilio = require('twilio');
const nodemailer = require('nodemailer');
const pool = require('../config/database');

// Initialize Twilio client only if credentials are provided
let twilioClient = null;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC') && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Initialize SMTP transporter only if credentials are provided
let transporter = null;
if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD
    }
  });
}

class NotificationService {
  async sendSMS(phoneNumber, message) {
    try {
      if (!twilioClient) {
        console.log('Twilio not configured, skipping SMS:', message);
        return { success: false, error: 'Twilio not configured' };
      }

      const result = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber
      });

      return { success: true, sid: result.sid };
    } catch (error) {
      console.error('SMS sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendEmail(to, subject, html, text) {
    try {
      if (!transporter) {
        console.log('SMTP not configured, skipping email:', subject);
        return { success: false, error: 'SMTP not configured' };
      }

      const info = await transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
        to,
        subject,
        text: text || html,
        html
      });

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending error:', error);
      return { success: false, error: error.message };
    }
  }

  async saveNotification(userId, type, subject, message, status = 'pending') {
    try {
      const [result] = await pool.execute(
        'INSERT INTO notifications (user_id, type, subject, message, status) VALUES (?, ?, ?, ?, ?)',
        [userId, type, subject, message, status]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error saving notification:', error);
      throw error;
    }
  }

  async sendRegistrationConfirmation(userId, email, phone, firstName) {
    const emailSubject = 'Welcome to Coffee Training Center';
    const emailHtml = `
      <h2>Welcome ${firstName}!</h2>
      <p>Your registration to the Coffee Training Center has been confirmed.</p>
      <p>You can now log in to access your dashboard and view available training sessions.</p>
      <p>Best regards,<br>Coffee Training Center Team</p>
    `;

    const smsMessage = `Welcome ${firstName}! Your registration to Coffee Training Center is confirmed.`;

    const emailResult = await this.sendEmail(email, emailSubject, emailHtml);
    const smsResult = phone ? await this.sendSMS(phone, smsMessage) : null;

    await this.saveNotification(
      userId,
      'email',
      emailSubject,
      emailHtml,
      emailResult.success ? 'sent' : 'failed'
    );

    if (smsResult) {
      await this.saveNotification(
        userId,
        'sms',
        'Registration Confirmation',
        smsMessage,
        smsResult.success ? 'sent' : 'failed'
      );
    }

    return { email: emailResult, sms: smsResult };
  }

  async sendExamReminder(userId, email, phone, firstName, examTitle, examDate) {
    const emailSubject = 'Exam Reminder: ' + examTitle;
    const emailHtml = `
      <h2>Exam Reminder</h2>
      <p>Hello ${firstName},</p>
      <p>This is a reminder that you have an exam scheduled:</p>
      <p><strong>${examTitle}</strong></p>
      <p>Date: ${examDate}</p>
      <p>Please make sure to be prepared and arrive on time.</p>
      <p>Good luck!</p>
    `;

    const smsMessage = `Reminder: You have an exam "${examTitle}" scheduled for ${examDate}. Good luck!`;

    await this.sendEmail(email, emailSubject, emailHtml);
    if (phone) await this.sendSMS(phone, smsMessage);
  }

  async sendCertificateIssued(userId, email, phone, firstName, certificateNumber) {
    const emailSubject = 'Certificate Issued';
    const emailHtml = `
      <h2>Congratulations ${firstName}!</h2>
      <p>Your certificate has been issued.</p>
      <p>Certificate Number: <strong>${certificateNumber}</strong></p>
      <p>You can view and download your certificate from your dashboard.</p>
      <p>Best regards,<br>Coffee Training Center Team</p>
    `;

    const smsMessage = `Congratulations! Your certificate ${certificateNumber} has been issued. Check your dashboard for details.`;

    await this.sendEmail(email, emailSubject, emailHtml);
    if (phone) await this.sendSMS(phone, smsMessage);
  }
}

module.exports = new NotificationService();


