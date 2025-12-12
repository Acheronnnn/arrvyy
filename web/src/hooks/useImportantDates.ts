import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ImportantDate } from '@/types'

export function useImportantDates(userId: string | undefined, partnerId: string | undefined) {
  const [dates, setDates] = useState<ImportantDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchDates()
    
    // Subscribe to user's own date changes
    const subscription = supabase
      .channel('important_dates_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'important_dates',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Realtime important date change detected:', payload.eventType)
          fetchDates()
        }
      )
      .subscribe()

    // Subscribe to partner's date changes if partner exists
    let partnerSubscription: any = null
    if (partnerId) {
      partnerSubscription = supabase
        .channel('important_dates_partner_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'important_dates',
            filter: `user_id=eq.${partnerId}`,
          },
          (payload) => {
            console.log('🔄 Realtime partner important date change detected:', payload.eventType)
            fetchDates()
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

  const fetchDates = async () => {
    if (!userId) return

    try {
      setLoading(true)
      // Fetch dates from both user and partner (sharing)
      const { data, error: fetchError } = await supabase
        .from('important_dates')
        .select('*')
        .or(`user_id.eq.${userId}${partnerId ? `,user_id.eq.${partnerId}` : ''}`)
        .order('date', { ascending: true })

      if (fetchError) throw fetchError
      setDates(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching important dates:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addDate = async (date: Omit<ImportantDate, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) throw new Error('User not logged in')

    try {
      const { data, error: insertError } = await supabase
        .from('important_dates')
        .insert({
          ...date,
          user_id: userId,
        } as any)
        .select()
        .single()

      if (insertError) throw insertError
      
      // Use functional update to ensure we have latest state
      setDates((prev) => {
        console.log('✅ Adding important date to state:', (data as any).id)
        return [...prev, data]
      })
      
      // Also refetch to ensure consistency
      setTimeout(() => {
        fetchDates()
      }, 500)
      
      return data
    } catch (err: any) {
      console.error('Error adding date:', err)
      throw err
    }
  }

  const updateDate = async (id: string, updates: Partial<ImportantDate>) => {
    try {
      const { data, error: updateError } = await supabase
        .from('important_dates')
        .update(updates as any as never)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      
      // Use functional update
      setDates((prev) => prev.map((d) => (d.id === id ? data : d)))
      
      // Also refetch
      setTimeout(() => {
        fetchDates()
      }, 300)
      
      return data
    } catch (err: any) {
      console.error('Error updating date:', err)
      throw err
    }
  }

  const deleteDate = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('important_dates')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      
      // Use functional update
      setDates((prev) => {
        const updated = prev.filter((d) => d.id !== id)
        console.log('✅ Important date deleted from state')
        return updated
      })
      
      // Also refetch
      setTimeout(() => {
        fetchDates()
      }, 300)
    } catch (err: any) {
      console.error('Error deleting date:', err)
      throw err
    }
  }

  const togglePin = async (id: string) => {
    const date = dates.find((d) => d.id === id)
    if (!date) return

    await updateDate(id, { is_pinned: !date.is_pinned })
  }

  return {
    dates,
    loading,
    error,
    addDate,
    updateDate,
    deleteDate,
    togglePin,
    refetch: fetchDates,
  }
}
