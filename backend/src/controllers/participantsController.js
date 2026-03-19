const participantsModel = require("../models/participantsModel");
const participantsController = {
  // Create participant
  createParticipant: async (req, res) => {
    try {
      const { username, event_id, access_token } = req.body;
      const participant = await participantsModel.createParticipant(
        username,
        event_id,
        access_token,
      );
      res.status(201).json({ success: true, participant });
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
