const db = require("../config/database");

class Feeding {
  constructor(data = {}) {
    this.id = data.id; // auto-incremented in DB
    this.side = data.side; // 'left' or 'right'
    this.duration = data.duration || 0; // duration in minutes
    this.start_time = data.start_time;
    this.end_time = data.end_time;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.user_id = data.user_id;
  }

  static async findAll(filters = {}, userId) {
    let sql = "SELECT * FROM feedings WHERE user_id = ?";
    const params = [userId];

    if (filters.start_date) {
      sql += " AND DATE(created_at) >= ?";
      params.push(filters.start_date);
    }

    if (filters.end_date) {
      sql += " AND DATE(created_at) <= ?";
      params.push(filters.end_date);
    }

    sql += " ORDER BY created_at DESC";

    if (filters.limit) {
      // MySQL doesn't support placeholders for LIMIT, so we safely interpolate the integer
      const limit = parseInt(filters.limit, 10);
      if (limit > 0 && limit <= 1000) { // Sanity check to prevent abuse
        sql += ` LIMIT ${limit}`;
      }
    }

    const results = await db.query(sql, params);
    return {
      data: results.map((row) => new Feeding(row)),
    };
  }

  static async findById(id, userId) {
    const sql = "SELECT * FROM feedings WHERE id = ? AND user_id = ?";
    const results = await db.query(sql, [id, userId]);
    return results.length ? new Feeding(results[0]) : null;
  }

  static async getLastFeeding(userId) {
    const sql = "SELECT * FROM feedings WHERE user_id = ? ORDER BY created_at DESC LIMIT 1";
    const results = await db.query(sql, [userId]);
    return results.length ? new Feeding(results[0]) : null;
  }

  static async getNextSide(userId) {
    const lastFeeding = await this.getLastFeeding(userId);
    if (!lastFeeding) {
      return "left"; // Default to left if no previous feedings
    }
    // Alternate sides
    return lastFeeding.side === "left" ? "right" : "left";
  }

  sanitize(value) {
    return value === undefined ? null : value;
  }

  async save() {
    const now = new Date();

    if (this.id) {
      const existing = await db.query("SELECT id FROM feedings WHERE id = ?", [this.id]);
      if (existing.length > 0) {
        this.updated_at = now;
        const sql = `
          UPDATE feedings SET
            side = ?, duration = ?, start_time = ?, end_time = ?,
            notes = ?, updated_at = ?
          WHERE id = ? AND user_id = ?
        `;
        const params = [
          this.side,
          this.duration,
          this.start_time ? new Date(this.start_time).toISOString().slice(0, 19).replace("T", " ") : null,
          this.end_time ? new Date(this.end_time).toISOString().slice(0, 19).replace("T", " ") : null,
          this.notes,
          this.updated_at ? new Date(this.updated_at).toISOString().slice(0, 19).replace("T", " ") : null,
          this.id,
          this.user_id,
        ];

        await db.query(sql, params);
        return this;
      }
    }

    this.created_at = now;
    this.updated_at = now;

    const sql = `
      INSERT INTO feedings (
        side, duration, start_time, end_time, notes, created_at, updated_at, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      this.side,
      this.duration || 0,
      this.start_time ? new Date(this.start_time).toISOString().slice(0, 19).replace("T", " ") : null,
      this.end_time ? new Date(this.end_time).toISOString().slice(0, 19).replace("T", " ") : null,
      this.notes || null,
      this.created_at ? new Date(this.created_at).toISOString().slice(0, 19).replace("T", " ") : null,
      this.updated_at ? new Date(this.updated_at).toISOString().slice(0, 19).replace("T", " ") : null,
      this.user_id,
    ];

    const result = await db.query(sql, params);
    this.id = result.insertId;

    return this;
  }

  async delete() {
    const sql = "DELETE FROM feedings WHERE id = ? AND user_id = ?";
    await db.query(sql, [this.id, this.user_id]);
    return true;
  }

  static async create(data) {
    const feeding = new Feeding(data);
    return await feeding.save();
  }

  async update(data) {
    for (const key of Object.keys(data)) {
      if (this.hasOwnProperty(key) && key !== "id" && key !== "created_at") {
        this[key] = data[key];
      }
    }
    return await this.save();
  }
}

module.exports = Feeding;

