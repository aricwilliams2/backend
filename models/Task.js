const db = require("../config/database");

class Task {
  constructor(data = {}) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.description = data.description;
    this.event_name = data.event_name;
    this.event_date = data.event_date;
    this.status = data.status || 'pending';
    this.priority = data.priority || 'medium';
    this.assigned_to = data.assigned_to || 'wife';
    this.created_by = data.created_by || 'wife';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.completed_at = data.completed_at;
    this.reviewed_at = data.reviewed_at;
  }

  static async findAll(filters = {}, userId) {
    let sql = "SELECT * FROM tasks WHERE user_id = ?";
    const params = [userId];

    if (filters.status) {
      sql += " AND status = ?";
      params.push(filters.status);
    }

    if (filters.event_name) {
      sql += " AND event_name = ?";
      params.push(filters.event_name);
    }

    if (filters.assigned_to) {
      sql += " AND assigned_to = ?";
      params.push(filters.assigned_to);
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
      data: results.map((row) => new Task(row)),
    };
  }

  static async findById(id, userId) {
    const sql = "SELECT * FROM tasks WHERE id = ? AND user_id = ?";
    const results = await db.query(sql, [id, userId]);
    return results.length ? new Task(results[0]) : null;
  }

  static async findByEvent(eventName, userId) {
    const sql = "SELECT * FROM tasks WHERE event_name = ? AND user_id = ? ORDER BY created_at DESC";
    const results = await db.query(sql, [eventName, userId]);
    return results.map((row) => new Task(row));
  }

  sanitize(value) {
    return value === undefined ? null : value;
  }

  async save() {
    const now = new Date();

    if (this.id) {
      // Update existing task
      const sql = `
        UPDATE tasks SET
          title = ?, description = ?, event_name = ?, event_date = ?,
          status = ?, priority = ?, assigned_to = ?, updated_at = ?,
          completed_at = ?, reviewed_at = ?
        WHERE id = ? AND user_id = ?
      `;
      const params = [
        this.title,
        this.description,
        this.event_name,
        this.event_date ? new Date(this.event_date).toISOString().slice(0, 10) : null,
        this.status,
        this.priority,
        this.assigned_to,
        now.toISOString().slice(0, 19).replace("T", " "),
        this.completed_at ? new Date(this.completed_at).toISOString().slice(0, 19).replace("T", " ") : null,
        this.reviewed_at ? new Date(this.reviewed_at).toISOString().slice(0, 19).replace("T", " ") : null,
        this.id,
        this.user_id,
      ];

      await db.query(sql, params);
      return this;
    }

    // Create new task
    this.created_at = now;
    this.updated_at = now;

    const sql = `
      INSERT INTO tasks (
        user_id, title, description, event_name, event_date,
        status, priority, assigned_to, created_by, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      this.user_id,
      this.title,
      this.description || null,
      this.event_name || null,
      this.event_date ? new Date(this.event_date).toISOString().slice(0, 10) : null,
      this.status,
      this.priority,
      this.assigned_to,
      this.created_by,
      now.toISOString().slice(0, 19).replace("T", " "),
      now.toISOString().slice(0, 19).replace("T", " "),
    ];

    const result = await db.query(sql, params);
    this.id = result.insertId;

    return this;
  }

  async delete() {
    const sql = "DELETE FROM tasks WHERE id = ? AND user_id = ?";
    await db.query(sql, [this.id, this.user_id]);
    return true;
  }

  static async create(data) {
    const task = new Task(data);
    return await task.save();
  }

  async update(data) {
    for (const key of Object.keys(data)) {
      if (this.hasOwnProperty(key) && key !== "id" && key !== "created_at" && key !== "user_id") {
        this[key] = data[key];
      }
    }
    
    // Handle status changes
    if (data.status === 'completed' && !this.completed_at) {
      this.completed_at = new Date();
    }
    if (data.status === 'reviewed' && !this.reviewed_at) {
      this.reviewed_at = new Date();
    }
    
    return await this.save();
  }

  async markReviewed() {
    this.status = 'reviewed';
    this.reviewed_at = new Date();
    return await this.save();
  }

  async markCompleted() {
    this.status = 'completed';
    this.completed_at = new Date();
    return await this.save();
  }
}

module.exports = Task;

