const express = require('express');
const pool = require('../config/database');
const auditService = require('../services/auditService');

const router = express.Router();

// Public certificate verification (no authentication required)
router.get('/certificate/:certificateNumber', async (req, res, next) => {
  try {
    const { certificateNumber } = req.params;

    const [certificates] = await pool.execute(
      `SELECT 
        c.*,
        u.first_name,
        u.last_name,
        ts.title as session_title,
        ts.session_date,
        ts.description as session_description
      FROM certificates c
      JOIN users u ON c.trainee_id = u.id
      JOIN training_sessions ts ON c.session_id = ts.id
      WHERE c.certificate_number = ?`,
      [certificateNumber]
    );

    if (certificates.length === 0) {
      await auditService.logAction(null, 'CERTIFICATE_VERIFICATION_FAILED', 'certificate', null, { certificateNumber, reason: 'not_found' }, req);
      return res.status(404).json({ 
        valid: false,
        error: 'Certificate not found',
        message: 'The certificate number provided does not exist in our records.'
      });
    }

    const certificate = certificates[0];

    // Check if expired
    const isExpired = certificate.expiry_date && new Date(certificate.expiry_date) < new Date();
    const isValid = certificate.status === 'issued' && !isExpired;

    // Log verification attempt
    await auditService.logAction(
      null,
      isValid ? 'CERTIFICATE_VERIFIED' : 'CERTIFICATE_VERIFICATION_FAILED',
      'certificate',
      certificate.id,
      { 
        certificateNumber,
        valid: isValid,
        reason: !isValid ? (isExpired ? 'expired' : 'revoked') : 'success'
      },
      req
    );

    // Return limited information for public verification
    res.json({
      valid: isValid,
      certificate: {
        certificateNumber: certificate.certificate_number,
        traineeName: `${certificate.first_name} ${certificate.last_name}`,
        sessionTitle: certificate.session_title,
        issueDate: certificate.issue_date,
        expiryDate: certificate.expiry_date,
        status: certificate.status,
        expired: isExpired,
        // Do not expose sensitive information like email, phone, etc.
      },
      verificationDate: new Date().toISOString(),
      verifiedBy: 'Coffee Training Center Public Verification System'
    });
  } catch (error) {
    next(error);
  }
});

// QR code verification endpoint
router.get('/qr/:qrData', async (req, res, next) => {
  try {
    const { qrData } = req.params;
    
    // Parse QR data (should be JSON with certificate_number)
    let qrInfo;
    try {
      qrInfo = JSON.parse(Buffer.from(qrData, 'base64').toString());
    } catch (e) {
      // Try direct parsing
      qrInfo = JSON.parse(qrData);
    }

    if (!qrInfo.certificate_number) {
      return res.status(400).json({ error: 'Invalid QR code data' });
    }

    // Redirect to certificate verification
    return res.redirect(`/api/public-verify/certificate/${qrInfo.certificate_number}`);
  } catch (error) {
    return res.status(400).json({ error: 'Invalid QR code format' });
  }
});

module.exports = router;

