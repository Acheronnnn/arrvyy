// Shared types untuk aplikasi Arrvyy

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  birthday?: string;
  partner_birthday?: string;
  anniversary_date?: string;
  partner_id?: string;
  bio?: string;
  pronouns?: string;
  display_name?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read_at?: string;
  sender?: User;
}

export interface ChatRoom {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  user1?: User;
  user2?: User;
}

export interface ImportantDate {
  id: string;
  user_id: string;
  title: string;
  date: string;
  type: 'anniversary' | 'birthday' | 'custom' | 'milestone';
  is_pinned: boolean;
  description?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  user_id: string;
  partner_id?: string;
  title: string;
  description?: string;
  photo_url?: string;
  memory_date: string;
  created_at: string;
  updated_at: string;
}

export interface LoveNote {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_secret: boolean;
  reveal_at?: string;
  is_read: boolean;
  color?: string;
  created_at: string;
}

export interface DailyQuestion {
  id: string;
  user_id: string;
  question: string;
  answer?: string;
  question_date: string;
  created_at: string;
}

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: 'happy' | 'sad' | 'excited' | 'calm' | 'love' | 'tired' | 'anxious';
  note?: string;
  mood_date: string;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  partner_id: string;
  streak_type: 'chat' | 'activity' | 'love_note';
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  updated_at: string;
}

export interface Song {
  id: string;
  spotify_id: string;
  title: string;
  artist: string;
  album?: string;
  cover_url?: string;
  preview_url?: string;
  duration_ms?: number;
  external_url?: string;
  created_at?: string;
}

export interface Playlist {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  cover_url?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  songs?: Song[];
  song_count?: number;
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  order_index: number;
  added_at: string;
  song?: Song;
}

export interface LikedSong {
  id: string;
  user_id: string;
  song_id: string;
  liked_at: string;
  song?: Song;
}

export interface SongLyrics {
  id: string;
  song_id: string;
  lyrics: string[];
  synced_lyrics?: any;
  source?: string;
  created_at: string;
  updated_at: string;
}

