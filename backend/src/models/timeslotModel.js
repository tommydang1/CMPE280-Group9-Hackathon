const pool = require("../config/db");

const timeslotModel = {
  addTimeslot: async (participant_id, event_id, start_time) => {
    const eventRes = await pool.query("SELECT id FROM events WHERE id = $1", [
      event_id,
    ]);

    if (eventRes.rows.length === 0) {
      throw new Error("Event not found");
    }

    const result = await pool.query(
      `INSERT INTO timeslot (participant_id, event_id, start_time)
       VALUES ($1, $2, $3)
       ON CONFLICT DO NOTHING
       RETURNING *`,
      [participant_id, event_id, start_time],
    );

    return result.rows[0];
  },

  getTimeslotsByEvent: async (event_id) => {
    const result = await pool.query(
      `SELECT t.id, t.participant_id, t.start_time, t.created_at, p.username
       FROM timeslot t
       JOIN participants p ON t.participant_id = p.id
       WHERE t.event_id = $1
       ORDER BY t.start_time ASC`,
      [event_id],
    );
    return result.rows;
  },

  deleteTimeslot: async (id) => {
    await pool.query("DELETE FROM timeslot WHERE id = $1", [id]);
  },
};

module.exports = timeslotModel;
