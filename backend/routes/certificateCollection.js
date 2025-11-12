const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');

const router = express.Router();

// Mark certificate as ready for collection
router.post('/ready/:certificateId', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    // Generate collection reference code
    const referenceCode = `CTC-${Date.now()}-${uuidv4().substring(0, 8).toUpperCase()}`;

    // Update certificate
    await pool.execute(
      `UPDATE certificates 
       SET collection_status = 'ready_for_collection',
           collection_reference_code = ?
       WHERE id = ?`,
      [referenceCode, certificateId]
    );

    // Create collection record
    const [certificates] = await pool.execute(
      'SELECT * FROM certificates WHERE id = ?',
      [certificateId]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const certificate = certificates[0];

    await pool.execute(
      `INSERT INTO certificate_collections 
       (certificate_id, trainee_id, collection_reference_code, status)
       VALUES (?, ?, ?, ?)`,
      [certificateId, certificate.trainee_id, referenceCode, 'ready']
    );

    // Get trainee info
    const [trainees] = await pool.execute(
      'SELECT email, phone, first_name FROM users WHERE id = ?',
      [certificate.trainee_id]
    );

    if (trainees.length > 0) {
      await notificationService.sendCertificateReadyForCollection(
        certificate.trainee_id,
        trainees[0].email,
        trainees[0].phone,
        trainees[0].first_name,
        referenceCode
      );
    }

    await auditService.logAction(req.user.id, 'CERTIFICATE_READY_FOR_COLLECTION', 'certificate', certificateId, { referenceCode }, req);

    res.json({
      message: 'Certificate marked as ready for collection',
      referenceCode
    });
  } catch (error) {
    next(error);
  }
});

// Collect certificate (in-person)
router.post('/collect/:referenceCode', authenticateToken, authorizeRoles('admin'), [
  body('idDocumentType').notEmpty(),
  body('idDocumentNumber').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { referenceCode } = req.params;
    const { idDocumentType, idDocumentNumber, notes } = req.body;

    // Find collection record
    const [collections] = await pool.execute(
      `SELECT cc.*, c.certificate_number
       FROM certificate_collections cc
       JOIN certificates c ON cc.certificate_id = c.id
       WHERE cc.collection_reference_code = ? AND cc.status = 'ready'`,
      [referenceCode]
    );

    if (collections.length === 0) {
      return res.status(404).json({ error: 'Invalid or already collected reference code' });
    }

    const collection = collections[0];

    // Update collection record
    await pool.execute(
      `UPDATE certificate_collections 
       SET status = 'collected',
           collected_at = NOW(),
           collected_by = ?,
           id_verified = TRUE,
           id_document_type = ?,
           id_document_number = ?,
           notes = ?
       WHERE id = ?`,
      [req.user.id, idDocumentType, idDocumentNumber, notes || null, collection.id]
    );

    // Update certificate
    await pool.execute(
      `UPDATE certificates 
       SET collection_status = 'collected',
           collected_at = NOW(),
           collected_by = ?
       WHERE id = ?`,
      [req.user.id, collection.certificate_id]
    );

    await auditService.logAction(req.user.id, 'CERTIFICATE_COLLECTED', 'certificate', collection.certificate_id, { referenceCode }, req);

    res.json({
      message: 'Certificate collected successfully',
      certificateNumber: collection.certificate_number
    });
  } catch (error) {
    next(error);
  }
});

// Get collection status
router.get('/status/:certificateId', authenticateToken, async (req, res, next) => {
  try {
    const { certificateId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check access
    const [certificates] = await pool.execute(
      'SELECT trainee_id FROM certificates WHERE id = ?',
      [certificateId]
    );

    if (certificates.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    if (certificates[0].trainee_id !== userId && userRole !== 'admin' && userRole !== 'trainer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [collections] = await pool.execute(
      `SELECT 
        cc.*,
        u.first_name as collected_by_name
      FROM certificate_collections cc
      LEFT JOIN users u ON cc.collected_by = u.id
      WHERE cc.certificate_id = ?`,
      [certificateId]
    );

    if (collections.length === 0) {
      return res.json({ status: 'not_ready', message: 'Certificate not yet ready for collection' });
    }

    res.json(collections[0]);
  } catch (error) {
    next(error);
  }
});

// Get my certificates ready for collection
router.get('/my/ready', authenticateToken, async (req, res, next) => {
  try {
    const [collections] = await pool.execute(
      `SELECT 
        cc.*,
        c.certificate_number,
        c.issue_date,
        ts.title as session_title
      FROM certificate_collections cc
      JOIN certificates c ON cc.certificate_id = c.id
      JOIN training_sessions ts ON c.session_id = ts.id
      WHERE cc.trainee_id = ? AND cc.status = 'ready'
      ORDER BY cc.ready_at DESC`,
      [req.user.id]
    );

    res.json(collections);
  } catch (error) {
    next(error);
  }
});

// Get all pending collections (admin)
router.get('/pending', authenticateToken, authorizeRoles('admin'), async (req, res, next) => {
  try {
    const [collections] = await pool.execute(
      `SELECT 
        cc.*,
        c.certificate_number,
        u.first_name,
        u.last_name,
        u.email,
        ts.title as session_title
      FROM certificate_collections cc
      JOIN certificates c ON cc.certificate_id = c.id
      JOIN users u ON cc.trainee_id = u.id
      JOIN training_sessions ts ON c.session_id = ts.id
      WHERE cc.status = 'ready'
      ORDER BY cc.ready_at ASC`,
      []
    );

    res.json(collections);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

