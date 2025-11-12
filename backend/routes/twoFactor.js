const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const twoFactorService = require('../services/twoFactorService');
const auditService = require('../services/auditService');

const router = express.Router();

// Setup 2FA (admin/trainer only)
router.post('/setup', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Generate secret
    const { secret, otpAuthUrl } = twoFactorService.generateSecret(req.user.email);

    // Generate QR code
    const qrCodeUrl = await twoFactorService.generateQRCode(otpAuthUrl);

    // Store secret (temporarily - user needs to verify before enabling)
    await pool.execute(
      'UPDATE users SET two_factor_secret = ? WHERE id = ?',
      [secret, userId]
    );

    await auditService.logAction(userId, '2FA_SETUP_INITIATED', 'user', userId, {}, req);

    res.json({
      secret,
      qrCodeUrl,
      message: 'Scan QR code with authenticator app and verify to enable 2FA'
    });
  } catch (error) {
    next(error);
  }
});

// Verify and enable 2FA
router.post('/verify', authenticateToken, authorizeRoles('admin', 'trainer'), [
  body('token').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { token } = req.body;

    // Get user's secret
    const [users] = await pool.execute(
      'SELECT two_factor_secret FROM users WHERE id = ?',
      [userId]
    );

    if (!users[0] || !users[0].two_factor_secret) {
      return res.status(400).json({ error: '2FA not set up. Please set up first.' });
    }

    // Verify token
    const isValid = twoFactorService.verifyToken(users[0].two_factor_secret, token);

    if (!isValid) {
      await auditService.logAction(userId, '2FA_VERIFICATION_FAILED', 'user', userId, {}, req);
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Enable 2FA
    await pool.execute(
      'UPDATE users SET two_factor_enabled = TRUE WHERE id = ?',
      [userId]
    );

    await auditService.logAction(userId, '2FA_ENABLED', 'user', userId, {}, req);

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    next(error);
  }
});

// Disable 2FA
router.post('/disable', authenticateToken, authorizeRoles('admin', 'trainer'), [
  body('token').isLength({ min: 6, max: 6 }).isNumeric()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { token } = req.body;

    // Get user's secret
    const [users] = await pool.execute(
      'SELECT two_factor_secret, two_factor_enabled FROM users WHERE id = ?',
      [userId]
    );

    if (!users[0] || !users[0].two_factor_enabled) {
      return res.status(400).json({ error: '2FA is not enabled' });
    }

    // Verify token
    const isValid = twoFactorService.verifyToken(users[0].two_factor_secret, token);

    if (!isValid) {
      return res.status(401).json({ error: 'Invalid verification code' });
    }

    // Disable 2FA
    await pool.execute(
      'UPDATE users SET two_factor_enabled = FALSE, two_factor_secret = NULL WHERE id = ?',
      [userId]
    );

    await auditService.logAction(userId, '2FA_DISABLED', 'user', userId, {}, req);

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    next(error);
  }
});

// Check 2FA status
router.get('/status', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT two_factor_enabled FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      enabled: users[0]?.two_factor_enabled || false
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

