const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const rankingService = require('../services/rankingService');
const auditService = require('../services/auditService');

const router = express.Router();

// Calculate ranking for a trainee
router.post('/calculate/:sessionId', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { traineeId } = req.body;

    if (!traineeId) {
      return res.status(400).json({ error: 'Trainee ID is required' });
    }

    const ranking = await rankingService.calculateRanking(traineeId, sessionId);

    await auditService.logAction(req.user.id, 'RANKING_CALCULATED', 'ranking', traineeId, { sessionId }, req);

    res.json(ranking);
  } catch (error) {
    next(error);
  }
});

// Get leaderboard for a session
router.get('/leaderboard/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    const leaderboard = await rankingService.getLeaderboard(sessionId, limit);

    res.json(leaderboard);
  } catch (error) {
    next(error);
  }
});

// Get my ranking
router.get('/my/:sessionId', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const traineeId = req.user.id;

    const [rankings] = await pool.execute(
      `SELECT 
        tr.*,
        l.rank_position as leaderboard_rank
      FROM trainee_rankings tr
      LEFT JOIN leaderboards l ON tr.trainee_id = l.trainee_id AND tr.session_id = l.session_id
      WHERE tr.trainee_id = ? AND tr.session_id = ?`,
      [traineeId, sessionId]
    );

    if (rankings.length === 0) {
      return res.status(404).json({ error: 'Ranking not found. It may need to be calculated first.' });
    }

    res.json(rankings[0]);
  } catch (error) {
    next(error);
  }
});

// Get all rankings for a session (admin/trainer)
router.get('/session/:sessionId', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    const [rankings] = await pool.execute(
      `SELECT 
        tr.*,
        u.first_name,
        u.last_name,
        u.email,
        l.rank_position
      FROM trainee_rankings tr
      JOIN users u ON tr.trainee_id = u.id
      LEFT JOIN leaderboards l ON tr.trainee_id = l.trainee_id AND tr.session_id = l.session_id
      WHERE tr.session_id = ?
      ORDER BY tr.total_score DESC`,
      [sessionId]
    );

    res.json(rankings);
  } catch (error) {
    next(error);
  }
});

// Recalculate all rankings for a session
router.post('/recalculate/:sessionId', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    // Get all trainees in the session
    const [enrollments] = await pool.execute(
      'SELECT DISTINCT trainee_id FROM session_enrollments WHERE session_id = ?',
      [sessionId]
    );

    // Calculate ranking for each trainee
    for (const enrollment of enrollments) {
      await rankingService.calculateRanking(enrollment.trainee_id, sessionId);
    }

    await auditService.logAction(req.user.id, 'RANKINGS_RECALCULATED', 'ranking', null, { sessionId }, req);

    res.json({ message: 'Rankings recalculated successfully', count: enrollments.length });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

