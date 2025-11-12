const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const auditService = require('../services/auditService');

const router = express.Router();

// Get all questions from bank
router.get('/', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { category, skillLevel, search } = req.query;
    
    let query = 'SELECT * FROM question_bank WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (skillLevel) {
      query += ' AND skill_level = ?';
      params.push(skillLevel);
    }

    if (search) {
      query += ' AND question_text LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY created_at DESC';

    const [questions] = await pool.execute(query, params);
    res.json(questions);
  } catch (error) {
    next(error);
  }
});

// Get single question
router.get('/:id', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const [questions] = await pool.execute(
      'SELECT * FROM question_bank WHERE id = ?',
      [req.params.id]
    );

    if (questions.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(questions[0]);
  } catch (error) {
    next(error);
  }
});

// Create question in bank
router.post('/', authenticateToken, authorizeRoles('admin', 'trainer'), [
  body('questionText').trim().notEmpty(),
  body('correctAnswer').notEmpty(),
  body('points').isFloat({ min: 0 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { questionText, questionType, category, skillLevel, options, correctAnswer, points } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO question_bank 
       (question_text, question_type, category, skill_level, options, correct_answer, points, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        questionText,
        questionType || 'multiple_choice',
        category || null,
        skillLevel || 'beginner',
        options ? JSON.stringify(options) : null,
        correctAnswer,
        points || 1.0,
        req.user.id
      ]
    );

    const [newQuestion] = await pool.execute(
      'SELECT * FROM question_bank WHERE id = ?',
      [result.insertId]
    );

    await auditService.logAction(req.user.id, 'QUESTION_CREATED', 'question_bank', result.insertId, {}, req);

    res.status(201).json(newQuestion[0]);
  } catch (error) {
    next(error);
  }
});

// Update question
router.put('/:id', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    const { questionText, questionType, category, skillLevel, options, correctAnswer, points } = req.body;

    await pool.execute(
      `UPDATE question_bank 
       SET question_text = ?, question_type = ?, category = ?, skill_level = ?, 
           options = ?, correct_answer = ?, points = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        questionText,
        questionType,
        category,
        skillLevel,
        options ? JSON.stringify(options) : null,
        correctAnswer,
        points,
        req.params.id
      ]
    );

    await auditService.logAction(req.user.id, 'QUESTION_UPDATED', 'question_bank', req.params.id, {}, req);

    const [updated] = await pool.execute(
      'SELECT * FROM question_bank WHERE id = ?',
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (error) {
    next(error);
  }
});

// Delete question
router.delete('/:id', authenticateToken, authorizeRoles('admin', 'trainer'), async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM question_bank WHERE id = ?', [req.params.id]);

    await auditService.logAction(req.user.id, 'QUESTION_DELETED', 'question_bank', req.params.id, {}, req);

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// Get random questions for exam
router.post('/random', authenticateToken, authorizeRoles('admin', 'trainer'), [
  body('count').isInt({ min: 1 }),
  body('category').optional(),
  body('skillLevel').optional()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { count, category, skillLevel } = req.body;

    let query = 'SELECT * FROM question_bank WHERE 1=1';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (skillLevel) {
      query += ' AND skill_level = ?';
      params.push(skillLevel);
    }

    query += ' ORDER BY RAND() LIMIT ?';
    params.push(count);

    const [questions] = await pool.execute(query, params);

    res.json(questions);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

