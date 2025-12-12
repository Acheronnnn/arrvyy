import { motion, AnimatePresence } from 'framer-motion'
import { Pin, PinOff, Calendar, Heart, Cake, Star, X } from 'lucide-react'
import { format, differenceInDays, isPast, addYears } from 'date-fns'
import type { ImportantDate } from '@/types'

interface ImportantDatesListProps {
  dates: ImportantDate[]
  currentMonth?: Date
  onTogglePin: (id: string) => void
  onDelete: (id: string) => void
  onDateClick?: (date: ImportantDate) => void
}

export function ImportantDatesList({
  dates,
  currentMonth,
  onTogglePin,
  onDelete,
  onDateClick,
}: ImportantDatesListProps) {
  // Filter dates berdasarkan currentMonth jika ada
  const filteredDates = currentMonth
    ? dates.filter((d) => {
        const date = new Date(d.date)
        return (
          date.getMonth() === currentMonth.getMonth() &&
          date.getFullYear() === currentMonth.getFullYear()
        )
      })
    : dates

  const pinnedDates = filteredDates.filter((d) => d.is_pinned).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )
  const unpinnedDates = filteredDates.filter((d) => !d.is_pinned).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const getDateIcon = (type: string) => {
    switch (type) {
      case 'anniversary':
        return <Heart className="w-4 h-4" />
      case 'birthday':
        return <Cake className="w-4 h-4" />
      case 'milestone':
        return <Star className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const getDaysUntil = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 0
      
      const today = new Date()
      let targetDate = new Date(today.getFullYear(), date.getMonth(), date.getDate())
      
      if (targetDate < today) {
        targetDate = addYears(targetDate, 1)
      }
      
      return differenceInDays(targetDate, today)
    } catch {
      return 0
    }
  }

  const renderDateCard = (date: ImportantDate) => {
    const daysUntil = getDaysUntil(date.date)
    const isPastDate = isPast(new Date(date.date))

    return (
      <motion.div
        key={date.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        onClick={() => onDateClick?.(date)}
        className="p-3 rounded-xl bg-white/80 border border-white/50 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
      >
        <div className="flex items-center space-x-3 flex-1">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: date.color || '#6366f1' }}
          >
            {getDateIcon(date.type)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">{date.title}</p>
            <p className="text-xs text-gray-600">
              {format(new Date(date.date), 'MMM d, yyyy')}
              {!isPastDate && ` • ${daysUntil} days left`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onTogglePin(date.id)}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            title={date.is_pinned ? 'Unpin' : 'Pin'}
          >
            {date.is_pinned ? (
              <Pin className="w-4 h-4 text-sky-600" />
            ) : (
              <PinOff className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <button
            onClick={() => onDelete(date.id)}
            className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 flex items-center justify-center transition-colors"
            title="Delete"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Pinned Dates */}
      {pinnedDates.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
            <Pin className="w-4 h-4 text-sky-600" />
            <span>Pinned</span>
          </h4>
          <div className="space-y-2">
            <AnimatePresence>
              {pinnedDates.map(renderDateCard)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Other Dates */}
      {unpinnedDates.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Upcoming</h4>
          <div className="space-y-2">
            <AnimatePresence>
              {unpinnedDates.map(renderDateCard)}
            </AnimatePresence>
          </div>
        </div>
      )}

      {filteredDates.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            {currentMonth ? 'No important dates this month' : 'No important dates yet'}
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {currentMonth ? 'Click a date on the calendar to add one' : 'Add one to get started!'}
          </p>
        </div>
      )}
    </div>
  )
}
