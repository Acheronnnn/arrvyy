import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Type } from 'lucide-react'
import type { ImportantDate } from '@/types'

interface AddDateModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (date: Omit<ImportantDate, 'id' | 'created_at' | 'updated_at'>) => void
  editingDate?: ImportantDate | null
}

export function AddDateModal({ isOpen, onClose, onSave, editingDate }: AddDateModalProps) {
  const [title, setTitle] = useState(editingDate?.title || '')
  const [date, setDate] = useState(
    editingDate ? new Date(editingDate.date).toISOString().split('T')[0] : ''
  )
  const [type, setType] = useState<ImportantDate['type']>(editingDate?.type || 'custom')
  const [description, setDescription] = useState(editingDate?.description || '')
  const [color, setColor] = useState(editingDate?.color || '#6366f1')

  const colors = [
    '#6366f1', // indigo
    '#f472b6', // pink
    '#ec4899', // rose
    '#8b5cf6', // purple
    '#06b6d4', // cyan
    '#10b981', // emerald
    '#f59e0b', // amber
  ]

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
    setDate('')
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

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              placeholder="e.g., Our First Date"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Type
            </label>
            <div className="relative">
              <Type className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ImportantDate['type'])}
                className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none appearance-none"
              >
                <option value="custom">Custom</option>
                <option value="anniversary">Anniversary</option>
                <option value="birthday">Birthday</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none resize-none"
              placeholder="Add a note about this date..."
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Color
            </label>
            <div className="flex items-center space-x-1.5">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c ? 'border-gray-900 scale-110' : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center space-x-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 transition-colors"
            >
              {editingDate ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

