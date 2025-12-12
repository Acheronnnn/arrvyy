-- Script untuk Fix Table user_locations jika ada kolom yang hilang
-- Jalankan ini jika mendapat error "column does not exist"

-- Tambahkan kolom yang mungkin hilang
ALTER TABLE user_locations 
  ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT true;

-- Set default value untuk kolom yang sudah ada tapi belum ada default
ALTER TABLE user_locations 
  ALTER COLUMN last_updated_at SET DEFAULT NOW(),
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN is_online SET DEFAULT true;

-- Update nilai NULL jika ada
UPDATE user_locations 
SET 
  last_updated_at = COALESCE(last_updated_at, NOW()),
  created_at = COALESCE(created_at, NOW()),
  is_online = COALESCE(is_online, true)
WHERE last_updated_at IS NULL OR created_at IS NULL OR is_online IS NULL;

