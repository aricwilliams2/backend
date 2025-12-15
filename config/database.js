const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USERNAME || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "breastfeeding_tracker",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 10000, // 10 seconds timeout
});

// Test database connection on startup
pool.getConnection()
  .then((connection) => {
    console.log("✓ Database connected successfully");
    connection.release();
  })
  .catch((error) => {
    console.error("✗ Database connection failed:", error.message);
    console.error("Please check your .env file and ensure MySQL is running.");
    console.error("Expected variables: DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE");
  });

const db = {
  query: async (sql, params) => {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error("Database query error:", error.message);
      console.error("SQL:", sql);
      throw error;
    }
  },
};

module.exports = db;

