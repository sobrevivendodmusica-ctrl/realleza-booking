const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { auth, checkRole } = require('../middleware/auth');

// Create booking (musical director or head of sound)
router.post('/', [auth, checkRole(['musical_director', 'head_of_sound'])], async (req, res) => {
  const { event_id, position, user_id } = req.body;

  try {
    // Get the user being booked
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [user_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const bookedUser = userResult.rows[0];

    // Check if user's role_category matches the position
    if (bookedUser.role_category !== position) {
      return res.status(400).json({ 
        error: `This person is registered as ${bookedUser.role_category}, not ${position}` 
      });
    }

    // Check if person is available
    const availResult = await pool.query(
      `SELECT * FROM availability 
       WHERE date = (SELECT date FROM events WHERE id = $1) 
       AND user_id = $2 AND available = true`,
      [event_id, user_id]
    );

    if (availResult.rows.length === 0) {
      return res.status(400).json({ error: 'Person is not available on this date' });
    }

    // Check if already booked for this event
    const existingBooking = await pool.query(
      'SELECT * FROM bookings WHERE event_id = $1 AND user_id = $2',
      [event_id, user_id]
    );

    if (existingBooking.rows.length > 0) {
      return res.status(400).json({ error: 'Person already booked for this event' });
    }

    // Create booking
    const result = await pool.query(
      `INSERT INTO bookings (event_id, position, user_id, booked_by)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [event_id, position, user_id, req.user.id]
    );

    // Update event status
    await updateEventStatus(event_id);

    res.status(201).json({ 
      booking: result.rows[0],
      message: `${bookedUser.name} booked for ${position}. Awaiting confirmation.`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Accept booking
router.put('/:id/accept', auth, async (req, res) => {
  try {
    // Check if booking belongs to user
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (booking.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update booking status
    const result = await pool.query(
      `UPDATE bookings SET status = 'confirmed', confirmed_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    // Update event status
    await updateEventStatus(booking.rows[0].event_id);

    res.json({ 
      booking: result.rows[0],
      message: 'Booking confirmed'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Decline booking
router.put('/:id/decline', auth, async (req, res) => {
  try {
    // Check if booking belongs to user
    const booking = await pool.query(
      'SELECT * FROM bookings WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );

    if (booking.rows.length === 0) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Update booking status
    const result = await pool.query(
      `UPDATE bookings SET status = 'declined' WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    // Update event status
    await updateEventStatus(booking.rows[0].event_id);

    res.json({ 
      booking: result.rows[0],
      message: 'Booking declined'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get my bookings
router.get('/my-bookings', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, e.date, e.event_name, e.space, e.time 
       FROM bookings b 
       JOIN events e ON b.event_id = e.id 
       WHERE b.user_id = $1 
       ORDER BY e.date ASC`,
      [req.user.id]
    );

    const pending = result.rows.filter(b => b.status === 'pending');
    const confirmed = result.rows.filter(b => b.status === 'confirmed');

    res.json({ pending, confirmed });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get booking needs (for musical director / head of sound)
router.get('/booking-needs', [auth, checkRole(['musical_director', 'head_of_sound'])], async (req, res) => {
  try {
    const events = await pool.query(
      `SELECT * FROM events WHERE status IN ('unfilled', 'partially_filled') ORDER BY date ASC`
    );

    const eventsWithDetails = await Promise.all(events.rows.map(async (event) => {
      // Get positions needed
      const positions = await pool.query(
        'SELECT * FROM event_positions WHERE event_id = $1',
        [event.id]
      );

      // Get existing bookings
      const bookings = await pool.query(
        `SELECT b.*, u.name, u.role_category 
         FROM bookings b 
         JOIN users u ON b.user_id = u.id 
         WHERE b.event_id = $1`,
        [event.id]
      );

      // For each position, get available people with matching role
      const positionsWithAvailability = await Promise.all(positions.rows.map(async (pos) => {
        // Get people available on this date with matching role_category
        const available = await pool.query(
          `SELECT u.id, u.name, u.contact, u.emergency_contact, u.role_category, a.notes
           FROM users u
           JOIN availability a ON u.id = a.user_id
           WHERE a.date = $1 AND a.available = true AND u.role_category = $2
           AND u.id NOT IN (SELECT user_id FROM bookings WHERE event_id = $3)`,
          [event.date, pos.position, event.id]
        );

        // Count how many of this position are already booked
        const bookedCount = bookings.rows.filter(b => b.position === pos.position).length;
        const remainingNeeded = pos.quantity - bookedCount;

        return {
          position: pos.position,
          quantity_needed: pos.quantity,
          booked_count: bookedCount,
          remaining_needed: remainingNeeded,
          available_people: available.rows
        };
      }));

      return {
        ...event,
        positions: positionsWithAvailability,
        bookings: bookings.rows
      };
    }));

    res.json({ events: eventsWithDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper function to update event status
async function updateEventStatus(eventId) {
  const bookings = await pool.query('SELECT * FROM bookings WHERE event_id = $1', [eventId]);
  
  if (bookings.rows.length === 0) {
    await pool.query(`UPDATE events SET status = 'unfilled' WHERE id = $1`, [eventId]);
  } else {
    const allConfirmed = bookings.rows.every(b => b.status === 'confirmed');
    const anyConfirmed = bookings.rows.some(b => b.status === 'confirmed');
    
    if (allConfirmed) {
      await pool.query(`UPDATE events SET status = 'confirmed' WHERE id = $1`, [eventId]);
    } else if (anyConfirmed) {
      await pool.query(`UPDATE events SET status = 'partially_filled' WHERE id = $1`, [eventId]);
    } else {
      await pool.query(`UPDATE events SET status = 'unfilled' WHERE id = $1`, [eventId]);
    }
  }
}

module.exports = router;
