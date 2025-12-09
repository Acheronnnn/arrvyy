import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Streak } from '@/types'

export function useStreaks(userId: string | undefined, partnerId: string | undefined) {
  const [streaks, setStreaks] = useState<Streak[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId || !partnerId) {
      setLoading(false)
      return
    }

    fetchStreaks()
    
    const subscription = supabase
      .channel('streaks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'streaks',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchStreaks()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId, partnerId])

  const fetchStreaks = async () => {
    if (!userId || !partnerId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('streaks')
        .select('*')
        .eq('user_id', userId)
        .eq('partner_id', partnerId)

      if (fetchError) throw fetchError
      setStreaks(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching streaks:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return {
    streaks,
    loading,
    error,
    refetch: fetchStreaks,
  }
}

