const express = require('express');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const qrService = require('../services/qrService');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Generate certificate
router.post('/generate', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { traineeId, sessionId, examAttemptId } = req.body;

    // Validate inputs
    if (!traineeId || !sessionId) {
      return res.status(400).json({ error: 'Trainee ID and Session ID are required' });
    }

    // Check if certificate already exists
    const [existing] = await pool.execute(
      'SELECT * FROM certificates WHERE trainee_id = ? AND session_id = ?',
      [traineeId, sessionId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Certificate already exists', certificate: existing[0] });
    }

    // Get trainee and session info
    const [trainees] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [traineeId]
    );

    if (trainees.length === 0) {
      return res.status(404).json({ error: 'Trainee not found' });
    }

    const [sessions] = await pool.execute(
      'SELECT * FROM training_sessions WHERE id = ?',
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Generate certificate number
    const certificateNumber = `CTC-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Calculate expiry date (default 365 days)
    const issueDate = new Date();
    const expiryDate = new Date(issueDate);
    expiryDate.setDate(expiryDate.getDate() + 365);

    // Generate QR code
    const qrResult = await qrService.generateCertificateQR(certificateNumber, traineeId, sessionId);

    // Create certificate
    const [result] = await pool.execute(
      `INSERT INTO certificates 
       (trainee_id, session_id, exam_attempt_id, certificate_number, issue_date, expiry_date, qr_code_url, qr_code_data, status, collection_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        traineeId,
        sessionId,
        examAttemptId || null,
        certificateNumber,
        issueDate,
        expiryDate,
        qrResult.qrCodeUrl,
        qrResult.qrCodeData,
        'issued',
        'pending_collection'
      ]
    );

    const [certificate] = await pool.execute(
      `SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone,
        ts.title as session_title
      FROM certificates c
      JOIN users u ON c.trainee_id = u.id
      JOIN training_sessions ts ON c.session_id = ts.id
      WHERE c.id = ?`,
      [result.insertId]
    );

    // Send notification
    await notificationService.sendCertificateIssued(
      traineeId,
      certificate[0].email,
      certificate[0].phone,
      certificate[0].first_name,
      certificateNumber
    );

    res.status(201).json(certificate[0]);
  } catch (error) {
    next(error);
  }
});

// Get my certificates
router.get('/my', authenticateToken, async (req, res, next) => {
  try {
    const [certificates] = await pool.execute(
      `SELECT 
        c.*,
        ts.title as session_title,
        ts.session_date
      FROM certificates c
      JOIN training_sessions ts ON c.session_id = ts.id
      WHERE c.trainee_id = ?
      ORDER BY c.issue_date DESC`,
      [req.user.id]
    );

    res.json(certificates);
  } catch (error) {
    next(error);
  }
});

// Get all certificates (admin/trainer only)
router.get('/', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { traineeId, sessionId, status } = req.query;
    
    let query = `
      SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.email,
        ts.title as session_title
      FROM certificates c
      JOIN users u ON c.trainee_id = u.id
      JOIN training_sessions ts ON c.session_id = ts.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (traineeId) {
      query += ' AND c.trainee_id = ?';
      params.push(traineeId);
    }
    
    if (sessionId) {
      query += ' AND c.session_id = ?';
      params.push(sessionId);
    }
    
    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY c.issue_date DESC';
    
    const [certificates] = await pool.execute(query, params);
    res.json(certificates);
  } catch (error) {
    next(error);
  }
});

// Verify certificate
router.get('/verify/:certificateNumber', async (req, res, next) => {
  try {
    const { certificateNumber } = req.params;

    const [certificates] = await pool.execute(
      `SELECT 
        c.*,
        u.first_name,
        u.last_name,
        u.email,
        ts.title as session_title,
        ts.session_date
      FROM certificates c
      JOIN users u ON c.trainee_id = u.id
      JOIN training_sessions ts ON c.session_id = ts.id
      WHERE c.certificate_number = ?`,
      [certificateNumber]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificate not found', valid: false });
    }

    const certificate = certificates[0];

    // Check if expired
    const isExpired = new Date(certificate.expiry_date) < new Date();
    const isValid = certificate.status === 'issued' && !isExpired;

    res.json({
      valid: isValid,
      certificate: {
        certificateNumber: certificate.certificate_number,
        traineeName: `${certificate.first_name} ${certificate.last_name}`,
        sessionTitle: certificate.session_title,
        issueDate: certificate.issue_date,
        expiryDate: certificate.expiry_date,
        status: certificate.status,
        expired: isExpired
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


