import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { ImportantDate } from '@/types'

export function useImportantDates(userId: string | undefined) {
  const [dates, setDates] = useState<ImportantDate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchDates()
    
    // Subscribe to changes
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
        () => {
          fetchDates()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const fetchDates = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('important_dates')
        .select('*')
        .eq('user_id', userId)
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
        })
        .select()
        .single()

      if (insertError) throw insertError
      setDates([...dates, data])
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
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError
      setDates(dates.map((d) => (d.id === id ? data : d)))
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
      setDates(dates.filter((d) => d.id !== id))
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
