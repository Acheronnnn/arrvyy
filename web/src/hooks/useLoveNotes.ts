import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { LoveNote } from '@/types'

export function useLoveNotes(userId: string | undefined) {
  const [notes, setNotes] = useState<LoveNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchNotes()
    
    const subscription = supabase
      .channel('love_notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'love_notes',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          fetchNotes()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const fetchNotes = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('love_notes')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setNotes(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching love notes:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addNote = async (note: Omit<LoveNote, 'id' | 'created_at'>) => {
    if (!userId) throw new Error('User not logged in')

    try {
      const { data, error: insertError } = await supabase
        .from('love_notes')
        .insert({
          ...note,
          sender_id: userId,
        } as any)
        .select()
        .single()

      if (insertError) throw insertError
      setNotes([data, ...notes])
      return data
    } catch (err: any) {
      console.error('Error adding love note:', err)
      throw err
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error: updateError } = await supabase
        .from('love_notes')
        .update({ is_read: true } as any as never)
        .eq('id', id)

      if (updateError) throw updateError
      setNotes(notes.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch (err: any) {
      console.error('Error marking note as read:', err)
      throw err
    }
  }

  return {
    notes,
    loading,
    error,
    addNote,
    markAsRead,
    refetch: fetchNotes,
  }
}

