-- Migration: Add user_id to orders table
-- Date: 2024-01-15

-- Add user_id column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id) ON DELETE RESTRICT;

-- Create index for user_id
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);

-- Update existing orders to have user_id = 1 (admin)
UPDATE orders SET user_id = 1 WHERE user_id IS NULL OR user_id = 0; 