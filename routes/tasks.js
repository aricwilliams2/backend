const express = require("express");
const router = express.Router();
const Task = require("../models/Task");

// Middleware to get user_id (in production, use JWT/auth)
const getUserId = (req) => {
  return req.query.user_id || req.body.user_id || 1; // Default to user_id 1 for demo
};

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    const filters = {
      status: req.query.status,
      event_name: req.query.event_name,
      assigned_to: req.query.assigned_to,
      limit: req.query.limit,
    };
    const result = await Task.findAll(filters, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks by event
router.get("/event/:eventName", async (req, res) => {
  try {
    const userId = getUserId(req);
    const tasks = await Task.findByEvent(req.params.eventName, userId);
    res.json({ data: tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single task by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const task = await Task.findById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new task
router.post("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = {
      ...req.body,
      user_id: userId,
    };
    const task = await Task.create(data);
    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a task
router.put("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const task = await Task.findById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.update(req.body);
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark task as reviewed (husband reviews)
router.post("/:id/review", async (req, res) => {
  try {
    const userId = getUserId(req);
    const task = await Task.findById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.markReviewed();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark task as completed
router.post("/:id/complete", async (req, res) => {
  try {
    const userId = getUserId(req);
    const task = await Task.findById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.markCompleted();
    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const task = await Task.findById(req.params.id, userId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    await task.delete();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

