import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cake, Gift } from 'lucide-react'
import { format, differenceInDays, addYears, isToday } from 'date-fns'

interface BirthdayCardProps {
  name: string
  birthday: Date
  isPartner?: boolean
}

export function BirthdayCard({ name, birthday, isPartner = false }: BirthdayCardProps) {
  const [nextBirthday, setNextBirthday] = useState<Date>(new Date())
  const [daysUntil, setDaysUntil] = useState(0)

  useEffect(() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    let nextBday = new Date(currentYear, birthday.getMonth(), birthday.getDate())

    if (nextBday < today) {
      nextBday = addYears(nextBday, 1)
    }

    setNextBirthday(nextBday)
    setDaysUntil(differenceInDays(nextBday, today))
  }, [birthday])

  const isTodayBirthday = isToday(nextBirthday)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-2xl ${
        isPartner
          ? 'bg-gradient-to-br from-purple-50 to-pink-50'
          : 'bg-gradient-to-br from-blue-50 to-cyan-50'
      } border border-white/50`}
    >
      <div className="flex items-center space-x-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isPartner
              ? 'bg-gradient-to-br from-purple-400 to-pink-400'
              : 'bg-gradient-to-br from-blue-400 to-cyan-400'
          }`}
        >
          <Cake className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{name}'s Birthday</p>
          <p className="text-sm text-gray-600">
            {format(birthday, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="text-right">
          {isTodayBirthday ? (
            <div className="flex items-center space-x-1 text-pink-600">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-bold">Today!</span>
            </div>
          ) : (
            <div>
              <p className="text-2xl font-bold text-gray-900">{daysUntil}</p>
              <p className="text-xs text-gray-600">days left</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
