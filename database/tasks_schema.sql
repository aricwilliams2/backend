-- Create tasks table for Task Prep app
CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_name VARCHAR(255),
  event_date DATE,
  status ENUM('pending', 'in_progress', 'completed', 'reviewed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  assigned_to ENUM('wife', 'husband', 'both') DEFAULT 'wife',
  created_by ENUM('wife', 'husband') DEFAULT 'wife',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  reviewed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_event_date (event_date),
  INDEX idx_created_at (created_at)
);

