const pool = require('../config/database');
const jwt = require('jsonwebtoken');

// Track active sessions in memory (in production, use Redis)
const activeSessions = new Map();

const SESSION_TIMEOUT_MINUTES = 30; // Default 30 minutes

const sessionManager = {
  async createSession(userId, token, req) {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + SESSION_TIMEOUT_MINUTES);

    const sessionData = {
      userId,
      token,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent'),
      lastActivity: new Date(),
      expiresAt
    };

    // Store in database
    try {
      const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
      await pool.execute(
        `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, last_activity, expires_at)
         VALUES (?, ?, ?, ?, NOW(), ?)`,
        [userId, tokenHash, sessionData.ipAddress, sessionData.userAgent, expiresAt]
      );
    } catch (error) {
      console.error('Error creating session:', error);
    }

    // Store in memory
    activeSessions.set(token, sessionData);
    return sessionData;
  },

  async updateActivity(token) {
    const session = activeSessions.get(token);
    if (session) {
      session.lastActivity = new Date();
      
      // Update database
      try {
        const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
        await pool.execute(
          'UPDATE user_sessions SET last_activity = NOW() WHERE token_hash = ?',
          [tokenHash]
        );
      } catch (error) {
        console.error('Error updating session activity:', error);
      }
    }
  },

  async checkSessionTimeout(token) {
    const session = activeSessions.get(token);
    if (!session) {
      return false;
    }

    const now = new Date();
    const timeSinceActivity = (now - session.lastActivity) / 1000 / 60; // minutes

    // Get user's session timeout preference
    try {
      const [users] = await pool.execute(
        'SELECT session_timeout_minutes FROM users WHERE id = ?',
        [session.userId]
      );
      const timeoutMinutes = users[0]?.session_timeout_minutes || SESSION_TIMEOUT_MINUTES;

      if (timeSinceActivity > timeoutMinutes) {
        await this.destroySession(token);
        return false;
      }
    } catch (error) {
      console.error('Error checking session timeout:', error);
    }

    return true;
  },

  async destroySession(token) {
    activeSessions.delete(token);
    
    try {
      const tokenHash = require('crypto').createHash('sha256').update(token).digest('hex');
      await pool.execute(
        'UPDATE user_sessions SET is_active = FALSE WHERE token_hash = ?',
        [tokenHash]
      );
    } catch (error) {
      console.error('Error destroying session:', error);
    }
  },

  async destroyAllUserSessions(userId) {
    // Remove from memory
    for (const [token, session] of activeSessions.entries()) {
      if (session.userId === userId) {
        activeSessions.delete(token);
      }
    }

    // Update database
    try {
      await pool.execute(
        'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?',
        [userId]
      );
    } catch (error) {
      console.error('Error destroying user sessions:', error);
    }
  }
};

// Cleanup expired sessions periodically
setInterval(() => {
  const now = new Date();
  for (const [token, session] of activeSessions.entries()) {
    if (session.expiresAt < now) {
      sessionManager.destroySession(token);
    }
  }
}, 60000); // Check every minute

module.exports = sessionManager;

