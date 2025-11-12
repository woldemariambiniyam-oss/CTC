const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const notificationService = require('../services/notificationService');
const twoFactorService = require('../services/twoFactorService');
const sessionManager = require('../middleware/sessionManager');
const auditService = require('../services/auditService');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new trainee
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('phone').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, firstName, lastName, phone } = req.body;

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [email, passwordHash, firstName, lastName, phone || null, 'trainee']
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email, role: 'trainee' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Send welcome notification
    await notificationService.sendRegistrationConfirmation(
      userId,
      email,
      phone,
      firstName
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        email,
        firstName,
        lastName,
        role: 'trainee'
      }
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  body('twoFactorToken').optional().isLength({ min: 6, max: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, twoFactorToken } = req.body;

    // Find user
    const [users] = await pool.execute(
      'SELECT id, email, password_hash, first_name, last_name, role, status, two_factor_enabled, two_factor_secret FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      await auditService.logAction(null, 'LOGIN_FAILED', 'auth', null, { email, reason: 'user_not_found' }, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    if (user.status !== 'active') {
      await auditService.logAction(user.id, 'LOGIN_FAILED', 'auth', user.id, { reason: 'account_inactive' }, req);
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      await auditService.logAction(user.id, 'LOGIN_FAILED', 'auth', user.id, { reason: 'invalid_password' }, req);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check 2FA requirement
    if (user.two_factor_enabled && (user.role === 'admin' || user.role === 'trainer')) {
      if (!twoFactorToken) {
        return res.status(200).json({
          requiresTwoFactor: true,
          message: 'Two-factor authentication required'
        });
      }

      // Verify 2FA token
      const isValid2FA = twoFactorService.verifyToken(user.two_factor_secret, twoFactorToken);
      if (!isValid2FA) {
        await auditService.logAction(user.id, 'LOGIN_FAILED', 'auth', user.id, { reason: 'invalid_2fa' }, req);
        return res.status(401).json({ error: 'Invalid two-factor authentication code' });
      }
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create session
    await sessionManager.createSession(user.id, token, req);

    // Update last login
    await pool.execute(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    await auditService.logAction(user.id, 'LOGIN_SUCCESS', 'auth', user.id, {}, req);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, email, first_name, last_name, phone, role, status, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      role: user.role,
      status: user.status,
      createdAt: user.created_at
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


