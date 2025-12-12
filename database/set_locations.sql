-- SQL Script untuk Set Lokasi dengan Koordinat yang Diberikan
-- Jalankan di Supabase SQL Editor setelah schema sudah dibuat
-- Pastikan sudah login dan partner_id sudah di-set di tabel users

-- Set lokasi untuk user yang sedang login (Kubang Jaya, Kampar)
INSERT INTO user_locations (user_id, latitude, longitude, address, is_online, last_updated_at)
SELECT 
  auth.uid() as user_id,
  0.41584767223285474 as latitude,
  101.423992115027 as longitude,
  'Kubang Jaya, Kampar, Riau' as address,
  true as is_online,
  NOW() as last_updated_at
WHERE auth.uid() IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  address = EXCLUDED.address,
  is_online = EXCLUDED.is_online,
  last_updated_at = NOW();

-- Set lokasi untuk partner (Pemalang, Kecamatan Taman)
INSERT INTO user_locations (user_id, latitude, longitude, address, is_online, last_updated_at)
SELECT 
  u.partner_id as user_id,
  -6.937005 as latitude,
  109.406803 as longitude,
  'Jl. Wijaya Kusuma, Kecamatan Taman, Pemalang, Jawa Tengah' as address,
  true as is_online,
  NOW() as last_updated_at
FROM users u
WHERE u.id = auth.uid() 
  AND u.partner_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  address = EXCLUDED.address,
  is_online = EXCLUDED.is_online,
  last_updated_at = NOW();

-- Verifikasi lokasi yang sudah tersimpan
SELECT 
  ul.*,
  u.name as user_name,
  u.email
FROM user_locations ul
JOIN users u ON u.id = ul.user_id
ORDER BY ul.last_updated_at DESC;
