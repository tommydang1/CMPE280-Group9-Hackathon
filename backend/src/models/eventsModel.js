const pool = require("../config/db");

const eventsModel = {
  // Create a new event with timestamp start/end
  createEvent: async (title, description, start_time, end_time) => {
    const query = `
      INSERT INTO events (title, description, start_time, end_time)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [title, description, start_time, end_time]);
    return result.rows[0];
  },

  // Get a single event by ID
  getEventById: async (id) => {
    const result = await pool.query(`SELECT * FROM events WHERE id = $1`, [id]);
    return result.rows[0];
  },

  // Get all events ordered by start_time
  getAllEvents: async () => {
    const result = await pool.query(`SELECT * FROM events ORDER BY start_time ASC`);
    return result.rows;
  }
};

module.exports = eventsModel;