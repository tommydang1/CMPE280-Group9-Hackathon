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

module.exports = router;