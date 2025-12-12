import { motion } from 'framer-motion'
import { Flame, MessageCircle, Heart, Activity } from 'lucide-react'
import type { Streak } from '@/types'

interface StreakCounterProps {
  streaks: Streak[]
}

const streakConfig: Record<Streak['streak_type'], { icon: any; label: string; color: string }> = {
  chat: { icon: MessageCircle, label: 'Chat', color: 'from-blue-400 to-cyan-400' },
  activity: { icon: Activity, label: 'Activity', color: 'from-sky-400 to-blue-400' },
  love_note: { icon: Heart, label: 'Love Notes', color: 'from-sky-400 to-cyan-400' },
}

export function StreakCounter({ streaks }: StreakCounterProps) {
  const totalStreak = streaks.reduce((sum, s) => sum + s.current_streak, 0)
  const longestStreak = Math.max(...streaks.map((s) => s.longest_streak), 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Flame className="w-5 h-5 text-sky-500" />
        <h3 className="text-lg font-bold text-gray-900">Streaks</h3>
      </div>

      {/* Total Streak */}
      <div className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl p-4 border border-sky-100">
        <div className="text-center">
          <motion.div
            key={totalStreak}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-1"
          >
            <span className="text-3xl font-bold text-sky-600">{totalStreak}</span>
          </motion.div>
          <p className="text-sm font-semibold text-gray-700">Total Streak</p>
          <p className="text-xs text-gray-500 mt-1">Longest: {longestStreak} days</p>
        </div>
      </div>

      {/* Individual Streaks */}
      <div className="grid grid-cols-3 gap-3">
        {streaks.map((streak) => {
          const config = streakConfig[streak.streak_type]
          const Icon = config.icon

          return (
            <motion.div
              key={streak.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl bg-gradient-to-br ${config.color} text-white`}
            >
              <div className="flex items-center justify-center mb-2">
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold">{streak.current_streak}</p>
                <p className="text-xs opacity-90">{config.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {streaks.length === 0 && (
        <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200">
          <Flame className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No streaks yet</p>
          <p className="text-gray-400 text-xs mt-1">Start chatting to build your streak!</p>
        </div>
      )}
    </div>
  )
}

