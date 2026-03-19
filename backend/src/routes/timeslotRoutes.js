const express = require("express");
const router = express.Router();
const timeslotController = require("../controllers/timeslotController");

/**
 * @api {post} /api/timeslots Add a timeslot for a participant
 * @apiBody {number} participant_id Participant ID
 * @apiBody {number} event_id Event ID
 * @apiBody {string} start_time TIMESTAMPTZ (30-min interval)
 * @apiSuccess {Object} slot Created timeslot
 */
router.post("/", timeslotController.addTimeslot);

/**
 * @api {get} /api/timeslots/event/:event_id Get all timeslots for an event
 * @apiParam {Number} event_id Event ID
 * @apiSuccess {Object[]} slots List of timeslots with participant usernames
 */
router.get("/event/:event_id", timeslotController.getTimeslotsByEvent);

module.exports = router;