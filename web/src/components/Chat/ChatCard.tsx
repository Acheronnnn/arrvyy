import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChatWindow } from './ChatWindow'
import { useAuth } from '@/hooks/useAuth'
import { Settings, Trash2, RotateCcw, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'
import { useNavigate } from 'react-router-dom'

export function ChatCard() {
  const { user, signOut, deleteAccount, resetChat } = useAuth()
  const navigate = useNavigate()
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    if (user) {
      fetchOtherUser()
    }
  }, [user])

  const fetchOtherUser = async () => {
    try {
      setLoading(true)
      
      // Timeout untuk mencegah loading stuck
      const timeoutId = setTimeout(() => {
        console.warn('ChatCard fetch timeout')
        setLoading(false)
      }, 5000)
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .neq('id', user!.id)
        .limit(1)
        .single()

      clearTimeout(timeoutId)
      
      if (error) throw error
      setOtherUser(data as User)
    } catch (error) {
      console.error('Error fetching other user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Yakin mau hapus akun? Semua data akan dihapus permanen!')) {
      return
    }

    setDeleting(true)
    try {
      await deleteAccount()
      navigate('/login')
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Gagal menghapus akun'))
    } finally {
      setDeleting(false)
    }
  }

  const handleResetChat = async () => {
    if (!confirm('Yakin mau hapus semua pesan? Tindakan ini tidak bisa dibatalkan!')) {
      return
    }

    setResetting(true)
    try {
      await resetChat()
      alert('Chat berhasil direset!')
      window.location.reload()
    } catch (error: any) {
      alert('Error: ' + (error.message || 'Gagal reset chat'))
    } finally {
      setResetting(false)
    }
  }

  if (loading || !user || !otherUser) {
    return (
      <div className="h-full bg-gradient-to-br from-white via-pink-50/50 to-rose-50/50 backdrop-blur-lg rounded-3xl shadow-2xl flex items-center justify-center border border-white/80"
           style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!otherUser ? 'Menunggu user lain untuk bergabung...' : 'Loading chat...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-gradient-to-br from-white via-pink-50/50 to-rose-50/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/80"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {otherUser.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{otherUser.name}</h2>
            <p className="text-xs text-gray-600">{otherUser.email}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleSignOut}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Settings Menu */}
      {showSettings && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="space-y-2">
            <button
              onClick={handleResetChat}
              disabled={resetting}
              className="w-full flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{resetting ? 'Resetting...' : 'Reset Chat'}</span>
            </button>
            <button
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{deleting ? 'Menghapus...' : 'Hapus Akun'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow currentUser={user} otherUser={otherUser} />
      </div>
    </motion.div>
  )
}

