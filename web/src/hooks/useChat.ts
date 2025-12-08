import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Message, User } from '@/types'

interface UseChatProps {
  currentUserId: string
  otherUserId: string
}

export function useChat({ currentUserId, otherUserId }: UseChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  // Fetch initial messages
  useEffect(() => {
    fetchMessages()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          if (
            (newMessage.sender_id === currentUserId &&
              newMessage.receiver_id === otherUserId) ||
            (newMessage.sender_id === otherUserId &&
              newMessage.receiver_id === currentUserId)
          ) {
            fetchUserAndAddMessage(newMessage)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMessage = payload.new as Message
          if (newMessage.sender_id === otherUserId) {
            fetchUserAndAddMessage(newMessage)
            // Mark as read
            markAsRead(newMessage.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, otherUserId])

  const fetchMessages = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true })

      if (error) throw error

      // Fetch user profiles for messages
      const messagesWithUsers = await Promise.all(
        (data || []).map(async (msg: any) => {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', msg.sender_id)
            .single()

          return {
            ...msg,
            sender: userData ? (userData as User) : undefined,
          } as Message
        })
      )

      setMessages(messagesWithUsers)
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserAndAddMessage = async (message: any) => {
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', message.sender_id)
      .single()

    setMessages((prev) => {
      // Avoid duplicates
      if (prev.some((m) => m.id === message.id)) return prev
      return [
        ...prev,
        {
          ...message,
          sender: userData ? (userData as User) : undefined,
        } as Message,
      ].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
    })
  }

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || sending) return

      try {
        setSending(true)
        const { data, error } = await (supabase
          .from('messages') as any)
          .insert({
            sender_id: currentUserId,
            receiver_id: otherUserId,
            content: content.trim(),
          })
          .select()
          .single()

        if (error) throw error

        // Message will be added via real-time subscription
        return data
      } catch (error) {
        console.error('Error sending message:', error)
        throw error
      } finally {
        setSending(false)
      }
    },
    [currentUserId, otherUserId, sending]
  )

  const markAsRead = async (messageId: string) => {
    try {
      await (supabase
        .from('messages') as any)
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
    } catch (error) {
      console.error('Error marking message as read:', error)
    }
  }

  return {
    messages,
    loading,
    sending,
    sendMessage,
    markAsRead,
  }
}

