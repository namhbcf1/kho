-- Update user passwords with correct hash format
UPDATE users SET password_hash = '6e1d58108a5d69021fe32f7c07f44148a65e086408b1d55911b04b471a88f32b' WHERE email = 'admin@pos.com';
UPDATE users SET password_hash = '6e1d58108a5d69021fe32f7c07f44148a65e086408b1d55911b04b471a88f32b' WHERE email = 'manager@pos.com';  
UPDATE users SET password_hash = '6e1d58108a5d69021fe32f7c07f44148a65e086408b1d55911b04b471a88f32b' WHERE email = 'cashier@pos.com'; 