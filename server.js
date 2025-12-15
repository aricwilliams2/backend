const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
// Backend always runs on port 5000
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/feedings", require("./routes/feedings"));
app.use("/api/tasks", require("./routes/tasks"));
app.use("/api/pantry", require("./routes/pantry"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Breastfeeding Tracker API is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

