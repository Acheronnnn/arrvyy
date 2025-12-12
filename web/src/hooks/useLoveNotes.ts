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
    
    // Subscribe to both sender and receiver changes
    const subscription1 = supabase
      .channel('love_notes_receiver_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'love_notes',
          filter: `receiver_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Realtime love note change (receiver):', payload.eventType, payload.new?.id || payload.old?.id)
          fetchNotes()
        }
      )
      .subscribe()

    const subscription2 = supabase
      .channel('love_notes_sender_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'love_notes',
          filter: `sender_id=eq.${userId}`,
        },
        (payload) => {
          console.log('🔄 Realtime love note change (sender):', payload.eventType, payload.new?.id || payload.old?.id)
          fetchNotes()
        }
      )
      .subscribe()

    return () => {
      subscription1.unsubscribe()
      subscription2.unsubscribe()
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
      
      // Use functional update to ensure we have latest state
      setNotes((prev) => {
        console.log('✅ Adding love note to state:', data.id)
        return [data, ...prev]
      })
      
      // Also refetch to ensure consistency
      setTimeout(() => {
        fetchNotes()
      }, 500)
      
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
      setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    } catch (err: any) {
      console.error('Error marking note as read:', err)
      throw err
    }
  }

  const deleteNote = async (id: string) => {
    try {
      console.log('🗑️ deleteNote called with id:', id)
      console.log('🗑️ Current notes count:', notes.length)
      
      // Optimistic update first
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== id)
        console.log('✅ Optimistic update - remaining notes:', updated.length)
        return updated
      })
      
      // Then delete from database
      const { data, error: deleteError } = await supabase
        .from('love_notes')
        .delete()
        .eq('id', id)
        .select()

      console.log('🗑️ Delete response:', { data, error: deleteError })

      if (deleteError) {
        console.error('❌ Delete error:', deleteError)
        // Revert optimistic update on error
        fetchNotes()
        throw deleteError
      }
      
      // Refetch to ensure consistency (realtime might not fire immediately)
      setTimeout(() => {
        console.log('🔄 Refetching notes after delete...')
        fetchNotes()
      }, 500)
    } catch (err: any) {
      console.error('❌ Error deleting love note:', err)
      // Revert on error
      fetchNotes()
      throw err
    }
  }

  return {
    notes,
    loading,
    error,
    addNote,
    markAsRead,
    deleteNote,
    refetch: fetchNotes,
  }
}

