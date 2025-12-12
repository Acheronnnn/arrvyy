import { useState, useEffect } from 'react'
import { X, Heart, Lock } from 'lucide-react'
import { useLoveNotes } from '@/hooks/useLoveNotes'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'

interface AddLoveNoteModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddLoveNoteModal({ isOpen, onClose }: AddLoveNoteModalProps) {
  const { user } = useAuth()
  const { addNote } = useLoveNotes(user?.id)
  
  const [content, setContent] = useState('')
  const [isSecret, setIsSecret] = useState(false)
  const [color, setColor] = useState('#f472b6')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)

  // Fetch partner ID
  useEffect(() => {
    const fetchPartner = async () => {
      if (!user) return

      try {
        // Try partner_id first
        if (user.partner_id) {
          setPartnerId(user.partner_id)
          return
        }

        // Fallback: find another user
        const { data: partnerData } = await supabase
          .from('users')
          .select('id')
          .neq('id', user.id)
          .limit(1)
          .maybeSingle()

        if (partnerData) {
          setPartnerId(partnerData.id)
        }
      } catch (err) {
        console.error('Error fetching partner:', err)
      }
    }

    if (isOpen && user) {
      fetchPartner()
    }
  }, [isOpen, user])

  const colors = [
    '#f472b6', // pink
    '#ec4899', // rose
    '#f43f5e', // red
    '#fb7185', // rose-400
    '#f97316', // orange
    '#fbbf24', // amber
    '#a855f7', // purple
    '#8b5cf6', // violet
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Wait for partner ID if still loading
      if (!partnerId) {
        // Try to fetch partner one more time
        if (user?.partner_id) {
          setPartnerId(user.partner_id)
        } else {
          const { data: partnerData } = await supabase
            .from('users')
            .select('id')
            .neq('id', user!.id)
            .limit(1)
            .maybeSingle()

          if (partnerData) {
            setPartnerId(partnerData.id)
          } else {
            throw new Error('Partner not found. Please ensure there are 2 users in the system.')
          }
        }
      }

      const finalPartnerId = partnerId || user?.partner_id
      if (!finalPartnerId) {
        throw new Error('Partner not found. Please ensure there are 2 users in the system.')
      }

      await addNote({
        content: content.trim(),
        receiver_id: finalPartnerId,
        is_secret: isSecret,
        color: color,
      })

      // Reset form
      setContent('')
      setIsSecret(false)
      setColor('#f472b6')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add love note')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-2">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs mx-auto max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold text-gray-900">Add Love Note</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-2.5 space-y-2.5">
          {/* Content */}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your love note..."
              rows={3}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
              required
            />
          </div>

          {/* Secret Toggle */}
          <div className="flex items-center space-x-1.5">
            <input
              type="checkbox"
              id="secret"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
              className="w-3.5 h-3.5 text-sky-500 border-gray-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="secret" className="flex items-center space-x-1 text-[10px] text-gray-700 cursor-pointer">
              <Lock className="w-3 h-3" />
              <span>Secret note</span>
            </label>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex items-center space-x-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${
                    color === c
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-1.5 bg-red-50 border border-red-200 rounded-md text-red-600 text-[10px]">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-xs rounded-md hover:from-sky-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send Love Note'}
          </button>
        </form>
      </div>
    </div>
  )
}

