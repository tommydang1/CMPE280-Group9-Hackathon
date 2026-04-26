const eventsModel = require("../models/eventsModel");
const crypto = require("crypto");
const eventsController = {
  // Create event
  createEvent: async (req, res) => {
    try {
      const { title, description, start_time, end_time } = req.body;

      if (!title || !start_time || !end_time) {
        return res.status(400).json({
          success: false,
          error: "Title, start_time, and end_time are required",
        });
      }

      if (new Date(start_time) > new Date(end_time)) {
        return res.status(400).json({
          success: false,
          error: "start_time cannot be after end_time",
        });
      }

      const adminToken = crypto.randomBytes(16).toString("hex");
      console.log("adminToken:", adminToken);

      const event = await eventsModel.createEvent(
        title,
        description,
        start_time,
        end_time,
        adminToken, // ← add 5th param
      );

      res.status(201).json({
        success: true,
        event: {
          ...event,
          admin_token: adminToken, // ← use generated token directly
        },
      });
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
        return res
          .status(404)
          .json({ success: false, error: "Event not found" });
      }
      res.status(200).json({ success: true, event });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // verify admin token
  verifyAdmin: async (req, res, next) => {
    try {
      const event = await eventsModel.getEventWithToken(req.params.id);

      if (!event) {
        return res
          .status(404)
          .json({ success: false, error: "Event not found" });
      }

      const token = req.headers["x-admin-token"];
      if (!token || token !== event.admin_token) {
        return res
          .status(403)
          .json({ success: false, error: "Not authorized" });
      }

      req.event = event;
      next();
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // edit event name and time range
  editEvent: async (req, res) => {
    try {
      const { title, start_time, end_time } = req.body;

      if (start_time && end_time && new Date(start_time) > new Date(end_time)) {
        return res.status(400).json({
          success: false,
          error: "start_time cannot be after end_time",
        });
      }

      const event = await eventsModel.editEvent(req.params.id, {
        title,
        start_time,
        end_time,
      });

      res.status(200).json({ success: true, event });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};

module.exports = eventsController;
