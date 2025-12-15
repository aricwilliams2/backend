const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
// Backend always runs on port 5000
const PORT = 5000;

// Middleware
// CORS configuration - allow requests from production domain and localhost for development
app.use(cors({
  origin: [
    'https://aricwilliamst.com',
    'http://localhost:3001',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
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

