-- Create pantry_items table for Smart Pantry app
CREATE TABLE IF NOT EXISTS pantry_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  photo_url VARCHAR(500),
  status ENUM('in_stock', 'low', 'out') DEFAULT 'in_stock',
  notes TEXT,
  product_link VARCHAR(500),
  category VARCHAR(100),
  is_preset BOOLEAN DEFAULT FALSE,
  created_by ENUM('wife', 'husband') DEFAULT 'wife',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_status (user_id, status),
  INDEX idx_category (category),
  INDEX idx_is_preset (is_preset)
);

-- Create preset_items table for quick-add items
CREATE TABLE IF NOT EXISTS preset_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user (user_id)
);

