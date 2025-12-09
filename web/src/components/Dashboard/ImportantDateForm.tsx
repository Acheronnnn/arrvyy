import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Calendar, Type, Palette } from 'lucide-react'
import type { ImportantDate } from '@/types'

interface ImportantDateFormProps {
  date?: ImportantDate | null
  onSave: (data: Omit<ImportantDate, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
}

export function ImportantDateForm({ date, onSave, onCancel }: ImportantDateFormProps) {
  const [title, setTitle] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [type, setType] = useState<'anniversary' | 'birthday' | 'custom' | 'milestone'>('custom')
  const [description, setDescription] = useState('')
  const [isPinned, setIsPinned] = useState(false)
  const [color, setColor] = useState('#6366f1')

  const colors = [
    '#6366f1', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#ef4444', // Red
  ]

  useEffect(() => {
    if (date) {
      setTitle(date.title)
      setSelectedDate(date.date.split('T')[0]) // Convert to YYYY-MM-DD
      setType(date.type)
      setDescription(date.description || '')
      setIsPinned(date.is_pinned)
      setColor(date.color || '#6366f1')
    } else {
      // Set default date to today
      setSelectedDate(new Date().toISOString().split('T')[0])
    }
  }, [date])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !selectedDate) return

    onSave({
      user_id: '', // Will be set by parent
      title,
      date: selectedDate,
      type,
      is_pinned: isPinned,
      description: description || undefined,
      color,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {date ? 'Edit Important Date' : 'Add Important Date'}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-gray-900"
                placeholder="e.g., First Date, Valentine's Day"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-gray-900"
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-gray-900"
            >
              <option value="custom">Custom</option>
              <option value="anniversary">Anniversary</option>
              <option value="birthday">Birthday</option>
              <option value="milestone">Milestone</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition text-gray-900 resize-none"
              placeholder="Add a note about this special day..."
            />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    color === c ? 'border-gray-900 scale-110' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Pin Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="pin"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
            />
            <label htmlFor="pin" className="text-sm text-gray-700 cursor-pointer">
              Pin this date (show in calendar)
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg"
            >
              {date ? 'Update' : 'Add'} Date
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

