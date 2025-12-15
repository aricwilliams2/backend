const db = require("../config/database");

class PantryItem {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.name = data.name;
    this.photo_url = data.photo_url;
    this.status = data.status || 'in_stock';
    this.notes = data.notes;
    this.product_link = data.product_link;
    this.category = data.category;
    this.is_preset = data.is_preset || false;
    this.created_by = data.created_by || 'wife';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async findAll(filters = {}, userId) {
    let sql = "SELECT * FROM pantry_items WHERE user_id = ?";
    const params = [userId];

    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.category) {
      sql += " AND category = ?";
      params.push(filters.category);
    }

    if (filters.is_preset !== undefined) {
      sql += " AND is_preset = ?";
      params.push(filters.is_preset ? 1 : 0);
    }

    sql += " ORDER BY created_at DESC";

    if (filters.limit) {
      const limit = parseInt(filters.limit, 10);
      if (limit > 0 && limit <= 1000) {
        sql += ` LIMIT ${limit}`;
      }
    }

    const results = await db.query(sql, params);
    return {
      data: results.map((row) => new PantryItem(row)),
    };
  }

  static async findById(id, userId) {
    const sql = "SELECT * FROM pantry_items WHERE id = ? AND user_id = ?";
    const results = await db.query(sql, [id, userId]);
    return results.length ? new PantryItem(results[0]) : null;
  }

  static async findByCategory(category, userId) {
    const sql = "SELECT * FROM pantry_items WHERE category = ? AND user_id = ? ORDER BY created_at DESC";
    const results = await db.query(sql, [category, userId]);
    return results.map((row) => new PantryItem(row));
  }

  async save() {
    const now = new Date();

    if (this.id) {
      // Update existing item
      const sql = `
        UPDATE pantry_items SET
          name = ?, photo_url = ?, status = ?, notes = ?,
          product_link = ?, category = ?, is_preset = ?, updated_at = ?
        WHERE id = ? AND user_id = ?
      `;
      const params = [
        this.name,
        this.photo_url || null,
        this.status,
        this.notes || null,
        this.product_link || null,
        this.category || null,
        this.is_preset ? 1 : 0,
        now.toISOString().slice(0, 19).replace("T", " "),
        this.id,
        this.user_id,
      ];

      await db.query(sql, params);
      return this;
    }

    // Create new item
    this.created_at = now;
    this.updated_at = now;

    const sql = `
      INSERT INTO pantry_items (
        user_id, name, photo_url, status, notes, product_link,
        category, is_preset, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      this.user_id,
      this.name,
      this.photo_url || null,
      this.status,
      this.notes || null,
      this.product_link || null,
      this.category || null,
      this.is_preset ? 1 : 0,
      this.created_by,
      now.toISOString().slice(0, 19).replace("T", " "),
      now.toISOString().slice(0, 19).replace("T", " "),
    ];

    const result = await db.query(sql, params);
    this.id = result.insertId;

    return this;
  }

  async delete() {
    const sql = "DELETE FROM pantry_items WHERE id = ? AND user_id = ?";
    await db.query(sql, [this.id, this.user_id]);
    return true;
  }

  static async create(data) {
    const item = new PantryItem(data);
    return await item.save();
  }

  async update(data) {
    for (const key of Object.keys(data)) {
      if (this.hasOwnProperty(key) && key !== "id" && key !== "created_at" && key !== "user_id") {
        this[key] = data[key];
      }
    }
    return await this.save();
  }
}

module.exports = PantryItem;

