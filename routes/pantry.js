const express = require("express");
const router = express.Router();
const PantryItem = require("../models/PantryItem");
const PresetItem = require("../models/PresetItem");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Middleware to get user_id (in production, use JWT/auth)
const getUserId = (req) => {
  return req.query.user_id || req.body.user_id || 1; // Default to user_id 1 for demo
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../frontend/public/uploads/pantry");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `pantry-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Get all pantry items
router.get("/", async (req, res) => {
  try {
    const userId = getUserId(req);
    const filters = {
      status: req.query.status,
      category: req.query.category,
      is_preset: req.query.is_preset,
      limit: req.query.limit,
    };
    const result = await PantryItem.findAll(filters, userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single pantry item by ID
router.get("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const item = await PantryItem.findById(req.params.id, userId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new pantry item (with optional photo upload)
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = {
      ...req.body,
      user_id: userId,
    };

    // Handle uploaded photo
    if (req.file) {
      data.photo_url = `/uploads/pantry/${req.file.filename}`;
    }

    const item = await PantryItem.create(data);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a pantry item
router.put("/:id", upload.single("photo"), async (req, res) => {
  try {
    const userId = getUserId(req);
    const item = await PantryItem.findById(req.params.id, userId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Handle uploaded photo
    if (req.file) {
      // Delete old photo if exists
      if (item.photo_url) {
        const oldPhotoPath = path.join(__dirname, "../../frontend/public", item.photo_url);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      req.body.photo_url = `/uploads/pantry/${req.file.filename}`;
    }

    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a pantry item
router.delete("/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const item = await PantryItem.findById(req.params.id, userId);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Delete photo if exists
    if (item.photo_url) {
      const photoPath = path.join(__dirname, "../../frontend/public", item.photo_url);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }

    await item.delete();
    res.json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PRESET ITEMS ROUTES

// Get all preset items
router.get("/presets/all", async (req, res) => {
  try {
    const userId = getUserId(req);
    const result = await PresetItem.findAll(userId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a preset item
router.post("/presets", async (req, res) => {
  try {
    const userId = getUserId(req);
    const data = {
      ...req.body,
      user_id: userId,
    };
    const preset = await PresetItem.create(data);
    res.status(201).json(preset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add preset item to pantry (quick add)
router.post("/presets/:id/add", async (req, res) => {
  try {
    const userId = getUserId(req);
    const preset = await PresetItem.findById(req.params.id, userId);
    if (!preset) {
      return res.status(404).json({ error: "Preset item not found" });
    }

    // Create pantry item from preset
    const pantryItem = await PantryItem.create({
      user_id: userId,
      name: preset.name,
      category: preset.category,
      status: "in_stock",
      is_preset: true,
      created_by: req.body.created_by || "wife",
    });

    res.status(201).json(pantryItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a preset item
router.delete("/presets/:id", async (req, res) => {
  try {
    const userId = getUserId(req);
    const preset = await PresetItem.findById(req.params.id, userId);
    if (!preset) {
      return res.status(404).json({ error: "Preset item not found" });
    }
    await preset.delete();
    res.json({ message: "Preset item deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

