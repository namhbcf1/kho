-- Migration: Remove unused customer fields

ALTER TABLE customers DROP COLUMN gender;
ALTER TABLE customers DROP COLUMN birthday;
ALTER TABLE customers DROP COLUMN city; 