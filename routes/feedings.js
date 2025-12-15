const express = require("express");
const router = express.Router();
const Feeding = require("../models/Feeding");

// Middleware to get user_id (in production, use JWT/auth)
// For now, using a default user_id or from query param
const getUserId = (req) => {
  return req.query.user_id || req.body.user_id || 1; // Default to user_id 1 for demo
};

// Get all feedings
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    const filters = {
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      limit: req.query.limit,
    };
    const result = await Feeding.findAll(filters, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get next side to feed
router.get("/next-side", async (req, res) => {
  try {
    const userId = getUserId(req);
    const nextSide = await Feeding.getNextSide(userId);
    res.json({ nextSide });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get last feeding
router.get("/last", async (req, res) => {
  try {
    const userId = getUserId(req);
    const lastFeeding = await Feeding.getLastFeeding(userId);
    res.json({ feeding: lastFeeding });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single feeding by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const feeding = await Feeding.findById(req.params.id, userId);
    if (!feeding) {
      return res.status(404).json({ error: "Feeding not found" });
    }
    res.json(feeding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new feeding
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = {
      ...req.body,
      user_id: userId,
      start_time: req.body.start_time || new Date(),
    };
    const feeding = await Feeding.create(data);
    res.status(201).json(feeding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a feeding
router.put("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const feeding = await Feeding.findById(req.params.id, userId);
    if (!feeding) {
      return res.status(404).json({ error: "Feeding not found" });
    }
    await feeding.update(req.body);
    res.json(feeding);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a feeding
router.delete("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const feeding = await Feeding.findById(req.params.id, userId);
    if (!feeding) {
      return res.status(404).json({ error: "Feeding not found" });
    }
    await feeding.delete();
    res.json({ message: "Feeding deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

