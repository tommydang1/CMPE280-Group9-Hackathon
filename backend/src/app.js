const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

// Load environment variables
dotenv.config();
const app = express();
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Import routes
const participantsRoutes = require("./routes/participantsRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const timeslotRoutes = require("./routes/timeslotRoutes");

// Use routes
app.use("/api/participants", participantsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/timeslots", timeslotRoutes);

// Root endpoint
app.get("/", (req,res)=>{
    res.send("API running");
});

module.exports = app;