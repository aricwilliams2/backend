-- Create database
CREATE DATABASE IF NOT EXISTS breastfeeding_tracker;
USE breastfeeding_tracker;

-- Create users table (simple version, can be extended with auth)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create feedings table
CREATE TABLE IF NOT EXISTS feedings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  side ENUM('left', 'right') NOT NULL,
  duration INT DEFAULT 0 COMMENT 'Duration in minutes',
  start_time DATETIME,
  end_time DATETIME,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_created (user_id, created_at)
);

-- Insert a default user for testing
INSERT INTO users (id, name, email) VALUES (1, 'Default User', 'user@example.com') ON DUPLICATE KEY UPDATE id=id;

