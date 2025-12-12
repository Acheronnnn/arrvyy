import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ChatWindow } from './ChatWindow'
import { useAuth } from '@/hooks/useAuth'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { Settings, Trash2, RotateCcw } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

// Helper function to get Google Drive thumbnail URL
function getDriveImageUrl(photoUrl: string | undefined | null): string | null {
  if (!photoUrl) {
    return null
  }
  
  let fileId: string | null = null
  
  const match1 = photoUrl.match(/[?&]id=([^&?]+)/)
  if (match1 && match1[1]) {
    fileId = match1[1].trim()
  } else {
    const match2 = photoUrl.match(/\/file\/d\/([^\/?&]+)/)
    if (match2 && match2[1]) {
      fileId = match2[1].trim()
    }
  }
  
  if (fileId) {
    const cleanedFileId = fileId.split('?')[0].split('&')[0].trim()
    return `https://drive.google.com/thumbnail?id=${cleanedFileId}&sz=w1000`
  }
  
  return photoUrl
}

export function ChatCard() {
  const navigate = useNavigate()
  const { user, deleteAccount, resetChat } = useAuth()
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)
  
  // Real-time online status
  const { isOnline, statusText } = useOnlineStatus({
    userId: user?.id,
    otherUserId: otherUser?.id,
  })

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
      <div className="h-full bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 backdrop-blur-lg rounded-3xl shadow-2xl flex items-center justify-center border border-sky-100/80"
           style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!otherUser ? 'Menunggu user lain untuk bergabung...' : 'Loading chat...'}
          </p>
        </div>
      </div>
    )
  }

  const otherUserAvatarUrl = getDriveImageUrl(otherUser.avatar_url)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-sky-100/80"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      {/* Header - Ocean Blue Theme */}
      <div className="bg-gradient-to-r from-sky-50/90 via-blue-50/90 to-cyan-50/90 backdrop-blur-md border-b border-sky-200/60 p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Avatar dengan foto profil */}
            <div className="relative">
              {otherUserAvatarUrl ? (
                <img
                  src={otherUserAvatarUrl}
                  alt={otherUser.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-sky-200/50 shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                    const fallback = target.nextElementSibling as HTMLElement
                    if (fallback) fallback.style.display = 'flex'
                  }}
                />
              ) : null}
              <div className={`${otherUserAvatarUrl ? 'hidden' : 'flex'} w-12 h-12 bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-400 rounded-full items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-sky-200/50`}>
                {otherUser.name.charAt(0).toUpperCase()}
              </div>
              {/* Online indicator */}
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
              )}
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-lg">{otherUser.name}</h2>
              <div className="flex items-center space-x-2">
                {isOnline && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                )}
                <p className={`text-xs font-medium ${isOnline ? 'text-green-600' : 'text-gray-600'}`}>
                  {statusText}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Settings Menu */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-sky-200/60 bg-gradient-to-br from-sky-50/30 to-blue-50/30 backdrop-blur-sm"
          >
            <div className="p-3 space-y-1.5">
              <button
                onClick={handleResetChat}
                disabled={resetting}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-orange-600 hover:text-orange-700 hover:bg-orange-50/50 rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="font-medium">{resetting ? 'Resetting...' : 'Reset Chat'}</span>
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50/50 rounded-xl transition-all duration-200 disabled:opacity-50 hover:scale-[1.02]"
              >
                <Trash2 className="w-4 h-4" />
                <span className="font-medium">{deleting ? 'Menghapus...' : 'Hapus Akun'}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden relative z-10">
        <ChatWindow currentUser={user} otherUser={otherUser} />
      </div>
    </motion.div>
  )
}

