const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Join queue for a session
router.post('/join/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const traineeId = req.user.id;

    // Check if session exists
    const [sessions] = await pool.execute(
      'SELECT * FROM training_sessions WHERE id = ?',
      [sessionId]
    );

    if (sessions.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Check if already in queue
    const [existing] = await pool.execute(
      'SELECT id FROM queue_entries WHERE trainee_id = ? AND session_id = ? AND status = "waiting"',
      [traineeId, sessionId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Already in queue for this session' });
    }

    // Get next queue position
    const [maxPos] = await pool.execute(
      'SELECT COALESCE(MAX(queue_position), 0) as max_pos FROM queue_entries WHERE session_id = ?',
      [sessionId]
    );

    const nextPosition = maxPos[0].max_pos + 1;

    // Add to queue
    const [result] = await pool.execute(
      'INSERT INTO queue_entries (trainee_id, session_id, queue_position, status) VALUES (?, ?, ?, ?)',
      [traineeId, sessionId, nextPosition, 'waiting']
    );

    const [queueEntry] = await pool.execute(
      `SELECT 
        qe.*,
        u.first_name,
        u.last_name,
        u.email
      FROM queue_entries qe
      JOIN users u ON qe.trainee_id = u.id
      WHERE qe.id = ?`,
      [result.insertId]
    );

    res.status(201).json(queueEntry[0]);
  } catch (error) {
    next(error);
  }
});

// Get queue for a session
router.get('/session/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const [queue] = await pool.execute(
      `SELECT 
        qe.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM queue_entries qe
      JOIN users u ON qe.trainee_id = u.id
      WHERE qe.session_id = ? AND qe.status = 'waiting'
      ORDER BY qe.queue_position ASC`,
      [sessionId]
    );

    res.json(queue);
  } catch (error) {
    next(error);
  }
});

// Get my queue positions
router.get('/my/queues', authenticateToken, async (req, res, next) => {
  try {
    const [queues] = await pool.execute(
      `SELECT 
        qe.*,
        ts.title as session_title,
        ts.session_date,
        ts.location
      FROM queue_entries qe
      JOIN training_sessions ts ON qe.session_id = ts.id
      WHERE qe.trainee_id = ? AND qe.status = 'waiting'
      ORDER BY qe.queue_position ASC`,
      [req.user.id]
    );

    res.json(queues);
  } catch (error) {
    next(error);
  }
});

// Process next in queue (admin/trainer only)
router.post('/process/:sessionId', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Get next person in queue
    const [queue] = await pool.execute(
      `SELECT * FROM queue_entries 
       WHERE session_id = ? AND status = 'waiting' 
       ORDER BY queue_position ASC 
       LIMIT 1`,
      [sessionId]
    );

    if (queue.length === 0) {
      return res.status(404).json({ error: 'No one in queue' });
    }

    const queueEntry = queue[0];

    // Update status to processing
    await pool.execute(
      'UPDATE queue_entries SET status = ?, processed_at = NOW() WHERE id = ?',
      ['processing', queueEntry.id]
    );

    // Get updated entry with user info
    const [updated] = await pool.execute(
      `SELECT 
        qe.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM queue_entries qe
      JOIN users u ON qe.trainee_id = u.id
      WHERE qe.id = ?`,
      [queueEntry.id]
    );

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

// Leave queue
router.delete('/leave/:queueId', authenticateToken, async (req, res, next) => {
  try {
    const { queueId } = req.params;
    const traineeId = req.user.id;

    // Check ownership
    const [queue] = await pool.execute(
      'SELECT * FROM queue_entries WHERE id = ? AND trainee_id = ?',
      [queueId, traineeId]
    );

    if (queue.length === 0) {
      return res.status(404).json({ error: 'Queue entry not found' });
    }

    // Update status to cancelled
    await pool.execute(
      'UPDATE queue_entries SET status = ? WHERE id = ?',
      ['cancelled', queueId]
    );

    res.json({ message: 'Left queue successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;


