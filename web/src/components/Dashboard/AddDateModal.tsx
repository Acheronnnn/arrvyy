import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ImportantDate } from '@/types'

// Helper function untuk format Date ke yyyy-MM-dd tanpa timezone issues
const formatDateForInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

interface AddDateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (date: Omit<ImportantDate, 'id' | 'created_at' | 'updated_at'>) => void
  editingDate?: ImportantDate | null
  initialDate?: Date | null
}

export function AddDateModal({ isOpen, onClose, onSave, editingDate, initialDate }: AddDateModalProps) {
  const [title, setTitle] = useState(editingDate?.title || '')
  const [date, setDate] = useState(
    editingDate 
      ? formatDateForInput(new Date(editingDate.date))
      : initialDate
        ? formatDateForInput(initialDate)
        : ''
  )
  const [type, setType] = useState<ImportantDate['type']>(editingDate?.type || 'custom')
  const [description, setDescription] = useState(editingDate?.description || '')
  const [color, setColor] = useState(editingDate?.color || '#6366f1')

  // Update state ketika modal dibuka dengan initialDate atau editingDate baru
  useEffect(() => {
    if (isOpen) {
      if (editingDate) {
        // Edit mode - isi semua field dari editingDate
        setTitle(editingDate.title)
        setDate(formatDateForInput(new Date(editingDate.date)))
        setType(editingDate.type)
        setDescription(editingDate.description || '')
        setColor(editingDate.color || '#6366f1')
      } else if (initialDate) {
        // Add mode dari calendar - isi tanggal saja
        setTitle('')
        setDate(formatDateForInput(initialDate))
        setType('custom')
        setDescription('')
        setColor('#6366f1')
      } else {
        // Add mode manual - reset semua
        setTitle('')
        setDate('')
        setType('custom')
        setDescription('')
        setColor('#6366f1')
      }
    }
  }, [isOpen, editingDate, initialDate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !date) return

    onSave({
      user_id: editingDate?.user_id || '',
      title,
      date,
      type,
      is_pinned: editingDate?.is_pinned || false,
      description,
      color,
    })
    
    // Reset form
    setTitle('')
    setDate(initialDate ? formatDateForInput(initialDate) : '')
    setType('custom')
    setDescription('')
    setColor('#6366f1')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-4 my-auto"
        style={{ maxHeight: '85vh', overflowY: 'auto' }}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">
            {editingDate ? 'Edit Date' : 'Add Important Date'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title - Only visible field */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
              className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              placeholder="e.g., Our First Date"
            />
          </div>

          {/* Hidden fields - Date, Type, Description, Color tetap digunakan dengan default values */}
          {/* Date: dari initialDate atau editingDate.date */}
          {/* Type: default 'custom' */}
          {/* Description: default '' */}
          {/* Color: default '#6366f1' */}

          {/* Buttons */}
          <div className="flex items-center space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2.5 text-sm bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2.5 text-sm bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-sky-600 hover:to-cyan-600 transition-colors"
            >
              {editingDate ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

