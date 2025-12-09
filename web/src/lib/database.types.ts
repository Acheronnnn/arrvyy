// Database types untuk Supabase
// Generate types dengan: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          avatar_url: string | null
          birthday: string | null
          partner_birthday: string | null
          anniversary_date: string | null
          partner_id: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          avatar_url?: string | null
          birthday?: string | null
          partner_birthday?: string | null
          anniversary_date?: string | null
          partner_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          avatar_url?: string | null
          birthday?: string | null
          partner_birthday?: string | null
          anniversary_date?: string | null
          partner_id?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          created_at: string
          read_at: string | null
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          created_at?: string
          read_at?: string | null
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          created_at?: string
          read_at?: string | null
        }
      }
      chat_rooms: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          created_at?: string
        }
      }
      love_notes: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      memories: {
        Row: {
          id: string
          user_id: string
          partner_id: string | null
          title: string
          description: string | null
          photo_url: string | null
          memory_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          partner_id?: string | null
          title: string
          description?: string | null
          photo_url?: string | null
          memory_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          partner_id?: string | null
          title?: string
          description?: string | null
          photo_url?: string | null
          memory_date?: string
          created_at?: string
          updated_at?: string
        }
      }
      mood_tracker: {
        Row: {
          id: string
          user_id: string
          mood: 'happy' | 'sad' | 'excited' | 'calm' | 'love' | 'tired' | 'anxious'
          note: string | null
          mood_date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mood: 'happy' | 'sad' | 'excited' | 'calm' | 'love' | 'tired' | 'anxious'
          note?: string | null
          mood_date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mood?: 'happy' | 'sad' | 'excited' | 'calm' | 'love' | 'tired' | 'anxious'
          note?: string | null
          mood_date?: string
          created_at?: string
        }
      }
      important_dates: {
        Row: {
          id: string
          user_id: string
          title: string
          date: string
          type: 'anniversary' | 'birthday' | 'custom' | 'milestone'
          description: string | null
          color: string
          is_pinned: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          date: string
          type: 'anniversary' | 'birthday' | 'custom' | 'milestone'
          description?: string | null
          color?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          date?: string
          type?: 'anniversary' | 'birthday' | 'custom' | 'milestone'
          description?: string | null
          color?: string
          is_pinned?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      streaks: {
        Row: {
          id: string
          user_id: string
          streak_type: 'chat' | 'activity' | 'love_notes'
          current_streak: number
          longest_streak: number
          last_activity_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          streak_type: 'chat' | 'activity' | 'love_notes'
          current_streak?: number
          longest_streak?: number
          last_activity_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          streak_type?: 'chat' | 'activity' | 'love_notes'
          current_streak?: number
          longest_streak?: number
          last_activity_date?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

