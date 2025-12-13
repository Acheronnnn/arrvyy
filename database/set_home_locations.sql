-- SQL Script untuk Set Home Location untuk User dan Partner
-- Jalankan di Supabase SQL Editor setelah menjalankan add_home_location.sql

-- Set home location untuk user yang sedang login (Kubang Jaya, Kampar)
UPDATE user_locations
SET 
  home_latitude = 0.41598451554786103,
  home_longitude = 101.42432373103397,
  home_address = 'Kubang Jaya, Kampar, Riau'
WHERE user_id = auth.uid()
  AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid());

-- Set home location untuk partner (Pemalang, Kecamatan Taman)
UPDATE user_locations
SET 
  home_latitude = -6.9371771722543345,
  home_longitude = 109.4066636580928,
  home_address = 'Jl. Wijaya Kusuma, Kecamatan Taman, Pemalang, Jawa Tengah'
WHERE user_id IN (
  SELECT partner_id 
  FROM users 
  WHERE id = auth.uid() 
    AND partner_id IS NOT NULL
)
  AND EXISTS (
    SELECT 1 
    FROM users u1
    WHERE u1.id = auth.uid() 
      AND u1.partner_id = user_locations.user_id
  );

-- Verifikasi home locations yang sudah tersimpan
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
  END as location_type
FROM user_locations ul
JOIN users u ON u.id = ul.user_id
WHERE ul.user_id = auth.uid() 
   OR ul.user_id IN (SELECT partner_id FROM users WHERE id = auth.uid())
ORDER BY 
  CASE WHEN ul.user_id = auth.uid() THEN 1 ELSE 2 END;

