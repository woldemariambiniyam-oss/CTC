# Entity Relationship Diagram (ERD)

## Entities and Relationships

### Core Entities

1. **Users**
   - Primary Key: `id`
   - Attributes: email, password_hash, first_name, last_name, phone, role, status
   - Relationships:
     - One-to-Many with `training_sessions` (as trainer)
     - One-to-Many with `session_enrollments` (as trainee)
     - One-to-Many with `queue_entries` (as trainee)
     - One-to-Many with `exam_attempts` (as trainee)
     - One-to-Many with `certificates` (as trainee)
     - One-to-Many with `notifications`

2. **Training Sessions**
   - Primary Key: `id`
   - Attributes: title, description, session_date, duration_minutes, max_capacity, status, location
   - Relationships:
     - Many-to-One with `users` (trainer)
     - One-to-Many with `session_enrollments`
     - One-to-Many with `queue_entries`
     - One-to-Many with `examinations`
     - One-to-Many with `certificates`

3. **Session Enrollments**
   - Primary Key: `id`
   - Foreign Keys: `trainee_id`, `session_id`
   - Attributes: enrollment_date, status, attendance_marked_at
   - Relationships:
     - Many-to-One with `users` (trainee)
     - Many-to-One with `training_sessions`

4. **Queue Entries**
   - Primary Key: `id`
   - Foreign Keys: `trainee_id`, `session_id`
   - Attributes: queue_position, status, joined_at, processed_at
   - Relationships:
     - Many-to-One with `users` (trainee)
     - Many-to-One with `training_sessions`

5. **Examinations**
   - Primary Key: `id`
   - Foreign Key: `session_id`
   - Attributes: title, description, total_questions, passing_score, duration_minutes, start_time, end_time, status
   - Relationships:
     - Many-to-One with `training_sessions`
     - One-to-Many with `exam_questions`
     - One-to-Many with `exam_attempts`

6. **Exam Questions**
   - Primary Key: `id`
   - Foreign Key: `exam_id`
   - Attributes: question_text, question_type, options, correct_answer, points, question_order
   - Relationships:
     - Many-to-One with `examinations`
     - One-to-Many with `exam_answers`

7. **Exam Attempts**
   - Primary Key: `id`
   - Foreign Keys: `trainee_id`, `exam_id`
   - Attributes: started_at, submitted_at, score, total_points, percentage_score, passed, status
   - Relationships:
     - Many-to-One with `users` (trainee)
     - Many-to-One with `examinations`
     - One-to-Many with `exam_answers`
     - One-to-Many with `certificates`

8. **Exam Answers**
   - Primary Key: `id`
   - Foreign Keys: `attempt_id`, `question_id`
   - Attributes: answer_text, is_correct, points_earned
   - Relationships:
     - Many-to-One with `exam_attempts`
     - Many-to-One with `exam_questions`

9. **Certificates**
   - Primary Key: `id`
   - Foreign Keys: `trainee_id`, `session_id`, `exam_attempt_id`
   - Attributes: certificate_number, issue_date, expiry_date, qr_code_url, qr_code_data, pdf_url, status
   - Relationships:
     - Many-to-One with `users` (trainee)
     - Many-to-One with `training_sessions`
     - Many-to-One with `exam_attempts`

10. **Notifications**
    - Primary Key: `id`
    - Foreign Key: `user_id`
    - Attributes: type, subject, message, status, sent_at
    - Relationships:
      - Many-to-One with `users`

## Relationship Summary

```
Users (1) ────< (N) Session Enrollments
Users (1) ────< (N) Queue Entries
Users (1) ────< (N) Exam Attempts
Users (1) ────< (N) Certificates
Users (1) ────< (N) Notifications
Users (1) ────< (N) Training Sessions (as trainer)

Training Sessions (1) ────< (N) Session Enrollments
Training Sessions (1) ────< (N) Queue Entries
Training Sessions (1) ────< (N) Examinations
Training Sessions (1) ────< (N) Certificates

Examinations (1) ────< (N) Exam Questions
Examinations (1) ────< (N) Exam Attempts

Exam Attempts (1) ────< (N) Exam Answers
Exam Attempts (1) ────< (N) Certificates

Exam Questions (1) ────< (N) Exam Answers
```


