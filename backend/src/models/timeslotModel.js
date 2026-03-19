const pool = require("../config/db");

const timeslotModel = {
  // Add a timeslot
  // TODO: ERROR HANDLING - event not found, timeslot outside event window, etc.
  addTimeslot: async (participant_id, event_id, start_time) => {
    // Check if the event exists and get start/end
    const eventRes = await pool.query(
      "SELECT start_time, end_time FROM events WHERE id = $1",
      [event_id]
    );

    if (eventRes.rows.length === 0) {
      throw new Error("Event not found");
    }

    const { start_time: eventStart, end_time: eventEnd } = eventRes.rows[0];

    // Validate timeslot within event
    const startTime = new Date(start_time);
    if (startTime < new Date(eventStart) || startTime >= new Date(eventEnd)) {
      throw new Error("Timeslot is outside event time window");
    }

    // Insert timeslot
    const result = await pool.query(
      `INSERT INTO timeslot (participant_id, event_id, start_time)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [participant_id, event_id, start_time]
    );

    return result.rows[0];
  },

  // Get all timeslots for a specific event
  getTimeslotsByEvent: async (event_id) => {
    const result = await pool.query(
      `SELECT t.id, t.participant_id, t.start_time, t.created_at, p.username
       FROM timeslot t
       JOIN participants p ON t.participant_id = p.id
       WHERE t.event_id = $1
       ORDER BY t.start_time ASC`,
      [event_id]
    );

    return result.rows;
  }
};

module.exports = timeslotModel;