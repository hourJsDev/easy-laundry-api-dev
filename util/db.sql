-- -----------------------------------------------------
-- 0. Create and Use the Database
-- -----------------------------------------------------
CREATE DATABASE IF NOT EXISTS laundry_database;
USE laundry_database;

-- -----------------------------------------------------
-- 1. Users & Authentication
-- -----------------------------------------------------
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,         -- For email login
    phone VARCHAR(20) UNIQUE,          -- For phone login
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('customer','staff','admin') NOT NULL DEFAULT 'customer',
    status ENUM('active','inactive','banned') NOT NULL DEFAULT 'active',
    preferred_language ENUM('en','kh') NOT NULL DEFAULT 'en', 
      -- For multilingual (English, Khmer)
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 1.2. Oauth / Social Login (Optional)
-- If you want to store Google/Facebook IDs directly:
CREATE TABLE user_oauth (
    oauth_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    provider ENUM('google','facebook','other') NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL, 
      -- e.g., Google sub, Facebook ID
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- 1.3. Addresses (Optional; users can have multiple addresses)
CREATE TABLE addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    address_line_1 VARCHAR(255) NOT NULL,
    address_line_2 VARCHAR(255) DEFAULT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) DEFAULT NULL,
    latitude DECIMAL(10, 7) DEFAULT NULL,   -- For GPS integration
    longitude DECIMAL(10, 7) DEFAULT NULL,
    is_default TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 2. Staff & Roles
-- -----------------------------------------------------
CREATE TABLE staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL, 
      -- user record with role='staff' or 'admin'
    position VARCHAR(50) NOT NULL DEFAULT 'staff', 
    shift_schedule TEXT,
    hire_date DATE DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 3. Services & Categories
-- -----------------------------------------------------
CREATE TABLE services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    service_name VARCHAR(100) NOT NULL,
      -- e.g. "Wash", "Wash & Iron", "Shoes", "Dry Cleaning", etc.
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    pricing_unit ENUM('per_item','per_kg','other') NOT NULL DEFAULT 'per_item',
    tax_rate DECIMAL(5,2) DEFAULT NULL,  
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE items (
	item_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    image LONGBLOB ,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP
)  ENGINE=InnoDB;

CREATE TABLE item_to_service (
	service_to_item_id  INT AUTO_INCREMENT PRIMARY KEY,
    item_id INT ,
    service_id INT ,
	base_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ON UPDATE CURRENT_TIMESTAMP,
     FOREIGN KEY (item_id) REFERENCES items(item_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(service_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 4. Orders & Location Tracking
-- -----------------------------------------------------
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INT NOT NULL,        -- the customer placing the order
    status ENUM('received','in_progress','ready','completed','canceled') 
        NOT NULL DEFAULT 'received',
    payment_status ENUM('paid','pending','refunded','unpaid') 
        NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_method ENUM('aba_pay','acelada','e_wallet','card','cash_on_delivery','other') 
        NOT NULL DEFAULT 'cash_on_delivery',
    pickup_delivery_type ENUM('in_store','pickup','delivery') 
        NOT NULL DEFAULT 'in_store',
    assigned_staff_id INT DEFAULT NULL,  -- references staff(staff_id)
    promo_code_used VARCHAR(50) DEFAULT NULL,  -- references promotions(promotion_code)
    pickup_lat DECIMAL(10,7) DEFAULT NULL,  -- For map integration
    pickup_lng DECIMAL(10,7) DEFAULT NULL,
    delivery_lat DECIMAL(10,7) DEFAULT NULL,
    delivery_lng DECIMAL(10,7) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Detailed items within each order
CREATE TABLE order_details (
    order_details_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    service_id INT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1.00, 
      -- can be # of items or kg
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    final_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    special_instructions TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services(service_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Now we link orders -> staff (assigned_staff_id)
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_staff
  FOREIGN KEY (assigned_staff_id) REFERENCES staff(staff_id)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

-- -----------------------------------------------------
-- 5. Payments & Transactions (Optional)
-- -----------------------------------------------------
CREATE TABLE payment_methods (
    payment_method_id INT AUTO_INCREMENT PRIMARY KEY,
    method_name VARCHAR(100) NOT NULL,
    details TEXT
) ENGINE=InnoDB;

CREATE TABLE transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    transaction_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    transaction_type ENUM('payment','refund','other') NOT NULL DEFAULT 'payment',
    payment_method_id INT DEFAULT NULL,
    transaction_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- -----------------------------------------------------
-- 6. Promotions & Loyalty (Optional)
-- -----------------------------------------------------
CREATE TABLE promotions (
    promotion_id INT AUTO_INCREMENT PRIMARY KEY,
    promotion_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type ENUM('percentage','fixed') NOT NULL DEFAULT 'percentage',
    discount_value DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit INT NOT NULL DEFAULT 0,
    times_used INT NOT NULL DEFAULT 0,
    is_active TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB;

ALTER TABLE orders
  ADD CONSTRAINT fk_orders_promotions
  FOREIGN KEY (promo_code_used) REFERENCES promotions(promotion_code)
  ON DELETE SET NULL
  ON UPDATE CASCADE;

CREATE TABLE customer_loyalty (
    loyalty_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    points_earned INT NOT NULL DEFAULT 0,
    points_redeemed INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 7. Notifications
-- -----------------------------------------------------
CREATE TABLE notifications (
    notification_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_type ENUM('order_update','promo_alert','delivery_update','other') 
        NOT NULL DEFAULT 'other',
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 8. Feedback & Ratings
-- -----------------------------------------------------
CREATE TABLE feedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    order_id INT NOT NULL,
    yes_no_rating ENUM('yes','no') DEFAULT NULL,  -- Simple yes/no
    detailed_feedback TEXT,         -- e.g. "time, trust, quality, overall experience"
    rating_time INT DEFAULT NULL,   -- If you want to store numeric values (1-5) for time
    rating_trust INT DEFAULT NULL,  -- numeric rating for trust
    rating_quality INT DEFAULT NULL,-- numeric rating for quality
    rating_overall INT DEFAULT NULL,-- numeric rating for overall
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 9. Support System (Optional)
-- -----------------------------------------------------
CREATE TABLE support_tickets (
    ticket_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,          -- The customer or staff who initiated
    subject VARCHAR(255) NOT NULL, -- e.g. "Issue with order", "Payment question"
    description TEXT NOT NULL,
    status ENUM('open','in_progress','resolved','closed') 
        NOT NULL DEFAULT 'open',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;


-- Potentially store chat messages or call logs in a separate table
CREATE TABLE support_messages (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id INT NOT NULL,
    sender_id INT NOT NULL,  -- user or staff
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 10. Inventory & Machines (Optional if you need advanced operations)
-- -----------------------------------------------------
CREATE TABLE inventory (
    inventory_id INT AUTO_INCREMENT PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    item_description TEXT,
    stock_quantity INT NOT NULL DEFAULT 0,
    reorder_level INT NOT NULL DEFAULT 0,
    reorder_quantity INT NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE inventory_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    inventory_id INT NOT NULL,
    change_type ENUM('purchase','used_in_service','return','other') NOT NULL DEFAULT 'other',
    quantity_changed INT NOT NULL DEFAULT 0,
    staff_id INT DEFAULT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    remarks TEXT,
    FOREIGN KEY (inventory_id) REFERENCES inventory(inventory_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE machines (
    machine_id INT AUTO_INCREMENT PRIMARY KEY,
    machine_name VARCHAR(100) NOT NULL,
    machine_type ENUM('washer','dryer','pressing_machine','other') NOT NULL DEFAULT 'washer',
    status ENUM('operational','maintenance','offline') NOT NULL DEFAULT 'operational',
    last_maintenance_date DATE DEFAULT NULL,
    next_maintenance_due DATE DEFAULT NULL,
    location VARCHAR(100) DEFAULT NULL,
    remarks TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE maintenance_logs (
    maintenance_id INT AUTO_INCREMENT PRIMARY KEY,
    machine_id INT NOT NULL,
    staff_id INT DEFAULT NULL,
    maintenance_date DATE NOT NULL,
    maintenance_details TEXT,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP 
      ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (machine_id) REFERENCES machines(machine_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -----------------------------------------------------
-- 11. Audit Logs (Optional)
-- -----------------------------------------------------
CREATE TABLE audit_logs (
    audit_log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    action VARCHAR(50) NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    record_id INT NOT NULL,
    previous_data TEXT,
    new_data TEXT,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE=InnoDB;



-- End of the integrated schema
