import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { format, isToday } from 'date-fns'
import type { MoodEntry } from '@/types'

export function useMoodTracker(userId: string | undefined, partnerId: string | undefined) {
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
    
    // Subscribe to user's own mood changes
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

    // Subscribe to partner's mood changes if partner exists
    let partnerSubscription: any = null
    if (partnerId) {
      partnerSubscription = supabase
        .channel('mood_tracker_partner_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'mood_tracker',
            filter: `user_id=eq.${partnerId}`,
          },
          () => {
            fetchMoods()
          }
        )
        .subscribe()
    }

    return () => {
      subscription.unsubscribe()
      if (partnerSubscription) {
        partnerSubscription.unsubscribe()
      }
    }
  }, [userId, partnerId])

  const fetchMoods = async () => {
    if (!userId) return

    try {
      setLoading(true)
      // Fetch moods from both user and partner (sharing) if partner exists
      // Otherwise, just fetch user's own moods
      let query = supabase
        .from('mood_tracker')
        .select('*')
      
      if (partnerId) {
        // Use .or() when both user and partner exist
        query = query.or(`user_id.eq.${userId},user_id.eq.${partnerId}`)
      } else {
        // Use .eq() when only user exists (no partner)
        query = query.eq('user_id', userId)
      }
      
      const { data, error: fetchError } = await query
        .order('mood_date', { ascending: false })
        .limit(partnerId ? 14 : 7) // 7 for user + 7 for partner, or just 7 for user

      if (fetchError) throw fetchError
      
      // Find today's mood (prioritize user's own mood if both exist)
      const userTodayMood = data?.find((m: any) => isToday(new Date(m.mood_date)) && m.user_id === userId) || null
      const partnerTodayMood = partnerId ? data?.find((m: any) => isToday(new Date(m.mood_date)) && m.user_id === partnerId) || null : null
      setTodayMood(userTodayMood || partnerTodayMood)
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
        } as any, {
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

