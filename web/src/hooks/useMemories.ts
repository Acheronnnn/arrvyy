import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Memory } from '@/types'

export function useMemories(userId: string | undefined) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchMemories()
    
    const subscription = supabase
      .channel('memories_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'memories',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchMemories()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const fetchMemories = async () => {
    if (!userId) return

    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('memories')
        .select('*')
        .eq('user_id', userId)
        .order('memory_date', { ascending: false })

      if (fetchError) throw fetchError
      setMemories(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching memories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addMemory = async (memory: Omit<Memory, 'id' | 'created_at' | 'updated_at'>) => {
    if (!userId) throw new Error('User not logged in')

    try {
      const { data, error: insertError } = await supabase
        .from('memories')
        .insert({
          ...memory,
          user_id: userId,
        } as any)
        .select()
        .single()

      if (insertError) throw insertError
      setMemories([data, ...memories])
      return data
    } catch (err: any) {
      console.error('Error adding memory:', err)
      throw err
    }
  }

  const deleteMemory = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('memories')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError
      setMemories(memories.filter((m) => m.id !== id))
    } catch (err: any) {
      console.error('Error deleting memory:', err)
      throw err
    }
  }

  return {
    memories,
    loading,
    error,
    addMemory,
    deleteMemory,
    refetch: fetchMemories,
  }
}

