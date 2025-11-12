USE coffee_training_center;
UPDATE users SET password_hash = '$2a$10$kGkdTrJptCqWF7erNkGnceAnaAqhpp3knD9R5KBs4YYo8O1Ew3kI6' WHERE email = 'admin@coffeetraining.com';
SELECT email, LENGTH(password_hash) as hash_length, LEFT(password_hash, 30) as hash_preview FROM users WHERE email = 'admin@coffeetraining.com';

