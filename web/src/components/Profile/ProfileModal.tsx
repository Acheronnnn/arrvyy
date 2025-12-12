import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Edit2, Camera, ArrowLeft, ChevronRight, Image, Sparkles } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useGoogleDrive } from '@/hooks/useGoogleDrive'
import { supabase } from '@/lib/supabase'

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

// Helper function untuk format Date ke yyyy-MM-dd tanpa timezone issues
const formatDateForInput = (date: Date | string | null | undefined): string => {
  if (!date) return ''
  const d = typeof date === 'string' ? new Date(date) : date
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, fetchUserProfile } = useAuth()
  const { uploadPhoto, uploading: uploadingAvatar } = useGoogleDrive()
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view')
  const [_partner, setPartner] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Statistics
  const [_stats, setStats] = useState({
    memoriesCount: 0,
    loveNotesCount: 0,
    totalStreak: 0,
    daysTogether: 0,
  })

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    pronouns: '',
    birthday: '',
    anniversary_date: '',
    partner_birthday: '',
  })

  useEffect(() => {
    if (isOpen && user) {
      fetchPartner()
      fetchStatistics()
      // Reset to view tab when modal opens
      setActiveTab('view')
      // Initialize edit form
      setEditForm({
        name: user.name || '',
        bio: (user as any).bio || '',
        pronouns: (user as any).pronouns || '',
        birthday: formatDateForInput(user.birthday),
        anniversary_date: formatDateForInput(user.anniversary_date),
        partner_birthday: formatDateForInput(user.partner_birthday),
      })
      // Set avatar preview
      setAvatarPreview(user.avatar_url || null)
    }
  }, [isOpen, user])

  const fetchPartner = async () => {
    if (!user?.partner_id) return
    
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.partner_id)
        .single()
      
      if (data) {
        setPartner(data)
      }
    } catch (error) {
      console.error('Error fetching partner:', error)
    }
  }

  const fetchStatistics = async () => {
    if (!user) return

    try {
      // Fetch memories count
      const { count: memoriesCount } = await supabase
        .from('memories')
        .select('*', { count: 'exact', head: true })

      // Fetch love notes count
      const { count: loveNotesCount } = await supabase
        .from('love_notes')
        .select('*', { count: 'exact', head: true })
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)

      // Fetch streaks
      const { data: streaksData } = await supabase
        .from('streaks')
        .select('current_streak')
        .eq('user_id', user.id)

      const totalStreak = streaksData?.reduce((sum: number, s: any) => sum + (s.current_streak || 0), 0) || 0

      // Calculate days together
      let daysTogether = 0
      if (user.anniversary_date) {
        const anniversary = new Date(user.anniversary_date)
        const today = new Date()
        daysTogether = differenceInDays(today, anniversary)
      }

      setStats({
        memoriesCount: memoriesCount || 0,
        loveNotesCount: loveNotesCount || 0,
        totalStreak,
        daysTogether: daysTogether > 0 ? daysTogether : 0,
      })
    } catch (error) {
      console.error('Error fetching statistics:', error)
    }
  }

  const handleAvatarUpload = async (file: File) => {
    if (!user) return

    try {
      // Upload to Google Drive
      const avatarUrl = await uploadPhoto(file)
      
      // Update user avatar_url
      const { error } = await (supabase
        .from('users') as any)
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (error) throw error

      // Update preview
      setAvatarPreview(avatarUrl)
      
      // Refresh user profile
      await fetchUserProfile(user.id)
    } catch (error: any) {
      alert('Error uploading avatar: ' + (error.message || 'Failed to upload'))
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // Upload avatar
    handleAvatarUpload(file)
  }

  const handleSave = async () => {
    if (!user) return

    try {
      setSaving(true)
      
      const updates: any = {}
      if (editForm.name && editForm.name !== user.name) {
        updates.name = editForm.name
      }
      if (editForm.bio !== undefined) {
        updates.bio = editForm.bio || null
      }
      if (editForm.pronouns !== undefined) {
        updates.pronouns = editForm.pronouns || null
      }
      if (editForm.birthday) {
        updates.birthday = editForm.birthday
      } else {
        updates.birthday = null
      }
      if (editForm.anniversary_date) {
        updates.anniversary_date = editForm.anniversary_date
      } else {
        updates.anniversary_date = null
      }
      if (editForm.partner_birthday) {
        updates.partner_birthday = editForm.partner_birthday
      } else {
        updates.partner_birthday = null
      }

      const { error } = await (supabase
        .from('users') as any)
        .update(updates)
        .eq('id', user.id)

      if (error) throw error

      // Refresh user profile
      await fetchUserProfile(user.id)
      
      // Refresh statistics
      await fetchStatistics()
      
      // Switch back to view tab
      setActiveTab('view')
    } catch (error: any) {
      alert('Error updating profile: ' + (error.message || 'Failed to update'))
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#36393f] rounded-3xl shadow-2xl w-full max-w-md border border-gray-700/50 relative overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          {/* View Tab - Discord Style */}
          {activeTab === 'view' && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header */}
              <div className="bg-[#2f3136] border-b border-gray-700/50 p-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Profile</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4 text-gray-300" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-[#36393f]">
                {/* Avatar & Username Section */}
                <div className="p-6 pb-4">
                  <div className="flex items-start space-x-4">
                    {/* Avatar */}
                    <div className="relative">
                      {user.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gradient-to-br from-pink-400 via-rose-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      {/* Status indicator */}
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-[#36393f] rounded-full flex items-center justify-center border-2 border-[#36393f]">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                    </div>

                    {/* Username & Info */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-xl font-bold text-white">{user.name}</h3>
                        <ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{user.email}</p>
                      {(user as any).bio && (
                        <p className="text-sm text-gray-300">{(user as any).bio}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Profile Button */}
                <div className="px-6 pb-4">
                  <button
                    onClick={() => setActiveTab('edit')}
                    className="w-full py-3 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                </div>

                {/* Profile Cards - Simplified */}
                <div className="px-6 space-y-3 pb-6">
                  {/* About Me */}
                  <div className="bg-[#2f3136] rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">About Me</h4>
                    {(user as any).bio ? (
                      <p className="text-sm text-gray-300">{(user as any).bio}</p>
                    ) : (
                      <p className="text-sm text-gray-500 italic">No bio set</p>
                    )}
                  </div>

                  {/* Member Since */}
                  <div className="bg-[#2f3136] rounded-lg p-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Member Since</h4>
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-pink-400 to-purple-500 rounded"></div>
                      <p className="text-sm text-gray-300">{format(new Date(user.created_at), 'MMM d, yyyy')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Tab - Discord Style */}
          {activeTab === 'edit' && (
            <div className="flex flex-col h-full max-h-[90vh]">
              {/* Header with Back & Save */}
              <div className="bg-[#2f3136] border-b border-gray-700/50 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setActiveTab('view')}
                    className="w-8 h-8 rounded-full bg-gray-700/50 hover:bg-gray-700 flex items-center justify-center transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 text-gray-300" />
                  </button>
                  <h2 className="text-lg font-semibold text-white">Profile</h2>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-4 py-1.5 rounded text-sm font-semibold transition-colors ${
                    saving
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-[#5865f2] hover:text-[#4752c4]'
                  }`}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>

              {/* Tabs */}
              <div className="bg-[#2f3136] border-b border-gray-700/50 px-4 flex items-center space-x-4">
                <button className="py-3 border-b-2 border-[#5865f2] text-white font-medium text-sm">
                  Main Profile
                </button>
                <button className="py-3 text-gray-400 font-medium text-sm hover:text-gray-300">
                  Per-server Profiles
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="flex-1 overflow-y-auto bg-[#36393f] p-6 space-y-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-[#5865f2]"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gradient-to-br from-pink-400 via-rose-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-[#5865f2]">
                        {editForm.name.charAt(0).toUpperCase() || user.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-[#5865f2] rounded-full flex items-center justify-center shadow-lg hover:bg-[#4752c4] transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Edit Avatar, Decoration, Border */}
                  <div className="w-full space-y-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="w-full px-4 py-3 bg-[#2f3136] hover:bg-[#3a3d44] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 border border-gray-700/50 disabled:opacity-50"
                    >
                      <Image className="w-4 h-4" />
                      <span>{uploadingAvatar ? 'Uploading...' : 'Edit Profile Picture'}</span>
                    </button>
                    
                    <button
                      className="w-full px-4 py-3 bg-[#2f3136] hover:bg-[#3a3d44] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 border border-gray-700/50"
                      onClick={() => alert('Edit Decoration feature coming soon!')}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Edit Decoration</span>
                    </button>
                    
                    <button
                      className="w-full px-4 py-3 bg-[#2f3136] hover:bg-[#3a3d44] text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 border border-gray-700/50"
                      onClick={() => alert('Edit Border feature coming soon!')}
                    >
                      <div className="w-4 h-4 border-2 border-white rounded-full"></div>
                      <span>Edit Border</span>
                    </button>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                      Display Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 bg-[#2f3136] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] transition-colors"
                        placeholder="Display Name"
                        maxLength={32}
                      />
                      {editForm.name && (
                        <button
                          onClick={() => setEditForm({ ...editForm, name: '' })}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Pronouns */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                      Pronouns
                    </label>
                    <input
                      type="text"
                      value={editForm.pronouns}
                      onChange={(e) => setEditForm({ ...editForm, pronouns: e.target.value })}
                      className="w-full px-4 py-3 bg-[#2f3136] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] transition-colors"
                      placeholder="e.g., she/her, he/him, they/them"
                      maxLength={50}
                    />
                  </div>

                  {/* About Me */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                      About Me
                    </label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full px-4 py-3 bg-[#2f3136] border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#5865f2] transition-colors resize-none"
                      placeholder="Tell everyone a little bit about yourself"
                      rows={4}
                      maxLength={190}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {editForm.bio.length}/190
                    </p>
                  </div>

                  {/* Birthday */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                      Birthday
                    </label>
                    <input
                      type="date"
                      value={editForm.birthday}
                      onChange={(e) => setEditForm({ ...editForm, birthday: e.target.value })}
                      className="w-full px-4 py-3 bg-[#2f3136] border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-[#5865f2] transition-colors"
                    />
                  </div>

                  {/* Anniversary */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                      Anniversary Date
                    </label>
                    <input
                      type="date"
                      value={editForm.anniversary_date}
                      onChange={(e) => setEditForm({ ...editForm, anniversary_date: e.target.value })}
                      className="w-full px-4 py-3 bg-[#2f3136] border border-gray-700/50 rounded-lg text-white focus:outline-none focus:border-[#5865f2] transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
