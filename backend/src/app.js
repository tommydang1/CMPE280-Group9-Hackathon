const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config();
const app = express();

// cors MUST be before helmet
app.use(
  cors({
    origin: (origin, callback) => {
      const allowed = [
        "http://localhost:5173",
        "https://cmpe-280-group9-hackathon-hegm.vercel.app",
      ];
      // Allow all vercel preview URLs
      if (
        !origin ||
        allowed.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

const participantsRoutes = require("./routes/participantsRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const timeslotRoutes = require("./routes/timeslotRoutes");

app.use("/api/participants", participantsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/timeslots", timeslotRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

module.exports = app;
