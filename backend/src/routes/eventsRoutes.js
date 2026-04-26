const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");

// Create a new event

/**
 * @api {post} /api/events Create a new event
 * @apiBody {string} title Event title
 * @apiBody {string} description Event description
 * @apiBody {string} start_time TIMESTAMPTZ start time
 * @apiBody {string} end_time TIMESTAMPTZ end time
 * @apiSuccess {Object} event Created event
 */
router.post("/", eventsController.createEvent);

// Get all events

/**
 * @api {get} /api/events Get all events
 * @apiSuccess {Object[]} events List of events
 */
router.get("/", eventsController.getAllEvents);

// Get single event by ID

/**
 * @api {get} /api/events/:id Get event by ID
 * @apiParam {Number} id Event ID
 * @apiSuccess {Object} event Event object
 */
router.get("/:id", eventsController.getEventById);

// Edit event (admin only)
/**
 * @api {patch} /api/events/:id/edit Edit event name and time range
 * @apiHeader {String} x-admin-token Admin token
 * @apiParam {Number} id Event ID
 * @apiBody {String} [title] New event title
 * @apiBody {String} [start_time] New start time
 * @apiBody {String} [end_time] New end time
 * @apiSuccess {Object} event Updated event object
 */
router.patch(
  "/:id/edit",
  eventsController.verifyAdmin,
  eventsController.editEvent,
);

router.post(
  "/",
  (req, res, next) => {
    console.log("POST /api/events hit"); // ← add this
    next();
  },
  eventsController.createEvent,
);

module.exports = router;
