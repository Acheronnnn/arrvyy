import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

interface CountdownTimerProps {
  targetDate: Date
  label: string
}

export function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Heart className="w-5 h-5 text-pink-500" />
        <h3 className="text-lg font-bold text-gray-900">{label}</h3>
      </div>
      <div className="flex items-center space-x-2">
        <motion.div
          key={timeLeft.days}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex flex-col items-center justify-center border-2 border-white shadow-md"
        >
          <span className="text-lg font-bold text-gray-900">{timeLeft.days}</span>
          <span className="text-xs text-gray-600">DAYS</span>
        </motion.div>
        <motion.div
          key={timeLeft.hours}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex flex-col items-center justify-center border-2 border-white shadow-md"
        >
          <span className="text-lg font-bold text-gray-900">{timeLeft.hours}</span>
          <span className="text-xs text-gray-600">HOURS</span>
        </motion.div>
        <motion.div
          key={timeLeft.minutes}
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex flex-col items-center justify-center border-2 border-white shadow-md"
        >
          <span className="text-lg font-bold text-gray-900">{timeLeft.minutes}</span>
          <span className="text-xs text-gray-600">MIN</span>
        </motion.div>
      </div>
    </div>
  )
}
