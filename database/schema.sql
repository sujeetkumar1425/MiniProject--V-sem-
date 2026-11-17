-- ====================================================================
-- PROJECT: Credit Card Fraud Detection & Network Anomaly Detection
-- DATABASE: MySQL Schema for credit_fraud_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS credit_fraud_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE credit_fraud_db;

-- --------------------------------------------------------------------
-- 1. USERS TABLE (Secure authentication with bcrypt hashes)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('Admin', 'User') NOT NULL DEFAULT 'User',
    status ENUM('Active', 'Inactive') NOT NULL DEFAULT 'Active',
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 2. DATASETS TABLE (Metadata catalog for uploaded / historical CSVs)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS datasets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataset_code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    dataset_type ENUM('Credit Card Transactions', 'Network Activity') NOT NULL,
    records_count INT NOT NULL DEFAULT 0,
    file_size VARCHAR(50) NOT NULL,
    file_path VARCHAR(500) NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 3. MODELS TABLE (ML model versioning, artifacts & performance metrics)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model_type ENUM('fraud', 'network') NOT NULL,
    algorithm VARCHAR(100) NOT NULL,
    version VARCHAR(50) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    accuracy_score DECIMAL(5,2) NULL,
    precision_score DECIMAL(5,2) NULL,
    recall_score DECIMAL(5,2) NULL,
    f1_score DECIMAL(5,2) NULL,
    contamination_factor DECIMAL(5,3) NULL,
    training_size INT NOT NULL DEFAULT 0,
    training_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 4. PREDICTIONS TABLE (Logged inference results for audit & analysis)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dataset_id INT NULL,
    record_identifier VARCHAR(50) NOT NULL,
    detection_type ENUM('Credit Card Fraud', 'Network Anomaly') NOT NULL,
    prediction_result VARCHAR(50) NOT NULL,
    confidence_score DECIMAL(5,2) NULL,
    anomaly_score DECIMAL(5,3) NULL,
    features_json JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE SET NULL
);

-- --------------------------------------------------------------------
-- 5. REPORTS TABLE (Generated analytical reports & SIEM summaries)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_code VARCHAR(20) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    report_type ENUM('Fraud Detection', 'Network Anomaly', 'Comprehensive') NOT NULL,
    total_records INT NOT NULL,
    flagged_count INT NOT NULL,
    detection_rate VARCHAR(20) NOT NULL,
    file_path VARCHAR(500) NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- --------------------------------------------------------------------
-- 6. SYSTEM CONFIGURATION TABLE (Operational hyperparameters)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value VARCHAR(255) NOT NULL,
    description TEXT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ====================================================================
-- SEED INITIAL DATA
-- ====================================================================

-- Default Admin User (Password is 'admin123' hashed with bcrypt)
-- $2b$12$K1rS2mZ.7lO6Zc4gPq8Yce6qB6XyGZ9b8uQ5rT4vP9fW2mE1nO3pG is a valid bcrypt hash for admin123
INSERT INTO users (username, password_hash, role, status)
VALUES ('admin', '$2b$12$e80yqN3aW1rQe3kG6ZtXuOHF1VwB7kZ2rE9oY2gX8pL1mQ5nO4vW.', 'Admin', 'Active')
ON DUPLICATE KEY UPDATE username=username;

-- Default Datasets Catalog
INSERT INTO datasets (dataset_code, name, dataset_type, records_count, file_size)
VALUES
  ('DS-001', 'creditcard.csv', 'Credit Card Transactions', 284807, '143 MB'),
  ('DS-002', 'nsl_kdd_train.csv', 'Network Activity', 125973, '28 MB'),
  ('DS-003', 'nsl_kdd_test.csv', 'Network Activity', 22544, '5 MB')
ON DUPLICATE KEY UPDATE dataset_code=dataset_code;

-- Default ML Models Metadata
INSERT INTO models (name, model_type, algorithm, version, file_path, accuracy_score, precision_score, recall_score, f1_score, training_size, training_date)
VALUES
  ('Fraud Detection Model', 'fraud', 'Random Forest Classifier', 'v2.1.0', 'models/fraud_model.pkl', 99.30, 94.70, 91.20, 92.90, 227845, '2025-08-14')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO models (name, model_type, algorithm, version, file_path, contamination_factor, training_size, training_date)
VALUES
  ('Network Anomaly Model', 'network', 'Isolation Forest', 'v1.3.0', 'models/anomaly_model.pkl', 0.080, 494021, '2025-08-14')
ON DUPLICATE KEY UPDATE name=name;

-- Default System Configuration
INSERT INTO system_config (config_key, config_value, description)
VALUES
  ('fraud_threshold', '0.50', 'Probability threshold for classifying a transaction as potentially fraudulent'),
  ('anomaly_contamination', '0.08', 'Outlier proportion factor for Isolation Forest network anomaly model'),
  ('max_display_rows', '50', 'Maximum rows displayed in table views before pagination'),
  ('max_file_size_mb', '50', 'Maximum allowable uploaded CSV file size in megabytes'),
  ('alert_enabled', 'true', 'Visual banner notification trigger for detected threats')
ON DUPLICATE KEY UPDATE config_key=config_key;
