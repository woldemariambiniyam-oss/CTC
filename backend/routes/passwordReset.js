const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');

const router = express.Router();

// Request password reset
router.post('/request', [
  body('email').isEmail().normalizeEmail()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, first_name FROM users WHERE email = ?',
      [email]
    );

    // Always return success (security: don't reveal if email exists)
    if (users.length === 0) {
      return res.json({ message: 'If the email exists, a password reset link has been sent.' });
    }

    const user = users[0];

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Valid for 1 hour

    // Delete any existing tokens for this user
    await pool.execute(
      'DELETE FROM password_reset_tokens WHERE user_id = ?',
      [user.id]
    );

    // Store token
    await pool.execute(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    // Send reset email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await notificationService.sendPasswordResetEmail(
      user.id,
      user.email,
      user.first_name,
      resetUrl
    );

    await auditService.logAction(user.id, 'PASSWORD_RESET_REQUESTED', 'user', user.id, {}, req);

    res.json({ message: 'If the email exists, a password reset link has been sent.' });
  } catch (error) {
    next(error);
  }
});

// Verify reset token
router.get('/verify/:token', async (req, res, next) => {
  try {
    const { token } = req.params;

    const [tokens] = await pool.execute(
      `SELECT prt.*, u.email 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used_at IS NULL`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.json({ valid: true, email: tokens[0].email });
  } catch (error) {
    next(error);
  }
});

// Reset password
router.post('/reset', [
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    // Find valid token
    const [tokens] = await pool.execute(
      `SELECT prt.*, u.id as user_id
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? AND prt.expires_at > NOW() AND prt.used_at IS NULL`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const resetToken = tokens[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update password
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, resetToken.user_id]
    );

    // Mark token as used
    await pool.execute(
      'UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ?',
      [resetToken.id]
    );

    // Invalidate all user sessions
    const sessionManager = require('../middleware/sessionManager');
    await sessionManager.destroyAllUserSessions(resetToken.user_id);

    await auditService.logAction(resetToken.user_id, 'PASSWORD_RESET_COMPLETED', 'user', resetToken.user_id, {}, req);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

