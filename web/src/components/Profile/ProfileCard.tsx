import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronRight, Plus, Eye, Lock, Upload, Camera, Sparkles, Edit2, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { useAuth } from '@/hooks/useAuth'
import { useGoogleDrive } from '@/hooks/useGoogleDrive'
import { supabase } from '@/lib/supabase'

// Helper function to get Google Drive thumbnail URL
function getDriveImageUrl(photoUrl: string | undefined | null): string | null {
  if (!photoUrl) {
    return null
  }
  
  // Extract file ID from various Google Drive URL formats:
  // Format 1: https://drive.google.com/uc?export=view&id=FILE_ID
  // Format 2: https://drive.google.com/file/d/FILE_ID/view
  // Format 3: https://drive.google.com/thumbnail?id=FILE_ID
  let fileId: string | null = null
  
  // Try format 1: ?id= or &id= (stop at &, ?, or end of string)
  const match1 = photoUrl.match(/[?&]id=([^&?]+)/)
  if (match1 && match1[1]) {
    fileId = match1[1].trim()
  } else {
    // Try format 2: /file/d/FILE_ID/ (stop at /, ?, &, or end of string)
    const match2 = photoUrl.match(/\/file\/d\/([^\/?&]+)/)
    if (match2 && match2[1]) {
      fileId = match2[1].trim()
    }
  }
  
  if (fileId) {
    // Clean file ID: remove any trailing query params that might have been captured
    const cleanedFileId = fileId.split('?')[0].split('&')[0].trim()
    // Use Google Drive thumbnail API for better reliability
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${cleanedFileId}&sz=w1000`
    return thumbnailUrl
  }
  
  // If URL doesn't match expected format, return as-is
  return photoUrl
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

export function ProfileCard() {
  const { user, fetchUserProfile } = useAuth()
  const { uploadPhoto, uploading: uploadingAvatar } = useGoogleDrive()
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view')
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [avatarKey, setAvatarKey] = useState(0) // Force re-render avatar
  const [customStatus, setCustomStatus] = useState('')
  const [bioColor, setBioColor] = useState('#6366f1') // Default indigo
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [editForm, setEditForm] = useState({
    display_name: '', // Display Name
    bio: '', // About Me
  })

  useEffect(() => {
    if (user) {
      setEditForm({
        display_name: (user as any).display_name || user.name || '', // Display Name
        bio: (user as any).bio || '', // About Me
      })
      // Avatar akan diambil langsung dari user.avatar_url
      // Load bio color from user profile (if exists)
      setBioColor((user as any).bio_color || '#6366f1')
    }
  }, [user])

  const handleAvatarUpload = async (file: File) => {
    if (!user) return
    
    try {
      // Upload photo to Google Drive
      const avatarUrl = await uploadPhoto(file)
      
      if (!avatarUrl) {
        throw new Error('Upload gagal: URL avatar tidak diterima')
      }
      
      // Update avatar_url in database
      const { error } = await (supabase
        .from('users') as any)
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)
        
      if (error) {
        console.error('Database update error:', error)
        throw new Error('Gagal menyimpan avatar: ' + (error.message || 'Database error'))
      }
      
      // Update local state immediately untuk preview
      // (fetchUserProfile mungkin ada delay)
      
      // Refresh user data to show updated avatar
      const updatedUser = await fetchUserProfile(user.id)
      
      // Force re-render avatar by updating key
      setAvatarKey(prev => prev + 1)
      
      // Wait a bit for Google Drive URL to be accessible
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Force another re-render after delay
      setAvatarKey(prev => prev + 1)
      
    } catch (error: any) {
      console.error('❌ Avatar upload error:', error)
      const errorMessage = error.message || 'Gagal mengupload avatar'
      alert('Error: ' + errorMessage)
      throw error // Re-throw untuk ditangani di handleFileSelect
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar')
      return
    }
    
    // Validate file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      alert('Ukuran gambar harus kurang dari 8MB')
      return
    }
    
    // Reset input untuk memungkinkan upload file yang sama lagi
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    
    // Upload avatar
    try {
      await handleAvatarUpload(file)
    } catch (error: any) {
      console.error('Upload error:', error)
      // Error sudah ditangani di handleAvatarUpload
    }
  }

  const handleRemoveAvatar = async () => {
    if (!user) return
    if (!confirm('Are you sure you want to remove your avatar?')) return
    try {
      const { error } = await (supabase
        .from('users') as any)
        .update({ avatar_url: null })
        .eq('id', user.id)
      if (error) throw error
      // Avatar akan di-refresh via fetchUserProfile
      await fetchUserProfile(user.id)
      setShowAvatarModal(false)
    } catch (error: any) {
      alert('Error removing avatar: ' + (error.message || 'Failed to remove'))
    }
  }

  const handleSave = async () => {
    if (!user) return
    try {
      setSaving(true)
      
      // Build updates object - hanya field yang ada di form edit
      const updates: any = {}
      
      // Display Name → display_name
      if (editForm.display_name !== undefined) {
        updates.display_name = editForm.display_name || null
      }
      
      // About Me → bio
      if (editForm.bio !== undefined) {
        updates.bio = editForm.bio || null
      }
      
      // Bio color
      if (bioColor) {
        updates.bio_color = bioColor
      }
      
      const { error } = await (supabase
        .from('users') as any)
        .update(updates)
        .eq('id', user.id)
        
      if (error) {
        // Check if error is about missing column
        if (error.message?.includes("Could not find the") && error.message?.includes("column") || 
            error.message?.includes("column") && error.message?.includes("does not exist")) {
          // Extract column name from error message
          const columnMatch = error.message.match(/Could not find the '(\w+)' column/) || 
                              error.message.match(/column "(\w+)"/) ||
                              error.message.match(/column '(\w+)'/)
          const columnName = columnMatch ? columnMatch[1] : 'kolom yang diperlukan'
          
          alert(`⚠️ Error: Kolom database belum ditambahkan!\n\nKolom yang hilang: ${columnName}\n\nSilakan jalankan SQL script di Supabase:\n1. Buka Supabase Dashboard → SQL Editor\n2. Jalankan script dari file: fix-profile-fields.sql\n3. Script akan menambahkan: display_name, bio, bio_color\n4. Refresh aplikasi setelah selesai\n\nLihat file CARA_JALANKAN_SQL.md untuk panduan lengkap.`)
          throw error
        }
        throw error
      }
      
      await fetchUserProfile(user.id)
      setActiveTab('view')
    } catch (error: any) {
      console.error('Save error:', error)
      if (!error.message?.includes('Kolom database belum ditambahkan')) {
        alert('Error updating profile: ' + (error.message || 'Failed to update'))
      }
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="w-full h-full bg-white/98 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/80">
      {/* View Tab - Dashboard Theme */}
      {activeTab === 'view' && (
        <div className="flex flex-col h-full bg-white/98 backdrop-blur-lg">
          {/* Header */}
          <div className="bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 backdrop-blur-lg border-b border-sky-100/80 p-3 md:p-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Profile</h2>
            <button
              onClick={() => setActiveTab('edit')}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              Edit
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
            {/* Avatar & Status */}
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-100">
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative">
                  {user.avatar_url ? (() => {
                    const avatarImageUrl = getDriveImageUrl(user.avatar_url)
                    const finalSrc = avatarImageUrl || user.avatar_url || ''
                    return (
                      <>
                        <img
                          key={`avatar-view-${avatarKey}-${user.avatar_url}`}
                          src={finalSrc}
                          alt="Avatar"
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            const currentSrc = target.src
                            const originalUrl = user.avatar_url
                            const convertedUrl = getDriveImageUrl(originalUrl)
                            
                            // Try original URL if converted URL failed
                            if (originalUrl && currentSrc !== originalUrl && currentSrc === convertedUrl) {
                              target.src = originalUrl
                              return
                            }
                            
                            // If original also failed, show fallback
                            target.style.display = 'none'
                            const fallback = target.nextElementSibling as HTMLElement
                            if (fallback) fallback.style.display = 'flex'
                          }}
                        />
                        <div className="w-20 h-20 bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg hidden">
                          {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                      </>
                    )
                  })() : (
                    <div className="w-20 h-20 bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
                      {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-4 border-white flex items-center justify-center shadow-md">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Display Name & Email */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{(user as any).display_name || user.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{user.email}</p>
                  
                  {/* Add Status Field */}
                  <button
                    onClick={() => {
                      const status = prompt('Enter your status:', customStatus || '')
                      if (status !== null) {
                        setCustomStatus(status)
                      }
                    }}
                    className="w-full px-4 py-2.5 bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-colors flex items-center space-x-2 text-left"
                  >
                    <Plus className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500 italic">
                      {customStatus || 'Best emoji to describe your day?'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Edit Profile Button */}
            <button
              onClick={() => setActiveTab('edit')}
              className="w-full py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2 shadow-lg"
            >
              <Edit2 className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>

            {/* About Me - with custom color */}
            <div className="rounded-2xl p-4 border" style={{ backgroundColor: `${(user as any).bio_color || bioColor || '#6366f1'}15`, borderColor: `${(user as any).bio_color || bioColor || '#6366f1'}40` }}>
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">About Me</h4>
              <p className="text-sm text-gray-700">
                {(user as any).bio || 'No bio set. Click Edit to add one!'}
              </p>
            </div>

            {/* Member Since */}
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-100">
              <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Member Since</h4>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-sky-400 to-cyan-400 rounded"></div>
                <p className="text-sm text-gray-700 font-medium">
                  {user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Tab - Dashboard Theme with Banner */}
      {activeTab === 'edit' && (
        <div className="flex flex-col h-full bg-white/98 backdrop-blur-lg">
          {/* Header */}
          <div className="bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 backdrop-blur-lg border-b border-sky-100/80 p-3 md:p-4 flex items-center justify-between">
            <button 
              onClick={() => setActiveTab('view')} 
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-lg font-bold text-gray-900">Edit Profile</h2>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:from-sky-600 hover:to-cyan-600 ${
                saving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
            {/* Profile Picture Section */}
            <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-100">
              <div className="flex items-start space-x-4">
                {/* Profile Picture */}
                <div className="relative">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingAvatar}
                    className="relative group"
                  >
                    {user.avatar_url ? (() => {
                      const avatarImageUrl = getDriveImageUrl(user.avatar_url)
                      const finalSrc = avatarImageUrl || user.avatar_url || ''
                      return (
                        <>
                          <img
                            key={`avatar-edit-${avatarKey}-${user.avatar_url}`}
                            src={finalSrc}
                            alt="Avatar"
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              const currentSrc = target.src
                              const originalUrl = user.avatar_url
                              const convertedUrl = getDriveImageUrl(originalUrl)
                              
                              // Try original URL if converted URL failed
                              if (originalUrl && currentSrc !== originalUrl && currentSrc === convertedUrl) {
                                target.src = originalUrl
                                return
                              }
                              
                              // If original also failed, show fallback
                              target.style.display = 'none'
                              const fallback = target.nextElementSibling as HTMLElement
                              if (fallback) fallback.style.display = 'flex'
                            }}
                          />
                          <div className="w-20 h-20 bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg hidden">
                            {(editForm.display_name || user.name || user.email || 'U').charAt(0).toUpperCase()}
                          </div>
                        </>
                      )
                    })() : (
                      <div className="w-20 h-20 bg-gradient-to-br from-sky-400 via-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold text-2xl border-4 border-white shadow-lg">
                        {(editForm.display_name || user.name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Edit Icon Overlay */}
                    <div className="absolute top-0 right-0 w-7 h-7 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full flex items-center justify-center border-2 border-white shadow-md group-hover:from-sky-600 group-hover:to-cyan-600 transition-colors">
                      {uploadingAvatar ? (
                        <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                      ) : (
                        <Camera className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{editForm.display_name || (user as any).display_name || user.name}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="px-4 pb-6 space-y-4">
              {/* Display Name */}
              <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-100">
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <Edit2 className="w-4 h-4 text-indigo-500" />
                  <span>Display Name</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={editForm.display_name}
                    onChange={(e) => {
                      if (e.target.value.length <= 32) {
                        setEditForm({ ...editForm, display_name: e.target.value })
                      }
                    }}
                    placeholder="Display Name"
                    className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none transition-colors"
                    maxLength={32}
                  />
                  {editForm.display_name && (
                    <button
                      onClick={() => setEditForm({ ...editForm, display_name: '' })}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {editForm.display_name.length}/32
                </p>
              </div>

              {/* About Me with Color Picker */}
              <div className="rounded-2xl p-4 border w-full" style={{ backgroundColor: `${bioColor}15`, borderColor: `${bioColor}40` }}>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-bold text-gray-900">
                    About Me
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-600">Color:</span>
                    <input
                      type="color"
                      value={bioColor}
                      onChange={(e) => setBioColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-2 border-gray-200 cursor-pointer"
                      title="Choose bio background color"
                    />
                  </div>
                </div>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => {
                    if (e.target.value.length <= 190) {
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                  }}
                  placeholder="Tell everyone a little bit about yourself..."
                  className="w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none resize-none transition-colors"
                  rows={4}
                  maxLength={190}
                />
                <p className="text-xs text-gray-500 mt-2 text-right">
                  {editForm.bio.length}/190
                </p>
              </div>

              {/* Avatar Decoration */}
              <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-100 w-full">
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-sky-500" />
                  <span>Avatar Decoration</span>
                </label>
                <button
                  onClick={() => alert('Avatar Decoration feature coming soon!')}
                  className="w-full px-4 py-3 bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <X className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-gray-700 font-medium">None</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Border */}
              <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-4 border border-sky-100 w-full">
                <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-purple-500 rounded-full"></div>
                  <span>Border</span>
                </label>
                <button
                  onClick={() => alert('Border feature coming soon!')}
                  className="w-full px-4 py-3 bg-white/80 hover:bg-white border border-gray-200 rounded-lg transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center">
                      <X className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-gray-700 font-medium">None</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Modal - Gambar 2 Style */}
      <AnimatePresence>
        {showAvatarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end"
            onClick={() => setShowAvatarModal(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="w-full bg-[#2f3136] rounded-t-3xl p-6 space-y-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Avatar</h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-2 -mr-2"
                >
                  <X className="w-6 h-6 text-gray-300" />
                </button>
              </div>

              {/* Upload Image */}
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Upload Image</h4>
                <p className="text-xs text-gray-400 mb-4">
                  Upload a PNG or JPG under 8MB. Images should be at least 128x128.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="w-full px-4 py-3 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Upload className="w-5 h-5" />
                  <span>{uploadingAvatar ? 'Uploading...' : 'Choose File'}</span>
                </button>
              </div>

              {/* Get Animated Avatars */}
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <h4 className="text-sm font-semibold text-white">Get Animated Avatars</h4>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  Upload GIFs to animate your avatars! Only with Nitro.
                </p>
                <button className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2">
                  <Lock className="w-5 h-5" />
                  <span>Unlock with Nitro</span>
                </button>
              </div>

              {/* Change Decoration */}
              <button
                className="w-full px-4 py-3 bg-[#2f3136] hover:bg-[#3a3d44] text-white rounded-lg transition-colors text-left"
              >
                Change Decoration
              </button>

              {/* Remove Avatar */}
              <button
                onClick={handleRemoveAvatar}
                className="w-full px-4 py-3 bg-[#2f3136] hover:bg-red-600/20 text-red-500 rounded-lg transition-colors text-left"
              >
                Remove Avatar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

