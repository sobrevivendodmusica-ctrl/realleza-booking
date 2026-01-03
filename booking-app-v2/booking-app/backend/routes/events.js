const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');

// Get all events
router.get('/', auth, async (req, res) => {
  try {
    const { start_date, end_date, status } = req.query;
    
    let query = 'SELECT * FROM events WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (start_date) {
      query += ` AND date >= $${paramCount}`;
      params.push(start_date);
      paramCount++;
    }

    if (end_date) {
      query += ` AND date <= $${paramCount}`;
      params.push(end_date);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY date ASC';

    const result = await pool.query(query, params);
    res.json({ events: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single event with bookings
router.get('/:id', auth, async (req, res) => {
  try {
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const positionsResult = await pool.query(
      'SELECT * FROM event_positions WHERE event_id = $1',
      [req.params.id]
    );

    const bookingsResult = await pool.query(
      `SELECT b.*, u.name, u.contact, u.emergency_contact, u.role_category
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.event_id = $1`,
      [req.params.id]
    );

    res.json({
      event: eventResult.rows[0],
      positions: positionsResult.rows,
      bookings: bookingsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create event (managers only)
router.post('/', [auth, checkRole(['manager'])], [
  body('date').isDate(),
  body('space').notEmpty(),
  body('time').notEmpty(),
  body('event_name').notEmpty(),
  body('positions').isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { date, space, time, event_name, positions, notes } = req.body;

  try {
    // Create event
    const eventResult = await pool.query(
      `INSERT INTO events (date, space, time, event_name, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [date, space, time, event_name, notes, req.user.id]
    );

    const event = eventResult.rows[0];

    // Insert positions
    for (const position of positions) {
      await pool.query(
        `INSERT INTO event_positions (event_id, position, quantity)
         VALUES ($1, $2, $3)`,
        [event.id, position.role, position.quantity || 1]
      );
    }

    res.status(201).json({ event });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update event (managers only)
router.put('/:id', [auth, checkRole(['manager'])], async (req, res) => {
  const { date, space, time, event_name, band_requirement, sound_requirement, notes, status } = req.body;

  try {
    const result = await pool.query(
      `UPDATE events SET date = $1, space = $2, time = $3, event_name = $4, 
       band_requirement = $5, sound_requirement = $6, notes = $7, status = $8, updated_at = NOW()
       WHERE id = $9 RETURNING *`,
      [date, space, time, event_name, band_requirement, sound_requirement, notes, status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ event: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete event (managers only)
router.delete('/:id', [auth, checkRole(['manager'])], async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM events WHERE id = $1 RETURNING *', [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted', event: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get event roster
router.get('/:id/roster', auth, async (req, res) => {
  try {
    const eventResult = await pool.query('SELECT * FROM events WHERE id = $1', [req.params.id]);
    
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const bookingsResult = await pool.query(
      'SELECT * FROM bookings WHERE event_id = $1 ORDER BY position',
      [req.params.id]
    );

    res.json({
      event: eventResult.rows[0],
      team: bookingsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
