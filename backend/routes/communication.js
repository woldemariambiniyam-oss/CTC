const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');

const router = express.Router();

// Get communication dashboard stats
router.get('/dashboard', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        COUNT(*) as total_notifications,
        SUM(CASE WHEN delivery_status = 'sent' THEN 1 ELSE 0 END) as sent_count,
        SUM(CASE WHEN delivery_status = 'delivered' THEN 1 ELSE 0 END) as delivered_count,
        SUM(CASE WHEN delivery_status = 'failed' THEN 1 ELSE 0 END) as failed_count,
        SUM(CASE WHEN type = 'email' THEN 1 ELSE 0 END) as email_count,
        SUM(CASE WHEN type = 'sms' THEN 1 ELSE 0 END) as sms_count
      FROM notifications
      WHERE 1=1
    `;

    const params = [];

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    const [stats] = await pool.execute(query, params);

    // Get recent notifications
    const [recent] = await pool.execute(
      `SELECT 
        n.*,
        u.email as recipient_email,
        u.first_name,
        u.last_name
      FROM notifications n
      LEFT JOIN users u ON n.user_id = u.id
      ORDER BY n.created_at DESC
      LIMIT 50`
    );

    res.json({
      statistics: stats[0],
      recentNotifications: recent
    });
  } catch (error) {
    next(error);
  }
});

// Get notification logs
router.get('/logs', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { status, type, userId, limit = 100 } = req.query;

    let query = `
      SELECT 
        cl.*,
        n.subject,
        n.message,
        u.email as recipient_email,
        u.first_name,
        u.last_name
      FROM communication_logs cl
      LEFT JOIN notifications n ON cl.notification_id = n.id
      LEFT JOIN users u ON cl.recipient_id = u.id
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND cl.status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND cl.channel = ?';
      params.push(type);
    }

    if (userId) {
      query += ' AND cl.recipient_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY cl.created_at DESC LIMIT ?';
    params.push(parseInt(limit));

    const [logs] = await pool.execute(query, params);

    res.json(logs);
  } catch (error) {
    next(error);
  }
});

// Broadcast notification to session trainees
router.post('/broadcast', authenticateToken, authorizeRoles('admin', 'trainer'), [
  require('express-validator').body('sessionId').isInt(),
  require('express-validator').body('subject').trim().notEmpty(),
  require('express-validator').body('message').trim().notEmpty()
], async (req, res, next) => {
  try {
    const errors = require('express-validator').validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, subject, message } = req.body;

    // Get all enrolled trainees
    const [enrollments] = await pool.execute(
      `SELECT 
        se.trainee_id,
        u.email,
        u.phone,
        u.first_name
      FROM session_enrollments se
      JOIN users u ON se.trainee_id = u.id
      WHERE se.session_id = ? AND se.status = 'registered'`,
      [sessionId]
    );

    let sentCount = 0;
    let failedCount = 0;

    for (const enrollment of enrollments) {
      try {
        await notificationService.sendEmail(
          enrollment.email,
          subject,
          `<p>${message}</p>`,
          message
        );

        if (enrollment.phone) {
          await notificationService.sendSMS(enrollment.phone, message);
        }

        sentCount++;
      } catch (error) {
        failedCount++;
        console.error(`Failed to send to ${enrollment.email}:`, error);
      }
    }

    await auditService.logAction(req.user.id, 'BROADCAST_SENT', 'communication', sessionId, { sentCount, failedCount }, req);

    res.json({
      message: 'Broadcast sent',
      sent: sentCount,
      failed: failedCount,
      total: enrollments.length
    });
  } catch (error) {
    next(error);
  }
});

// Get notification templates
router.get('/templates', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { language } = req.query;

    let query = 'SELECT * FROM notification_templates WHERE is_active = TRUE';
    const params = [];

    if (language) {
      query += ' AND language = ?';
      params.push(language);
    }

    query += ' ORDER BY template_key ASC';

    const [templates] = await pool.execute(query, params);

    res.json(templates);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

