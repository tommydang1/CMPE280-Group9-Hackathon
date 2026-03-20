const pool = require("../config/db");
const timeslotModel = require("../models/timeslotModel");

const timeslotController = {
  // Add a timeslot
  addTimeslot: async (req, res) => {
    try {
      const { participant_id, event_id, start_time } = req.body;

      if (!participant_id || !event_id || !start_time) {
        return res.status(400).json({
          success: false,
          error: "participant_id, event_id, and start_time are required",
        });
      }

      const slot = await timeslotModel.addTimeslot(
        participant_id,
        event_id,
        start_time,
      );
      res.status(201).json({ success: true, slot });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get all timeslots for an event
  getTimeslotsByEvent: async (req, res) => {
    try {
      const { event_id } = req.params;
      const slots = await timeslotModel.getTimeslotsByEvent(event_id);
      res.status(200).json({ success: true, slots });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },
  // delete overlapped timeslot
  deleteTimeslot: async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM timeslot WHERE id = $1", [id]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },
};

module.exports = timeslotController;
