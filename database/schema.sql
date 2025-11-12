-- Coffee Training Center Management System Database Schema

CREATE DATABASE IF NOT EXISTS coffee_training_center;
USE coffee_training_center;

-- Users Table (Trainees, Trainers, Administrators)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('trainee', 'trainer', 'admin') DEFAULT 'trainee',
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Training Sessions Table
CREATE TABLE training_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trainer_id INT,
    session_date DATETIME NOT NULL,
    duration_minutes INT DEFAULT 60,
    max_capacity INT DEFAULT 20,
    current_enrollment INT DEFAULT 0,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_session_date (session_date),
    INDEX idx_status (status)
);

-- Session Enrollments Table
CREATE TABLE session_enrollments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trainee_id INT NOT NULL,
    session_id INT NOT NULL,
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'attended', 'absent', 'cancelled') DEFAULT 'registered',
    attendance_marked_at TIMESTAMP NULL,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (trainee_id, session_id),
    INDEX idx_trainee (trainee_id),
    INDEX idx_session (session_id)
);

-- Queue Management Table
CREATE TABLE queue_entries (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trainee_id INT NOT NULL,
    session_id INT NOT NULL,
    queue_position INT NOT NULL,
    status ENUM('waiting', 'processing', 'completed', 'cancelled') DEFAULT 'waiting',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_status (session_id, status),
    INDEX idx_queue_position (queue_position)
);

-- Examinations Table
CREATE TABLE examinations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_questions INT DEFAULT 0,
    passing_score DECIMAL(5,2) DEFAULT 70.00,
    duration_minutes INT DEFAULT 60,
    start_time DATETIME,
    end_time DATETIME,
    status ENUM('draft', 'scheduled', 'active', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_status (status)
);

-- Exam Questions Table
CREATE TABLE exam_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    exam_id INT NOT NULL,
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'short_answer') DEFAULT 'multiple_choice',
    options JSON,
    correct_answer TEXT NOT NULL,
    points DECIMAL(5,2) DEFAULT 1.00,
    question_order INT DEFAULT 0,
    FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE,
    INDEX idx_exam (exam_id)
);

-- Exam Attempts Table
CREATE TABLE exam_attempts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trainee_id INT NOT NULL,
    exam_id INT NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    score DECIMAL(5,2) DEFAULT 0.00,
    total_points DECIMAL(5,2) DEFAULT 0.00,
    percentage_score DECIMAL(5,2) DEFAULT 0.00,
    passed BOOLEAN DEFAULT FALSE,
    status ENUM('in_progress', 'submitted', 'graded') DEFAULT 'in_progress',
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES examinations(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attempt (trainee_id, exam_id),
    INDEX idx_trainee (trainee_id),
    INDEX idx_exam (exam_id)
);

-- Exam Answers Table
CREATE TABLE exam_answers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    answer_text TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    points_earned DECIMAL(5,2) DEFAULT 0.00,
    FOREIGN KEY (attempt_id) REFERENCES exam_attempts(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES exam_questions(id) ON DELETE CASCADE,
    INDEX idx_attempt (attempt_id)
);

-- Certificates Table
CREATE TABLE certificates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trainee_id INT NOT NULL,
    session_id INT NOT NULL,
    exam_attempt_id INT,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    qr_code_url VARCHAR(500),
    qr_code_data TEXT,
    pdf_url VARCHAR(500),
    status ENUM('issued', 'revoked', 'expired') DEFAULT 'issued',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_attempt_id) REFERENCES exam_attempts(id) ON DELETE SET NULL,
    INDEX idx_trainee (trainee_id),
    INDEX idx_certificate_number (certificate_number),
    INDEX idx_status (status)
);

-- Notifications Table
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('email', 'sms', 'push') NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_status (status)
);

-- System Settings Table
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: admin123 - should be changed)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@coffeetraining.com', '$2a$10$kGkdTrJptCqWF7erNkGnceAnaAqhpp3knD9R5KBs4YYo8O1Ew3kI6', 'Admin', 'User', 'admin');

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('smtp_host', 'smtp.gmail.com', 'SMTP server hostname'),
('smtp_port', '587', 'SMTP server port'),
('twilio_account_sid', '', 'Twilio Account SID'),
('qr_service_url', 'http://localhost:5000', 'QR Code Generator Service URL'),
('certificate_validity_days', '365', 'Certificate validity period in days');


