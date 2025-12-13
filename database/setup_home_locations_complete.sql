-- COMPLETE SQL Script untuk Setup Home Location
-- Jalankan script ini SEKALI di Supabase SQL Editor
-- Script ini akan:
-- 1. Menambahkan kolom home location (jika belum ada)
-- 2. Set home location untuk user dan partner

-- ==========================================
-- STEP 1: Tambahkan kolom home location (jika belum ada)
-- ==========================================
ALTER TABLE user_locations 
  ADD COLUMN IF NOT EXISTS home_latitude DECIMAL(10, 8),
  ADD COLUMN IF NOT EXISTS home_longitude DECIMAL(11, 8),
  ADD COLUMN IF NOT EXISTS home_address TEXT;

-- ==========================================
-- STEP 2: Set home location untuk user yang sedang login
-- Koordinat: Kubang Jaya, Kampar (0.41598451554786103, 101.42432373103397)
-- ==========================================
-- Pastikan user_locations row ada untuk user ini
INSERT INTO user_locations (user_id, latitude, longitude, address, is_online, last_updated_at, home_latitude, home_longitude, home_address)
SELECT 
  auth.uid() as user_id,
  COALESCE((SELECT latitude FROM user_locations WHERE user_id = auth.uid()), 0.41598451554786103) as latitude,
  COALESCE((SELECT longitude FROM user_locations WHERE user_id = auth.uid()), 101.42432373103397) as longitude,
  COALESCE((SELECT address FROM user_locations WHERE user_id = auth.uid()), 'Kubang Jaya, Kampar, Riau') as address,
  true as is_online,
  NOW() as last_updated_at,
  0.41598451554786103 as home_latitude,
  101.42432373103397 as home_longitude,
  'Kubang Jaya, Kampar, Riau' as home_address
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  home_latitude = EXCLUDED.home_latitude,
  home_longitude = EXCLUDED.home_longitude,
  home_address = EXCLUDED.home_address;

-- ==========================================
-- STEP 3: Set home location untuk partner
-- Koordinat: Pemalang, Kecamatan Taman (-6.9371771722543345, 109.4066636580928)
-- ==========================================
-- Pastikan user_locations row ada untuk partner
INSERT INTO user_locations (user_id, latitude, longitude, address, is_online, last_updated_at, home_latitude, home_longitude, home_address)
SELECT 
  u.partner_id as user_id,
  COALESCE((SELECT latitude FROM user_locations WHERE user_id = u.partner_id), -6.9371771722543345) as latitude,
  COALESCE((SELECT longitude FROM user_locations WHERE user_id = u.partner_id), 109.4066636580928) as longitude,
  COALESCE((SELECT address FROM user_locations WHERE user_id = u.partner_id), 'Jl. Wijaya Kusuma, Kecamatan Taman, Pemalang, Jawa Tengah') as address,
  true as is_online,
  NOW() as last_updated_at,
  -6.9371771722543345 as home_latitude,
  109.4066636580928 as home_longitude,
  'Jl. Wijaya Kusuma, Kecamatan Taman, Pemalang, Jawa Tengah' as home_address
FROM users u
WHERE u.id = auth.uid() 
  AND u.partner_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  home_latitude = EXCLUDED.home_latitude,
  home_longitude = EXCLUDED.home_longitude,
  home_address = EXCLUDED.home_address;

-- ==========================================
-- STEP 4: Verifikasi hasil
-- ==========================================
SELECT 
  ul.user_id,
  u.name as user_name,
  u.email,
  ul.latitude as current_lat,
  ul.longitude as current_lon,
  ul.home_latitude,
  ul.home_longitude,
  ul.home_address,
  CASE 
    WHEN ul.user_id = auth.uid() THEN 'You'
    ELSE 'Partner'
  END as location_type,
  CASE
    WHEN ul.home_latitude IS NOT NULL AND ul.home_longitude IS NOT NULL THEN '✅ Home location SET'
    ELSE '❌ Home location NOT SET'
  END as status
FROM user_locations ul
JOIN users u ON u.id = ul.user_id
WHERE ul.user_id = auth.uid() 
   OR ul.user_id IN (SELECT partner_id FROM users WHERE id = auth.uid())
ORDER BY 
  CASE WHEN ul.user_id = auth.uid() THEN 1 ELSE 2 END;

