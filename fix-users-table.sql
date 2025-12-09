-- Fix users table - Tambah kolom yang diperlukan
-- Jalankan di Supabase SQL Editor

-- 1. Update users table - tambah field untuk data romantis
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS partner_birthday DATE,
ADD COLUMN IF NOT EXISTS anniversary_date DATE,
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES users(id);

-- 2. Verifikasi kolom sudah ditambahkan
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('birthday', 'partner_birthday', 'anniversary_date', 'partner_id');

