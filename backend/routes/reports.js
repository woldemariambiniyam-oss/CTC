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
        SUM(CASE WHEN c.expiry_date < NOW() THEN 1 ELSE 0 END) as expired_count,
        SUM(CASE WHEN c.collection_status = 'collected' THEN 1 ELSE 0 END) as collected_count,
        SUM(CASE WHEN c.collection_status = 'ready_for_collection' THEN 1 ELSE 0 END) as pending_collection_count
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

// Get trainer evaluation metrics
router.get('/trainer-metrics', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { trainerId, startDate, endDate } = req.query;

    let query = `
      SELECT 
        u.id as trainer_id,
        u.first_name,
        u.last_name,
        u.email,
        COUNT(DISTINCT ts.id) as total_sessions,
        COUNT(DISTINCT se.trainee_id) as total_trainees,
        AVG(ea.percentage_score) as avg_trainee_score,
        COUNT(DISTINCT ea.id) as total_exam_attempts,
        SUM(CASE WHEN ea.passed = 1 THEN 1 ELSE 0 END) as passed_exams,
        COUNT(DISTINCT c.id) as certificates_issued,
        AVG(ta.score) as avg_practical_score
      FROM users u
      LEFT JOIN training_sessions ts ON u.id = ts.trainer_id
      LEFT JOIN session_enrollments se ON ts.id = se.session_id
      LEFT JOIN examinations e ON ts.id = e.session_id
      LEFT JOIN exam_attempts ea ON e.id = ea.exam_id AND ea.status = 'submitted'
      LEFT JOIN certificates c ON ts.id = c.session_id
      LEFT JOIN trainer_assessments ta ON u.id = ta.trainer_id
      WHERE u.role = 'trainer'
    `;

    const params = [];

    if (trainerId) {
      query += ' AND u.id = ?';
      params.push(trainerId);
    }

    if (startDate) {
      query += ' AND ts.session_date >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND ts.session_date <= ?';
      params.push(endDate);
    }

    query += ' GROUP BY u.id ORDER BY avg_trainee_score DESC';

    const [metrics] = await pool.execute(query, params);

    res.json(metrics);
  } catch (error) {
    next(error);
  }
});

// Custom report builder
router.post('/custom', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { reportType, filters, groupBy, dateRange } = req.body;

    let query = '';
    const params = [];

    switch (reportType) {
      case 'attendance':
        query = `
          SELECT 
            ${groupBy === 'session' ? 'ts.id, ts.title,' : ''}
            ${groupBy === 'trainee' ? 'u.id as trainee_id, u.first_name, u.last_name,' : ''}
            COUNT(se.id) as total_enrollments,
            SUM(CASE WHEN se.status = 'attended' THEN 1 ELSE 0 END) as attended,
            SUM(CASE WHEN se.status = 'absent' THEN 1 ELSE 0 END) as absent,
            ROUND(SUM(CASE WHEN se.status = 'attended' THEN 1 ELSE 0 END) / COUNT(se.id) * 100, 2) as attendance_rate
          FROM session_enrollments se
          JOIN training_sessions ts ON se.session_id = ts.id
          JOIN users u ON se.trainee_id = u.id
          WHERE 1=1
        `;
        break;

      case 'performance':
        query = `
          SELECT 
            ${groupBy === 'session' ? 'ts.id, ts.title,' : ''}
            ${groupBy === 'trainee' ? 'u.id as trainee_id, u.first_name, u.last_name,' : ''}
            AVG(ea.percentage_score) as avg_score,
            COUNT(ea.id) as exam_attempts,
            SUM(CASE WHEN ea.passed = 1 THEN 1 ELSE 0 END) as passed_count
          FROM exam_attempts ea
          JOIN examinations e ON ea.exam_id = e.id
          JOIN training_sessions ts ON e.session_id = ts.id
          JOIN users u ON ea.trainee_id = u.id
          WHERE ea.status = 'submitted'
        `;
        break;

      default:
        return res.status(400).json({ error: 'Invalid report type' });
    }

    // Apply filters
    if (filters) {
      if (filters.sessionId) {
        query += ' AND ts.id = ?';
        params.push(filters.sessionId);
      }
      if (filters.traineeId) {
        query += ' AND u.id = ?';
        params.push(filters.traineeId);
      }
      if (filters.trainerId) {
        query += ' AND ts.trainer_id = ?';
        params.push(filters.trainerId);
      }
    }

    // Apply date range
    if (dateRange) {
      if (dateRange.start) {
        query += ' AND ts.session_date >= ?';
        params.push(dateRange.start);
      }
      if (dateRange.end) {
        query += ' AND ts.session_date <= ?';
        params.push(dateRange.end);
      }
    }

    // Group by
    if (groupBy === 'session') {
      query += ' GROUP BY ts.id';
    } else if (groupBy === 'trainee') {
      query += ' GROUP BY u.id';
    }

    query += ' ORDER BY 1 DESC';

    const [results] = await pool.execute(query, params);

    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


