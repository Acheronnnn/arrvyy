import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ImportantDate } from '@/types'

interface MiniCalendarProps {
  importantDates: ImportantDate[]
  onDateClick?: (date: Date, existingDate?: ImportantDate | null) => void
  onMonthChange?: (month: Date) => void
}

export function MiniCalendar({ importantDates, onDateClick, onMonthChange }: MiniCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get first day of week untuk month start
  const firstDayOfWeek = monthStart.getDay()
  const emptyDays = Array(firstDayOfWeek).fill(null)

  const getDateType = (date: Date): ImportantDate | null => {
    try {
      return importantDates.find((d) => {
        try {
          return isSameDay(new Date(d.date), date)
        } catch {
          return false
        }
      }) || null
    } catch {
      return null
    }
  }

  const prevMonth = () => {
    const newMonth = subMonths(currentMonth, 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }
  
  const nextMonth = () => {
    const newMonth = addMonths(currentMonth, 1)
    setCurrentMonth(newMonth)
    onMonthChange?.(newMonth)
  }

  return (
    <div className="bg-white/50 rounded-2xl p-4 border border-white/50">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-700" />
        </button>
        <h3 className="text-lg font-bold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={nextMonth}
          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        {daysInMonth.map((day) => {
          const dateType = getDateType(day)
          const isToday = isSameDay(day, new Date())

          return (
            <motion.button
              key={day.toISOString()}
              onClick={() => onDateClick?.(day, dateType)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`aspect-square rounded-lg text-sm font-medium transition-colors relative ${
                isToday
                  ? 'bg-sky-500 text-white'
                  : dateType
                  ? dateType.is_pinned
                    ? 'bg-sky-200 text-sky-900'
                    : 'bg-sky-100 text-sky-900'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
              title={dateType?.title || 'Click to add important date'}
            >
              {format(day, 'd')}
              {dateType?.is_pinned && (
                <span className="absolute top-0.5 right-0.5 text-[8px]">📍</span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
