import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Calendar, Sparkles } from 'lucide-react'
import { differenceInDays, format } from 'date-fns'

interface DaysTogetherCounterProps {
  anniversaryDate: Date | null
}

export function DaysTogetherCounter({ anniversaryDate }: DaysTogetherCounterProps) {
  const [daysTogether, setDaysTogether] = useState(0)
  const [years, setYears] = useState(0)
  const [months, setMonths] = useState(0)
  const [days, setDays] = useState(0)

  useEffect(() => {
    if (!anniversaryDate) return

    const calculateTimeTogether = () => {
      const today = new Date()
      const totalDays = differenceInDays(today, anniversaryDate)
      
      setDaysTogether(totalDays)
      
      // Calculate years, months, and days
      let remainingDays = totalDays
      const calculatedYears = Math.floor(remainingDays / 365)
      remainingDays = remainingDays % 365
      const calculatedMonths = Math.floor(remainingDays / 30)
      remainingDays = remainingDays % 30
      
      setYears(calculatedYears)
      setMonths(calculatedMonths)
      setDays(remainingDays)
    }

    calculateTimeTogether()
    const interval = setInterval(calculateTimeTogether, 1000 * 60 * 60) // Update every hour

    return () => clearInterval(interval)
  }, [anniversaryDate])

  if (!anniversaryDate) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-cyan-50 rounded-2xl p-6 border border-sky-100">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Set your anniversary date</p>
          <p className="text-gray-400 text-xs mt-1">to see how long you've been together</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 rounded-2xl p-6 border border-sky-100 relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 15 }).map((_, i) => (
          <Heart
            key={i}
            className="absolute w-8 h-8 text-sky-400"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Days Together</h3>
              <p className="text-xs text-gray-600">
                Since {format(anniversaryDate, 'MMM d, yyyy')}
              </p>
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-sky-400" />
        </div>

        {/* Main Counter */}
        <div className="text-center mb-4">
          <motion.div
            key={daysTogether}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-2"
          >
            <span className="text-5xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              {daysTogether.toLocaleString()}
            </span>
          </motion.div>
          <p className="text-sm font-semibold text-gray-700">Days of Love</p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/60 rounded-xl p-3 text-center backdrop-blur-sm">
            <motion.div
              key={years}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-sky-600"
            >
              {years}
            </motion.div>
            <p className="text-xs text-gray-600 mt-1">Years</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center backdrop-blur-sm">
            <motion.div
              key={months}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-blue-600"
            >
              {months}
            </motion.div>
            <p className="text-xs text-gray-600 mt-1">Months</p>
          </div>
          <div className="bg-white/60 rounded-xl p-3 text-center backdrop-blur-sm">
            <motion.div
              key={days}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-2xl font-bold text-cyan-600"
            >
              {days}
            </motion.div>
            <p className="text-xs text-gray-600 mt-1">Days</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

