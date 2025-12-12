-- Database Schema untuk Fitur Location Tracking
-- Jalankan di Supabase SQL Editor

-- Table untuk real-time location tracking
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  address TEXT,
  is_online BOOLEAN DEFAULT true,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own and partner's location" ON user_locations
  FOR SELECT USING (
    auth.uid() = user_id 
    OR auth.uid() IN (SELECT partner_id FROM users WHERE id = user_locations.user_id)
  );

CREATE POLICY "Users can insert their own location" ON user_locations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own location" ON user_locations
  FOR UPDATE USING (auth.uid() = user_id);

-- Index untuk performance
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_last_updated ON user_locations(last_updated_at);

