import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Memory } from '@/types'
import { useGoogleDrive } from './useGoogleDrive'

export function useMemories(userId: string | undefined) {
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { uploadPhoto, deletePhoto, uploading: uploadingPhoto } = useGoogleDrive()

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
          // Listen to all changes (no filter, so all users see updates)
        },
        (payload) => {
          console.log('🔄 Realtime memory change detected:', payload.eventType)
          fetchMemories()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const fetchMemories = async () => {
    if (!userId) return

    try {
      setLoading(true)
      // Fetch ALL memories (all users can see all memories)
      const { data, error: fetchError } = await supabase
        .from('memories')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      
      console.log('📥 Fetched memories:', data?.length || 0)
      setMemories(data || [])
      setError(null)
    } catch (err: any) {
      console.error('Error fetching memories:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addMemory = async (
    memory: Omit<Memory, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'partner_id' | 'photo_url'>,
    photoFile?: File
  ) => {
    if (!userId) throw new Error('User not logged in')

    try {
      let photoUrl: string | undefined = undefined

      // Upload photo to Google Drive if provided
      if (photoFile) {
        try {
          photoUrl = await uploadPhoto(photoFile)
        } catch (uploadErr: any) {
          console.error('Error uploading photo:', uploadErr)
          // Ask user if they want to continue without photo
          const continueWithoutPhoto = confirm(
            `Upload foto gagal: ${uploadErr.message}\n\nApakah ingin melanjutkan tanpa foto?`
          )
          if (!continueWithoutPhoto) {
            throw new Error(`Upload failed: ${uploadErr.message || 'Failed to upload photo to Google Drive'}`)
          }
          // Continue without photo
          photoUrl = undefined
        }
      }

      const { data, error: insertError } = await supabase
        .from('memories')
        .insert({
          ...memory,
          photo_url: photoUrl,
          user_id: userId,
        } as any)
        .select()
        .single()

      if (insertError) throw insertError
      
      // Use functional update to ensure we have latest state
      setMemories((prev) => {
        console.log('✅ Adding memory to state:', (data as any).id)
        return [data, ...prev]
      })
      
      // Also refetch to ensure consistency
      setTimeout(() => {
        fetchMemories()
      }, 500)
      
      return data
    } catch (err: any) {
      console.error('Error adding memory:', err)
      throw err
    }
  }

  const deleteMemory = async (id: string) => {
    console.log('🗑️ deleteMemory called with id:', id)
    try {
      // Find the memory to get photo_url
      const memoryToDelete = memories.find((m) => m.id === id)
      
      // Delete photo from Google Drive if exists
      if (memoryToDelete?.photo_url) {
        try {
          console.log('🗑️ Deleting photo from Drive:', memoryToDelete.photo_url)
          await deletePhoto(memoryToDelete.photo_url)
        } catch (photoError: any) {
          console.warn('⚠️ Failed to delete photo from Drive:', photoError.message)
          // Continue with database delete even if Drive delete fails
          // User can manually clean up Drive later if needed
        }
      }

      // Delete from database
      const { data, error: deleteError } = await supabase
        .from('memories')
        .delete()
        .eq('id', id)
        .select()

      console.log('🗑️ Delete response:', { data, error: deleteError })

      if (deleteError) {
        console.error('❌ Delete error:', deleteError)
        throw deleteError
      }
      
      // Use functional update to ensure we have latest state
      setMemories((prev) => {
        const updated = prev.filter((m) => m.id !== id)
        console.log('✅ Memory deleted from state, updated count:', updated.length)
        return updated
      })
      
      // Also refetch to ensure consistency
      setTimeout(() => {
        fetchMemories()
      }, 300)
    } catch (err: any) {
      console.error('❌ Error deleting memory:', err)
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
    uploadingPhoto,
  }
}

