-- Coffee Training Center - Enhanced Schema Updates
-- Run this after the base schema.sql

USE coffee_training_center;

-- Add 2FA fields to users table
ALTER TABLE users 
ADD COLUMN two_factor_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN two_factor_secret VARCHAR(255) NULL,
ADD COLUMN last_login_at TIMESTAMP NULL,
ADD COLUMN session_timeout_minutes INT DEFAULT 30,
ADD COLUMN language_preference VARCHAR(10) DEFAULT 'en';

-- Add public_verifier role
ALTER TABLE users MODIFY COLUMN role ENUM('trainee', 'trainer', 'admin', 'public_verifier') DEFAULT 'trainee';

-- Audit Trail Table
CREATE TABLE audit_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INT,
    details JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Question Bank Table
CREATE TABLE question_bank (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category VARCHAR(100),
    skill_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    question_text TEXT NOT NULL,
    question_type ENUM('multiple_choice', 'true_false', 'short_answer', 'essay', 'file_upload') DEFAULT 'multiple_choice',
    options JSON,
    correct_answer TEXT NOT NULL,
    points DECIMAL(5,2) DEFAULT 1.00,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_category (category),
    INDEX idx_skill_level (skill_level),
    INDEX idx_created_by (created_by)
);

-- Update exam_questions to reference question_bank
ALTER TABLE exam_questions 
ADD COLUMN question_bank_id INT NULL,
ADD FOREIGN KEY (question_bank_id) REFERENCES question_bank(id) ON DELETE SET NULL;

-- Trainee Rankings Table
CREATE TABLE trainee_rankings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trainee_id INT NOT NULL,
    session_id INT NOT NULL,
    total_score DECIMAL(10,2) DEFAULT 0.00,
    exam_score DECIMAL(10,2) DEFAULT 0.00,
    attendance_score DECIMAL(10,2) DEFAULT 0.00,
    practical_score DECIMAL(10,2) DEFAULT 0.00,
    performance_level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
    rank_position INT,
    batch_rank INT,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    UNIQUE KEY unique_trainee_session (trainee_id, session_id),
    INDEX idx_trainee (trainee_id),
    INDEX idx_session (session_id),
    INDEX idx_performance_level (performance_level),
    INDEX idx_rank (rank_position)
);

-- Leaderboard Table
CREATE TABLE leaderboards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id INT NOT NULL,
    trainee_id INT NOT NULL,
    rank_position INT NOT NULL,
    total_score DECIMAL(10,2) NOT NULL,
    performance_level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_session (session_id),
    INDEX idx_rank (rank_position)
);

-- Certificate Collection Table
CREATE TABLE certificate_collections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    certificate_id INT NOT NULL,
    trainee_id INT NOT NULL,
    collection_reference_code VARCHAR(100) UNIQUE NOT NULL,
    status ENUM('pending', 'ready', 'collected', 'cancelled') DEFAULT 'pending',
    ready_at TIMESTAMP NULL,
    collected_at TIMESTAMP NULL,
    collected_by INT NULL,
    id_verified BOOLEAN DEFAULT FALSE,
    id_document_type VARCHAR(50) NULL,
    id_document_number VARCHAR(100) NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (certificate_id) REFERENCES certificates(id) ON DELETE CASCADE,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_certificate (certificate_id),
    INDEX idx_trainee (trainee_id),
    INDEX idx_reference_code (collection_reference_code),
    INDEX idx_status (status)
);

-- Update certificates table for collection workflow
ALTER TABLE certificates 
ADD COLUMN collection_status ENUM('pending_collection', 'ready_for_collection', 'collected', 'not_collected') DEFAULT 'pending_collection',
ADD COLUMN collection_reference_code VARCHAR(100) NULL,
ADD COLUMN collected_at TIMESTAMP NULL,
ADD COLUMN collected_by INT NULL,
ADD FOREIGN KEY (collected_by) REFERENCES users(id) ON DELETE SET NULL,
ADD INDEX idx_collection_status (collection_status);

-- Notification Templates Table
CREATE TABLE notification_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('email', 'sms', 'both') NOT NULL,
    subject VARCHAR(255),
    message_text TEXT NOT NULL,
    message_html TEXT,
    language VARCHAR(10) DEFAULT 'en',
    variables JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_key (template_key),
    INDEX idx_language (language)
);

-- Enhanced Notifications Table
ALTER TABLE notifications 
ADD COLUMN template_id INT NULL,
ADD COLUMN delivery_status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced') DEFAULT 'pending',
ADD COLUMN delivery_timestamp TIMESTAMP NULL,
ADD COLUMN error_message TEXT NULL,
ADD COLUMN language VARCHAR(10) DEFAULT 'en',
ADD FOREIGN KEY (template_id) REFERENCES notification_templates(id) ON DELETE SET NULL,
ADD INDEX idx_delivery_status (delivery_status),
ADD INDEX idx_template (template_id);

-- Password Reset Tokens Table
CREATE TABLE password_reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    used_at DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user (user_id),
    INDEX idx_expires_at (expires_at)
);

-- User Sessions Table (for session management)
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_token_hash (token_hash),
    INDEX idx_expires_at (expires_at),
    INDEX idx_active (is_active)
);

-- Trainer Assessments Table (for practical evaluations)
CREATE TABLE trainer_assessments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trainee_id INT NOT NULL,
    session_id INT NOT NULL,
    trainer_id INT NOT NULL,
    assessment_type ENUM('practical', 'performance', 'attitude', 'participation') DEFAULT 'practical',
    score DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(5,2) DEFAULT 100.00,
    feedback TEXT,
    assessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (trainee_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES training_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_trainee (trainee_id),
    INDEX idx_session (session_id),
    INDEX idx_trainer (trainer_id)
);

-- Training Programs Table (for program categorization)
CREATE TABLE training_programs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    category ENUM('coffee_processing', 'cupping', 'brewing', 'quality_control', 'other') NOT NULL,
    duration_days INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_category (category)
);

-- Link sessions to programs
ALTER TABLE training_sessions 
ADD COLUMN program_id INT NULL,
ADD FOREIGN KEY (program_id) REFERENCES training_programs(id) ON DELETE SET NULL,
ADD INDEX idx_program (program_id);

-- Communication Logs Table (enhanced)
CREATE TABLE communication_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    notification_id INT,
    recipient_id INT,
    channel ENUM('email', 'sms', 'push') NOT NULL,
    status ENUM('pending', 'sent', 'delivered', 'failed', 'bounced') DEFAULT 'pending',
    sent_at TIMESTAMP NULL,
    delivered_at TIMESTAMP NULL,
    error_message TEXT,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE SET NULL,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_notification (notification_id),
    INDEX idx_recipient (recipient_id),
    INDEX idx_status (status),
    INDEX idx_channel (channel)
);

-- Insert default notification templates
INSERT INTO notification_templates (template_key, name, type, subject, message_text, language) VALUES
('registration_confirmation', 'Registration Confirmation', 'both', 'Welcome to Coffee Training Center', 'Dear {{firstName}}, your registration has been confirmed. You can now access your dashboard.', 'en'),
('exam_reminder', 'Exam Reminder', 'both', 'Upcoming Exam: {{examTitle}}', 'Reminder: You have an exam "{{examTitle}}" scheduled for {{examDate}}. Please be prepared.', 'en'),
('certificate_ready', 'Certificate Ready for Collection', 'both', 'Certificate Ready - Collection Code: {{referenceCode}}', 'Your certificate is ready for collection. Reference Code: {{referenceCode}}. Please bring valid ID to collect.', 'en'),
('schedule_update', 'Schedule Update', 'both', 'Training Schedule Updated', 'Your training schedule has been updated. New date: {{newDate}}.', 'en');

-- Insert default training programs
INSERT INTO training_programs (name, code, description, category) VALUES
('Coffee Processing', 'CP001', 'Fundamentals of coffee processing techniques', 'coffee_processing'),
('Coffee Cupping', 'CC001', 'Professional coffee cupping and sensory evaluation', 'cupping'),
('Coffee Brewing', 'CB001', 'Various brewing methods and techniques', 'brewing'),
('Quality Control', 'QC001', 'Coffee quality assessment and control', 'quality_control');

