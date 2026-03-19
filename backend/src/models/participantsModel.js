const pool = require("../config/db");
const crypto = require("crypto");

const participantsModel = {
  // Create a new participant with optional access token
  createParticipant: async (username, event_id, access_token = null) => {
    if (!access_token) {
      access_token = crypto.randomBytes(16).toString("hex");
    }

    const query = `
      INSERT INTO participants (username, event_id, access_token)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const result = await pool.query(query, [username, event_id, access_token]);
    return result.rows[0];
  },

  // Get participant by access token
  getParticipantByToken: async (token) => {
    const query = `SELECT * FROM participants WHERE access_token = $1`;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  },

  // Get participants by event ID
  getParticipantsByEvent: async (event_id) => {
    const query = `SELECT * FROM participants WHERE event_id = $1`;
    const result = await pool.query(query, [event_id]);
    return result.rows;
  }
};

module.exports = participantsModel;