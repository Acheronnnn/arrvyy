import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ChatWindow } from '@/components/Chat/ChatWindow'
import { LogOut, Loader2, Trash2, RotateCcw, Settings } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export function Chat() {
  const { user, loading, signOut, deleteAccount, resetChat } = useAuth()
  const navigate = useNavigate()
  const [otherUser, setOtherUser] = useState<User | null>(null)
  const [loadingOtherUser, setLoadingOtherUser] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [resetting, setResetting] = useState(false)

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
              <p className="text-sm text-gray-500">Arrvyy Chat - Private untuk 2 user</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        {/* Settings Menu */}
        {showSettings && (
          <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-6 py-4">
            <div className="max-w-4xl mx-auto space-y-3">
              <h3 className="font-semibold text-gray-800 mb-3">Pengaturan</h3>
              <button
                onClick={handleResetChat}
                disabled={resetting}
                className="flex items-center space-x-2 px-4 py-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-lg transition disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{resetting ? 'Resetting...' : 'Reset Chat (Hapus semua pesan)'}</span>
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting ? 'Menghapus...' : 'Hapus Akun'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Chat window */}
        <div className="flex-1 overflow-hidden">
          <ChatWindow currentUser={user} otherUser={otherUser} />
        </div>
      </div>
    </div>
  )
}

