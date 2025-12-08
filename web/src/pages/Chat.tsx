import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ChatWindow } from '@/components/Chat/ChatWindow'
import { LogOut, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export function Chat() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [loadingOtherUser, setLoadingOtherUser] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
    }
  }, [user, loading, navigate])

  useEffect(() => {
    if (user) {
      fetchOtherUser()
    }
  }, [user])

  const fetchOtherUser = async () => {
    try {
      setLoadingOtherUser(true)
      // Get all users except current user
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user!.id)
        .limit(1)
        .single()

      if (error) throw error
      setOtherUser(data as User)
    } catch (error) {
      console.error('Error fetching other user:', error)
    } finally {
      setLoadingOtherUser(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (loading || loadingOtherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!user || !otherUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-600">
            {!otherUser
              ? 'Menunggu user lain untuk bergabung...'
              : 'Memuat chat...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Top bar */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-semibold text-gray-800">{user.name}</h1>
              <p className="text-sm text-gray-500">Arrvyy Chat</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>

        {/* Chat window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow currentUser={user} otherUser={otherUser} />
        </div>
      </div>
    </div>
  )
}

