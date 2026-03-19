const eventsModel = require("../models/eventsModel");

const eventsController = {
  // Create event
  createEvent: async (req, res) => {
    try {
      const { title, description, start_time, end_time } = req.body;

      // Validate timestamps
      if (!title || !start_time || !end_time) {
        return res.status(400).json({
          success: false,
          error: "Title, start_time, and end_time are required"
        });
      }

      if (new Date(start_time) > new Date(end_time)) {
        return res.status(400).json({
          success: false,
          error: "start_time cannot be after end_time"
        });
      }

      const event = await eventsModel.createEvent(title, description, start_time, end_time);
      res.status(201).json({ success: true, event });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get all events
  getAllEvents: async (req, res) => {
    try {
      const events = await eventsModel.getAllEvents();
      res.status(200).json({ success: true, events });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // Get event by ID
  getEventById: async (req, res) => {
    try {
      const { id } = req.params;
      const event = await eventsModel.getEventById(id);
      if (!event) {
        return res.status(404).json({ success: false, error: "Event not found" });
      }
      res.status(200).json({ success: true, event });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = eventsController;