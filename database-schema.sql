-- Database Schema untuk Fitur Romantis Arrvyy
-- Jalankan di Supabase SQL Editor

-- 1. Update users table - tambah field untuk data romantis
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS partner_birthday DATE,
ADD COLUMN IF NOT EXISTS anniversary_date DATE,
ADD COLUMN IF NOT EXISTS partner_id UUID REFERENCES users(id);

-- 2. Create important_dates table
CREATE TABLE IF NOT EXISTS important_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('anniversary', 'birthday', 'custom', 'milestone')),
  is_pinned BOOLEAN DEFAULT false,
  description TEXT,
  color TEXT DEFAULT '#6366f1', -- Default purple
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create memories table (untuk Memory Timeline)
CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  memory_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create love_notes table
CREATE TABLE IF NOT EXISTS love_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_secret BOOLEAN DEFAULT false,
  reveal_at TIMESTAMPTZ, -- Untuk auto-reveal pada waktu tertentu
  is_read BOOLEAN DEFAULT false,
  color TEXT DEFAULT '#f472b6', -- Default pink
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create daily_questions table
CREATE TABLE IF NOT EXISTS daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT,
  question_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create mood_tracker table
CREATE TABLE IF NOT EXISTS mood_tracker (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL CHECK (mood IN ('happy', 'sad', 'excited', 'calm', 'love', 'tired', 'anxious')),
  note TEXT,
  mood_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, mood_date)
);

-- 7. Create streaks table (untuk streak counter)
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  partner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('chat', 'activity', 'love_note')),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, partner_id, streak_type)
);

-- 8. Enable RLS (Row Level Security)
ALTER TABLE important_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE love_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_tracker ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies untuk important_dates
CREATE POLICY "Users can view their own important dates" ON important_dates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own important dates" ON important_dates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own important dates" ON important_dates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own important dates" ON important_dates
  FOR DELETE USING (auth.uid() = user_id);

-- 10. RLS Policies untuk memories
CREATE POLICY "Users can view their own memories" ON memories
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can insert their own memories" ON memories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" ON memories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memories" ON memories
  FOR DELETE USING (auth.uid() = user_id);

-- 11. RLS Policies untuk love_notes
CREATE POLICY "Users can view notes sent/received" ON love_notes
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send notes" ON love_notes
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their sent notes" ON love_notes
  FOR UPDATE USING (auth.uid() = sender_id);

CREATE POLICY "Users can delete their sent notes" ON love_notes
  FOR DELETE USING (auth.uid() = sender_id);

-- 12. RLS Policies untuk daily_questions
CREATE POLICY "Users can view their own questions" ON daily_questions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own questions" ON daily_questions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own questions" ON daily_questions
  FOR UPDATE USING (auth.uid() = user_id);

-- 13. RLS Policies untuk mood_tracker
CREATE POLICY "Users can view their own mood" ON mood_tracker
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mood" ON mood_tracker
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mood" ON mood_tracker
  FOR UPDATE USING (auth.uid() = user_id);

-- 14. RLS Policies untuk streaks
CREATE POLICY "Users can view their streaks" ON streaks
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = partner_id);

CREATE POLICY "Users can insert their streaks" ON streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their streaks" ON streaks
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() = partner_id);

-- 15. Create indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_important_dates_user_id ON important_dates(user_id);
CREATE INDEX IF NOT EXISTS idx_important_dates_date ON important_dates(date);
CREATE INDEX IF NOT EXISTS idx_important_dates_is_pinned ON important_dates(is_pinned);
CREATE INDEX IF NOT EXISTS idx_memories_user_id ON memories(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_memory_date ON memories(memory_date);
CREATE INDEX IF NOT EXISTS idx_love_notes_receiver_id ON love_notes(receiver_id);
CREATE INDEX IF NOT EXISTS idx_love_notes_reveal_at ON love_notes(reveal_at);
CREATE INDEX IF NOT EXISTS idx_daily_questions_user_date ON daily_questions(user_id, question_date);
CREATE INDEX IF NOT EXISTS idx_mood_tracker_user_date ON mood_tracker(user_id, mood_date);
CREATE INDEX IF NOT EXISTS idx_streaks_user_partner ON streaks(user_id, partner_id);

-- 16. Create function untuk update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 17. Create triggers untuk auto-update updated_at
CREATE TRIGGER update_important_dates_updated_at
  BEFORE UPDATE ON important_dates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at
  BEFORE UPDATE ON memories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

