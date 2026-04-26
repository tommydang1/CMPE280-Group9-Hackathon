const pool = require("../config/db");
const crypto = require("crypto");
const eventsModel = {
  // Create a new event with timestamp start/end
  createEvent: async (title, description, start_time, end_time, adminToken) => {
    console.log("model createEvent hit, token:", adminToken); // ← check this

    console.log("hello generated:");

    const query = `
    INSERT INTO events (title, description, start_time, end_time, admin_token)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
    const result = await pool.query(query, [
      title,
      description,
      start_time,
      end_time,
      adminToken,
    ]);
    console.log("inserted row:", result.rows[0]);
    return result.rows[0];
  },

  // Get a single event by ID
  getEventById: async (id) => {
    const result = await pool.query(`SELECT * FROM events WHERE id = $1`, [id]);
    return result.rows[0];
  },

  // Get all events ordered by start_time
  getAllEvents: async () => {
    const result = await pool.query(
      `SELECT * FROM events ORDER BY start_time ASC`,
    );
    return result.rows;
  },
  // used only inside verifyAdmin
  getEventWithToken: async (id) => {
    const query = `SELECT * FROM events WHERE id = $1;`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  },

  // edit name and time range
  editEvent: async (id, fields) => {
    const { title, start_time, end_time } = fields;
    const query = `
    UPDATE events
    SET
      title      = COALESCE($1, title),
      start_time = COALESCE($2, start_time),
      end_time   = COALESCE($3, end_time)
    WHERE id = $4
    RETURNING id, title, description, start_time, end_time;
  `;
    const result = await pool.query(query, [
      title || null,
      start_time || null,
      end_time || null,
      id,
    ]);
    return result.rows[0];
  },
};

module.exports = eventsModel;
