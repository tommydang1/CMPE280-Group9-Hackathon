const express = require("express");
const router = express.Router();
const participantsController = require("../controllers/participantsController");

// Create a new participant (optional access_token)

/**
 * @api {post} /api/participants Create a new participant
 * @apiBody {string} username Participant username
 * @apiBody {number} event_id Event ID
 * @apiBody {string} [access_token] Optional token
 * @apiSuccess {Object} participant Created participant
 */
router.post("/", participantsController.createParticipant);

// Verify participant login (check if password required)

/**
 * @api {post} /api/participants/verify Verify participant credentials
 * @apiBody {string} username Participant username
 * @apiBody {number} event_id Event ID
 * @apiBody {string} [password] Optional password
 * @apiSuccess {Object} participant Verified participant or password_required flag
 */
router.post("/verify", participantsController.verifyParticipant);

// Get all participants for an event

/**
 * @api {get} /api/participants/event/:event_id Get participants for an event
 * @apiParam {Number} event_id Event ID
 * @apiSuccess {Object[]} participants List of participants
 */
router.get("/event/:event_id", participantsController.getParticipantsByEvent);
router.put("/:id", participantsController.updateParticipant);
module.exports = router;
