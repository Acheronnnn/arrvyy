import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { differenceInSeconds } from 'date-fns'

interface UseOnlineStatusProps {
  userId: string | undefined
  otherUserId: string | undefined
}

export function useOnlineStatus({ userId, otherUserId }: UseOnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<Date | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Update own last_seen_at periodically (heartbeat)
  useEffect(() => {
    if (!userId) return

    const updateLastSeen = async () => {
      try {
        // Update last_seen_at di database (jika kolom ada)
        // Jika kolom belum ada, ini akan fail gracefully
        await (supabase
          .from('users') as any)
          .update({ last_seen_at: new Date().toISOString() })
          .eq('id', userId)
      } catch (error) {
        // Kolom mungkin belum ada, ignore error
        console.debug('last_seen_at column may not exist:', error)
      }
    }

    // Update immediately
    updateLastSeen()

    // Update every 15 seconds (heartbeat)
    heartbeatIntervalRef.current = setInterval(updateLastSeen, 15000)

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [userId])

  // Check other user's online status
  useEffect(() => {
    if (!otherUserId) {
      setIsOnline(false)
      setLastSeen(null)
      return
    }

    const checkOnlineStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('last_seen_at')
          .eq('id', otherUserId)
          .single()

        if (error) {
          // Kolom mungkin belum ada
          console.debug('last_seen_at column may not exist:', error)
          setIsOnline(false)
          setLastSeen(null)
          return
        }

        if ((data as any)?.last_seen_at) {
          const lastSeenDate = new Date((data as any).last_seen_at)
          const now = new Date()
          const secondsAgo = differenceInSeconds(now, lastSeenDate)

          // Consider online if last seen < 30 seconds ago
          setLastSeen(lastSeenDate)
          setIsOnline(secondsAgo < 30)
        } else {
          setIsOnline(false)
          setLastSeen(null)
        }
      } catch (error) {
        console.debug('Error checking online status:', error)
        setIsOnline(false)
        setLastSeen(null)
      }
    }

    // Check immediately
    checkOnlineStatus()

    // Check every 5 seconds
    checkIntervalRef.current = setInterval(checkOnlineStatus, 5000)

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`user_status_${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${otherUserId}`,
        },
        (payload) => {
          const newData = payload.new as { last_seen_at?: string }
          if (newData?.last_seen_at) {
            const lastSeenDate = new Date(newData.last_seen_at)
            const now = new Date()
            const secondsAgo = differenceInSeconds(now, lastSeenDate)
            setLastSeen(lastSeenDate)
            setIsOnline(secondsAgo < 30)
          }
        }
      )
      .subscribe()

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      supabase.removeChannel(channel)
    }
  }, [otherUserId])

  const getStatusText = () => {
    if (isOnline) {
      return 'Online • Active now'
    }
    if (lastSeen) {
      const now = new Date()
      const secondsAgo = differenceInSeconds(now, lastSeen)
      const minutesAgo = Math.floor(secondsAgo / 60)
      const hoursAgo = Math.floor(minutesAgo / 60)
      const daysAgo = Math.floor(hoursAgo / 24)

      if (daysAgo > 0) {
        return `Last seen ${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`
      }
      if (hoursAgo > 0) {
        return `Last seen ${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`
      }
      if (minutesAgo > 0) {
        return `Last seen ${minutesAgo} minute${minutesAgo > 1 ? 's' : ''} ago`
      }
      return 'Last seen just now'
    }
    return 'Offline'
  }

  return {
    isOnline,
    lastSeen,
    statusText: getStatusText(),
  }
}

