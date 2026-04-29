const pool = require("../config/db");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const participantsModel = {
  // Create a new participant with optional access token and password
  createParticipant: async (username, event_id, access_token = null, password = null) => {
    if (!access_token) {
      access_token = crypto.randomBytes(16).toString("hex");
    }

    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const query = `
      INSERT INTO participants (username, event_id, access_token, password)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const result = await pool.query(query, [username, event_id, access_token, hashedPassword]);
    return result.rows[0];
  },

  // Get participant by access token
  getParticipantByToken: async (token) => {
    const query = `SELECT * FROM participants WHERE access_token = $1`;
    const result = await pool.query(query, [token]);
    return result.rows[0];
  },

  // Get participant by username and event_id (with password verification)
  getParticipantByUsernameAndEvent: async (username, event_id, password = null) => {
    const query = `SELECT * FROM participants WHERE LOWER(username) = LOWER($1) AND event_id = $2`;
    const result = await pool.query(query, [username, event_id]);
    const participant = result.rows[0];
    
    // If participant doesn't exist, return special flag to create new one
    if (!participant) {
      return { needs_create: true, username, event_id };
    }
    
    // If participant exists and has a password, verify it
    if (participant.password) {
      if (!password) {
        return { ...participant, password_required: true };
      }
      const valid = await bcrypt.compare(password, participant.password);
      if (!valid) {
        return null;
      }
    }
    
    return participant;
  },

  // Get participants by event ID
  getParticipantsByEvent: async (event_id) => {
    const query = `SELECT * FROM participants WHERE event_id = $1`;
    const result = await pool.query(query, [event_id]);
    return result.rows;
  },
  // Update participant name
  updateParticipant: async (id, username) => {
    const result = await pool.query(
      "UPDATE participants SET username = $1 WHERE id = $2 RETURNING *",
      [username, id],
    );
    return result.rows[0];
  },
};

module.exports = participantsModel;
