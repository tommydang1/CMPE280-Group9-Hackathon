const pool = require("../config/db");
const eventsModel = require("./eventsModel");

const timeslotModel = {
  // Create a timeslot for a participant
  addTimeslot: async (participant_id, start_time) => {
    const participantRes = await pool.query(
      "SELECT event_id FROM participants WHERE id = $1",
      [participant_id]
    );
    if (participantRes.rowCount === 0) throw new Error("Participant not found");

    const event_id = participantRes.rows[0].event_id;

    const event = await eventsModel.getEventById(event_id);
    const slotDate = new Date(start_time);
    if (slotDate < new Date(event.start_date) || slotDate > new Date(event.end_date)) {
      throw new Error("Selected timeslot is outside event date range");
    }

    const query = `
      INSERT INTO timeslot (participant_id, start_time)
      VALUES ($1, $2)
      ON CONFLICT (participant_id, start_time) DO NOTHING
      RETURNING *;
    `;
    const result = await pool.query(query, [participant_id, start_time]);
    return result.rows[0];
  },

  // Get all timeslots for a given event ID
  getTimeslotsByEvent: async (event_id) => {
    const query = `
      SELECT t.start_time, p.username
      FROM timeslot t
      JOIN participants p ON p.id = t.participant_id
      WHERE p.event_id = $1
      ORDER BY t.start_time, p.username
    `;
    const result = await pool.query(query, [event_id]);
    return result.rows;
  }
};

module.exports = timeslotModel;