const timeslotModel = require("../models/timeslotModel");

const timeslotController = {
  // Create timeslot for participant
  addTimeslot: async (req, res) => {
    try {
      const { participant_id, start_time } = req.body;
      const slot = await timeslotModel.addTimeslot(participant_id, start_time);
      res.status(201).json({ success: true, slot });
    } catch (error) {
      console.error(error);
      res.status(400).json({ success: false, error: error.message });
    }
  },

  // Get timeslots by event ID
  getTimeslotsByEvent: async (req, res) => {
    try {
      const { event_id } = req.params;
      const slots = await timeslotModel.getTimeslotsByEvent(event_id);
      res.status(200).json({ success: true, slots });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = timeslotController;