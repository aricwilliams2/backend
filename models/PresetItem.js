const db = require("../config/database");

class PresetItem {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.name = data.name;
    this.category = data.category;
    this.icon = data.icon;
    this.created_at = data.created_at;
  }

  static async findAll(userId) {
    const sql = "SELECT * FROM preset_items WHERE user_id = ? ORDER BY name ASC";
    const results = await db.query(sql, [userId]);
    return {
      data: results.map((row) => new PresetItem(row)),
    };
  }

  static async findById(id, userId) {
    const sql = "SELECT * FROM preset_items WHERE id = ? AND user_id = ?";
    const results = await db.query(sql, [id, userId]);
    return results.length ? new PresetItem(results[0]) : null;
  }

  async save() {
    const now = new Date();

    if (this.id) {
      // Update existing preset
      const sql = `
        UPDATE preset_items SET
          name = ?, category = ?, icon = ?
        WHERE id = ? AND user_id = ?
      `;
      const params = [
        this.name,
        this.category || null,
        this.icon || null,
        this.id,
        this.user_id,
      ];

      await db.query(sql, params);
      return this;
    }

    // Create new preset
    this.created_at = now;

    const sql = `
      INSERT INTO preset_items (user_id, name, category, icon, created_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
      this.user_id,
      this.name,
      this.category || null,
      this.icon || null,
      now.toISOString().slice(0, 19).replace("T", " "),
    ];

    const result = await db.query(sql, params);
    this.id = result.insertId;

    return this;
  }

  async delete() {
    const sql = "DELETE FROM preset_items WHERE id = ? AND user_id = ?";
    await db.query(sql, [this.id, this.user_id]);
    return true;
  }

  static async create(data) {
    const item = new PresetItem(data);
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

module.exports = PresetItem;

