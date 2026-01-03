const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth } = require('../middleware/auth');

// Get availability
router.get('/', auth, async (req, res) => {
  try {
    const { date, start_date, end_date, user_id } = req.query;
    
    let query = `
      SELECT a.*, u.name, u.email, u.role_category, u.contact, u.emergency_contact
      FROM availability a
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (date) {
      query += ` AND a.date = $${paramCount}`;
      params.push(date);
      paramCount++;
    }

    if (start_date) {
      query += ` AND a.date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND a.date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    if (user_id) {
      query += ` AND a.user_id = $${paramCount}`;
      params.push(user_id);
      paramCount++;
    }

    query += ' ORDER BY a.date ASC';

    const result = await pool.query(query, params);
    res.json({ availability: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit availability
router.post('/', auth, async (req, res) => {
  const { date, available, notes } = req.body;

  try {
    // Check if availability already exists
    const existing = await pool.query(
      'SELECT * FROM availability WHERE date = $1 AND user_id = $2',
      [date, req.user.id]
    );

    let result;
    if (existing.rows.length > 0) {
      // Update existing
      result = await pool.query(
        `UPDATE availability SET available = $1, notes = $2, submitted_at = NOW() 
         WHERE date = $3 AND user_id = $4 RETURNING *`,
        [available, notes, date, req.user.id]
      );
    } else {
      // Insert new
      result = await pool.query(
        `INSERT INTO availability (date, user_id, available, notes)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [date, req.user.id, available, notes]
      );
    }

    res.status(201).json({ availability: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit bulk availability
router.post('/bulk', auth, async (req, res) => {
  const { dates, available, notes } = req.body;

  try {
    const results = [];

    for (const date of dates) {
      const existing = await pool.query(
        'SELECT * FROM availability WHERE date = $1 AND user_id = $2',
        [date, req.user.id]
      );

      let result;
      if (existing.rows.length > 0) {
        result = await pool.query(
          `UPDATE availability SET available = $1, notes = $2, submitted_at = NOW() 
           WHERE date = $3 AND user_id = $4 RETURNING *`,
          [available, notes, date, req.user.id]
        );
      } else {
        result = await pool.query(
          `INSERT INTO availability (date, user_id, available, notes)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [date, req.user.id, available, notes]
        );
      }
      results.push(result.rows[0]);
    }

    res.status(201).json({ availability: results });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete availability
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM availability WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Availability not found or unauthorized' });
    }

    res.json({ message: 'Availability deleted', availability: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
