const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Get all exams
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { sessionId, status } = req.query;
    
    let query = `
      SELECT 
        e.*,
        ts.title as session_title,
        ts.session_date
      FROM examinations e
      JOIN training_sessions ts ON e.session_id = ts.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (sessionId) {
      query += ' AND e.session_id = ?';
      params.push(sessionId);
    }
    
    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY e.start_time DESC';
    
    const [exams] = await pool.execute(query, params);
    res.json(exams);
  } catch (error) {
    next(error);
  }
});

// Get single exam with questions
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const [exams] = await pool.execute(
      `SELECT 
        e.*,
        ts.title as session_title
      FROM examinations e
      JOIN training_sessions ts ON e.session_id = ts.id
      WHERE e.id = ?`,
      [req.params.id]
    );

    if (exams.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const exam = exams[0];

    // Get questions (only if user is admin/trainer or has submitted attempt)
    const [attempts] = await pool.execute(
      'SELECT * FROM exam_attempts WHERE exam_id = ? AND trainee_id = ? AND status = "submitted"',
      [req.params.id, req.user.id]
    );

    let questions = [];
    if (req.user.role === 'admin' || req.user.role === 'trainer' || attempts.length > 0) {
      const [questionRows] = await pool.execute(
        'SELECT * FROM exam_questions WHERE exam_id = ? ORDER BY question_order ASC',
        [req.params.id]
      );
      questions = questionRows;
    } else {
      // For active exam, return questions without correct answers
      const [questionRows] = await pool.execute(
        'SELECT id, question_text, question_type, options, points, question_order FROM exam_questions WHERE exam_id = ? ORDER BY question_order ASC',
        [req.params.id]
      );
      questions = questionRows;
    }

    res.json({
      ...exam,
      questions
    });
  } catch (error) {
    next(error);
  }
});

// Create exam (admin/trainer only)
router.post('/', authenticateToken, authorizeRoles('admin', 'trainer'), [
  body('sessionId').isInt(),
  body('title').trim().notEmpty(),
  body('passingScore').isFloat({ min: 0, max: 100 }),
  body('durationMinutes').isInt({ min: 1 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { sessionId, title, description, passingScore, durationMinutes, startTime, endTime } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO examinations 
       (session_id, title, description, passing_score, duration_minutes, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [sessionId, title, description || null, passingScore, durationMinutes, startTime || null, endTime || null, 'draft']
    );

    const [newExam] = await pool.execute(
      'SELECT * FROM examinations WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newExam[0]);
  } catch (error) {
    next(error);
  }
});

// Add question to exam (admin/trainer only)
router.post('/:id/questions', authenticateToken, authorizeRoles('admin', 'trainer'), [
  body('questionText').trim().notEmpty(),
  body('correctAnswer').notEmpty(),
  body('points').isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questionText, questionType, options, correctAnswer, points, questionOrder } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO exam_questions 
       (exam_id, question_text, question_type, options, correct_answer, points, question_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.params.id,
        questionText,
        questionType || 'multiple_choice',
        options ? JSON.stringify(options) : null,
        correctAnswer,
        points || 1.0,
        questionOrder || 0
      ]
    );

    // Update total questions count
    await pool.execute(
      'UPDATE examinations SET total_questions = (SELECT COUNT(*) FROM exam_questions WHERE exam_id = ?) WHERE id = ?',
      [req.params.id, req.params.id]
    );

    const [newQuestion] = await pool.execute(
      'SELECT * FROM exam_questions WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newQuestion[0]);
  } catch (error) {
    next(error);
  }
});

// Start exam attempt
router.post('/:id/start', authenticateToken, async (req, res, next) => {
  try {
    const examId = req.params.id;
    const traineeId = req.user.id;

    // Check if exam exists and is active
    const [exams] = await pool.execute(
      'SELECT * FROM examinations WHERE id = ?',
      [examId]
    );

    if (exams.length === 0) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const exam = exams[0];

    if (exam.status !== 'active') {
      return res.status(400).json({ error: 'Exam is not active' });
    }

    // Check if already attempted
    const [existing] = await pool.execute(
      'SELECT * FROM exam_attempts WHERE exam_id = ? AND trainee_id = ?',
      [examId, traineeId]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Exam already attempted', attempt: existing[0] });
    }

    // Create attempt
    const [result] = await pool.execute(
      'INSERT INTO exam_attempts (trainee_id, exam_id, status) VALUES (?, ?, ?)',
      [traineeId, examId, 'in_progress']
    );

    const [attempt] = await pool.execute(
      'SELECT * FROM exam_attempts WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(attempt[0]);
  } catch (error) {
    next(error);
  }
});

// Submit exam answers
router.post('/:id/submit', authenticateToken, [
  body('answers').isArray()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const examId = req.params.id;
    const traineeId = req.user.id;
    const { answers } = req.body;

    // Get attempt
    const [attempts] = await pool.execute(
      'SELECT * FROM exam_attempts WHERE exam_id = ? AND trainee_id = ? AND status = "in_progress"',
      [examId, traineeId]
    );

    if (attempts.length === 0) {
      return res.status(404).json({ error: 'No active attempt found' });
    }

    const attempt = attempts[0];

    // Get exam and questions
    const [exams] = await pool.execute(
      'SELECT * FROM examinations WHERE id = ?',
      [examId]
    );
    const exam = exams[0];

    const [questions] = await pool.execute(
      'SELECT * FROM exam_questions WHERE exam_id = ?',
      [examId]
    );

    let totalPoints = 0;
    let earnedPoints = 0;

    // Process answers
    for (const answer of answers) {
      const question = questions.find(q => q.id === answer.questionId);
      if (!question) continue;

      totalPoints += parseFloat(question.points);
      const isCorrect = answer.answerText === question.correct_answer;
      const pointsEarned = isCorrect ? parseFloat(question.points) : 0;
      earnedPoints += pointsEarned;

      await pool.execute(
        `INSERT INTO exam_answers (attempt_id, question_id, answer_text, is_correct, points_earned)
         VALUES (?, ?, ?, ?, ?)`,
        [attempt.id, answer.questionId, answer.answerText, isCorrect, pointsEarned]
      );
    }

    const percentageScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
    const passed = percentageScore >= parseFloat(exam.passing_score);

    // Update attempt
    await pool.execute(
      `UPDATE exam_attempts 
       SET submitted_at = NOW(), score = ?, total_points = ?, percentage_score = ?, passed = ?, status = ?
       WHERE id = ?`,
      [earnedPoints, totalPoints, percentageScore, passed, 'submitted', attempt.id]
    );

    const [updatedAttempt] = await pool.execute(
      'SELECT * FROM exam_attempts WHERE id = ?',
      [attempt.id]
    );

    res.json(updatedAttempt[0]);
  } catch (error) {
    next(error);
  }
});

// Get my exam attempts
router.get('/my/attempts', authenticateToken, async (req, res, next) => {
  try {
    const [attempts] = await pool.execute(
      `SELECT 
        ea.*,
        e.title as exam_title,
        e.passing_score,
        ts.title as session_title
      FROM exam_attempts ea
      JOIN examinations e ON ea.exam_id = e.id
      JOIN training_sessions ts ON e.session_id = ts.id
      WHERE ea.trainee_id = ?
      ORDER BY ea.submitted_at DESC`,
      [req.user.id]
    );

    res.json(attempts);
  } catch (error) {
    next(error);
  }
});

module.exports = router;


