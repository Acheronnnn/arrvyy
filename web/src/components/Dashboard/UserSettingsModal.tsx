import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

export function UserSettingsModal({ isOpen, onClose, onUpdate }: UserSettingsModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [anniversaryDate, setAnniversaryDate] = useState('')
  const [birthday, setBirthday] = useState('')
  const [partnerBirthday, setPartnerBirthday] = useState('')

  useEffect(() => {
    if (user && isOpen) {
      // Set default dates if not set
      setAnniversaryDate(user.anniversary_date || '2025-09-04')
      setBirthday(user.birthday || '2004-10-23')
      setPartnerBirthday(user.partner_birthday || '2005-04-17')
    }
  }, [user, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)
      const { error } = await supabase
        .from('users')
        .update({
          anniversary_date: anniversaryDate || null,
          birthday: birthday || null,
          partner_birthday: partnerBirthday || null,
        })
        .eq('id', user.id)

      if (error) throw error
      
      onUpdate()
      onClose()
    } catch (error: any) {
      alert('Error updating profile: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 my-auto"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Update Profile</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Anniversary Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anniversary Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Your Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your Birthday
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Partner Birthday */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Partner's Birthday
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={partnerBirthday}
                onChange={(e) => setPartnerBirthday(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-xl font-semibold hover:from-sky-600 hover:to-cyan-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

