const express = require('express');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get dashboard statistics
router.get('/dashboard', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    let stats = {};

    if (role === 'trainee') {
      // Trainee statistics
      const [enrollments] = await pool.execute(
        'SELECT COUNT(*) as total FROM session_enrollments WHERE trainee_id = ?',
        [userId]
      );

      const [completedSessions] = await pool.execute(
        `SELECT COUNT(*) as total FROM session_enrollments 
         WHERE trainee_id = ? AND status = 'attended'`,
        [userId]
      );

      const [certificates] = await pool.execute(
        'SELECT COUNT(*) as total FROM certificates WHERE trainee_id = ? AND status = "issued"',
        [userId]
      );

      const [examAttempts] = await pool.execute(
        'SELECT COUNT(*) as total FROM exam_attempts WHERE trainee_id = ?',
        [userId]
      );

      const [passedExams] = await pool.execute(
        'SELECT COUNT(*) as total FROM exam_attempts WHERE trainee_id = ? AND passed = 1',
        [userId]
      );

      stats = {
        totalEnrollments: enrollments[0].total,
        completedSessions: completedSessions[0].total,
        certificates: certificates[0].total,
        examAttempts: examAttempts[0].total,
        passedExams: passedExams[0].total
      };
    } else {
      // Admin/Trainer statistics
      const [totalSessions] = await pool.execute(
        'SELECT COUNT(*) as total FROM training_sessions'
      );

      const [activeSessions] = await pool.execute(
        'SELECT COUNT(*) as total FROM training_sessions WHERE status = "scheduled" OR status = "in_progress"'
      );

      const [totalTrainees] = await pool.execute(
        'SELECT COUNT(*) as total FROM users WHERE role = "trainee"'
      );

      const [totalCertificates] = await pool.execute(
        'SELECT COUNT(*) as total FROM certificates WHERE status = "issued"'
      );

      const [totalExams] = await pool.execute(
        'SELECT COUNT(*) as total FROM examinations'
      );

      stats = {
        totalSessions: totalSessions[0].total,
        activeSessions: activeSessions[0].total,
        totalTrainees: totalTrainees[0].total,
        totalCertificates: totalCertificates[0].total,
        totalExams: totalExams[0].total
      };
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// Get attendance statistics
router.get('/attendance', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { sessionId, startDate, endDate } = req.query;

    let query = `
      SELECT 
        ts.id,
        ts.title,
        ts.session_date,
        COUNT(se.id) as total_enrollments,
        SUM(CASE WHEN se.status = 'attended' THEN 1 ELSE 0 END) as attended_count,
        SUM(CASE WHEN se.status = 'absent' THEN 1 ELSE 0 END) as absent_count
      FROM training_sessions ts
      LEFT JOIN session_enrollments se ON ts.id = se.session_id
      WHERE 1=1
    `;

    const params = [];

    if (sessionId) {
      query += ' AND ts.id = ?';
      params.push(sessionId);
    }

    if (startDate) {
      query += ' AND ts.session_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND ts.session_date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY ts.id ORDER BY ts.session_date DESC';

    const [results] = await pool.execute(query, params);

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Get performance statistics
router.get('/performance', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { examId, traineeId } = req.query;

    let query = `
      SELECT 
        e.id as exam_id,
        e.title as exam_title,
        COUNT(ea.id) as total_attempts,
        AVG(ea.percentage_score) as average_score,
        SUM(CASE WHEN ea.passed = 1 THEN 1 ELSE 0 END) as passed_count,
        SUM(CASE WHEN ea.passed = 0 THEN 1 ELSE 0 END) as failed_count
      FROM examinations e
      LEFT JOIN exam_attempts ea ON e.id = ea.exam_id AND ea.status = 'submitted'
      WHERE 1=1
    `;

    const params = [];

    if (examId) {
      query += ' AND e.id = ?';
      params.push(examId);
    }

    if (traineeId) {
      query += ' AND ea.trainee_id = ?';
      params.push(traineeId);
    }

    query += ' GROUP BY e.id ORDER BY e.start_time DESC';

    const [results] = await pool.execute(query, params);

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Get enrollment trends
router.get('/enrollment-trends', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { months = 6 } = req.query;

    const [results] = await pool.execute(
      `SELECT 
        DATE_FORMAT(se.enrollment_date, '%Y-%m') as month,
        COUNT(*) as enrollment_count
      FROM session_enrollments se
      WHERE se.enrollment_date >= DATE_SUB(NOW(), INTERVAL ? MONTH)
      GROUP BY DATE_FORMAT(se.enrollment_date, '%Y-%m')
      ORDER BY month ASC`,
      [months]
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// Get certificate statistics
router.get('/certificates', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const [results] = await pool.execute(
      `SELECT 
        DATE_FORMAT(c.issue_date, '%Y-%m') as month,
        COUNT(*) as certificate_count,
        SUM(CASE WHEN c.status = 'issued' THEN 1 ELSE 0 END) as issued_count,
        SUM(CASE WHEN c.status = 'revoked' THEN 1 ELSE 0 END) as revoked_count,
        SUM(CASE WHEN c.expiry_date < NOW() THEN 1 ELSE 0 END) as expired_count
      FROM certificates c
      WHERE c.issue_date >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(c.issue_date, '%Y-%m')
      ORDER BY month ASC`
    );

    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


