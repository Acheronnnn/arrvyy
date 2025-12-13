-- Tambahkan kolom home location ke user_locations table
ALTER TABLE user_locations 
  ADD COLUMN IF NOT EXISTS home_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS home_longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS home_address TEXT;

-- Update RLS policy untuk allow update home location
-- (Policy sudah ada untuk UPDATE, tidak perlu tambahan)

