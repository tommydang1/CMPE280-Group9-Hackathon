const participantsModel = require("../models/participantsModel");
const participantsController = {
  // Create participant
  createParticipant: async (req, res) => {
    try {
      const { username, event_id, access_token, password } = req.body;
      const participant = await participantsModel.createParticipant(
        username,
        event_id,
        access_token,
        password,
      );
      res.status(201).json({ success: true, participant });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Verify participant login (with password if required)
  verifyParticipant: async (req, res) => {
    try {
      const { username, event_id, password } = req.body;
      const participant = await participantsModel.getParticipantByUsernameAndEvent(
        username,
        parseInt(event_id),
        password,
      );
      
      if (!participant) {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }
      
      if (participant.needs_create) {
        // New user - create them
        const newParticipant = await participantsModel.createParticipant(
          username,
          parseInt(event_id),
          null,
          password,
        );
        return res.status(201).json({ success: true, participant: newParticipant });
      }
      
      if (participant.password_required) {
        return res.status(200).json({ success: true, password_required: true });
      }
      
      res.status(200).json({ success: true, participant });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get participants by event ID
  getParticipantsByEvent: async (req, res) => {
    try {
      const { event_id } = req.params;
      const participants =
        await participantsModel.getParticipantsByEvent(event_id);
      res.status(200).json({ success: true, participants });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  updateParticipant: async (req, res) => {
    try {
      const { id } = req.params;
      const { username } = req.body;
      const participant = await participantsModel.updateParticipant(
        id,
        username,
      );
      res.json({ success: true, participant });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

module.exports = participantsController;
