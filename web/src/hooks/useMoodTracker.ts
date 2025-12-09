import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, isToday } from 'date-fns'
import type { MoodEntry } from '@/types'

export function useMoodTracker(userId: string | undefined) {
  const [todayMood, setTodayMood] = useState<MoodEntry | null>(null)
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchMoods()
    
    const subscription = supabase
      .channel('mood_tracker_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mood_tracker',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchMoods()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const fetchMoods = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('mood_tracker')
        .select('*')
        .eq('user_id', userId)
        .order('mood_date', { ascending: false })
        .limit(7)

      if (fetchError) throw fetchError
      
      const today = data?.find((m) => isToday(new Date(m.mood_date))) || null
      setTodayMood(today)
      setRecentMoods(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching moods:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const setMood = async (mood: MoodEntry['mood'], note?: string) => {
    if (!userId) throw new Error('User not logged in')

    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      
      const { data, error: upsertError } = await supabase
        .from('mood_tracker')
        .upsert({
          user_id: userId,
          mood,
          note,
          mood_date: today,
        }, {
          onConflict: 'user_id,mood_date',
        })
        .select()
        .single()

      if (upsertError) throw upsertError
      
      setTodayMood(data)
      if (!recentMoods.find((m) => isToday(new Date(m.mood_date)))) {
        setRecentMoods([data, ...recentMoods])
      } else {
        setRecentMoods(recentMoods.map((m) => 
          isToday(new Date(m.mood_date)) ? data : m
        ))
      }
      
      return data
    } catch (err: any) {
      console.error('Error setting mood:', err)
      throw err
    }
  }

  return {
    todayMood,
    recentMoods,
    loading,
    error,
    setMood,
    refetch: fetchMoods,
  }
}

