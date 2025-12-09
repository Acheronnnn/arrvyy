import { motion } from 'framer-motion'
import { Smile, Frown, Heart, Zap, Wind, Coffee, AlertCircle } from 'lucide-react'
import { format, isToday } from 'date-fns'
import type { MoodEntry } from '@/types'

interface MoodTrackerProps {
  todayMood: MoodEntry | null
  recentMoods: MoodEntry[]
  onSetMood: (mood: MoodEntry['mood']) => void
}

const moodConfig: Record<MoodEntry['mood'], { icon: any; color: string; label: string }> = {
  happy: { icon: Smile, color: 'from-yellow-400 to-orange-400', label: 'Happy' },
  sad: { icon: Frown, color: 'from-blue-400 to-indigo-400', label: 'Sad' },
  excited: { icon: Zap, color: 'from-purple-400 to-pink-400', label: 'Excited' },
  calm: { icon: Wind, color: 'from-green-400 to-teal-400', label: 'Calm' },
  love: { icon: Heart, color: 'from-pink-400 to-rose-400', label: 'In Love' },
  tired: { icon: Coffee, color: 'from-gray-400 to-slate-400', label: 'Tired' },
  anxious: { icon: AlertCircle, color: 'from-red-400 to-orange-400', label: 'Anxious' },
}

export function MoodTracker({ todayMood, recentMoods, onSetMood }: MoodTrackerProps) {
  const moods: MoodEntry['mood'][] = ['happy', 'excited', 'love', 'calm', 'sad', 'tired', 'anxious']

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2">
        <Heart className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-bold text-gray-900">Today's Mood</h3>
      </div>

      {/* Today's Mood Display */}
      {todayMood ? (() => {
        const config = moodConfig[todayMood.mood]
        const IconComponent = config.icon
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`p-4 rounded-xl bg-gradient-to-r ${config.color} text-white`}
          >
            <div className="flex items-center space-x-3">
              {IconComponent && (
                <IconComponent className="w-8 h-8" />
              )}
              <div className="flex-1">
                <p className="font-bold text-lg">{config.label}</p>
                {todayMood.note && (
                  <p className="text-sm opacity-90 mt-1">{todayMood.note}</p>
                )}
              </div>
            </div>
          </motion.div>
        )
      })() : (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
          <p className="text-gray-500 text-sm">How are you feeling today?</p>
        </div>
      )}

      {/* Mood Selector */}
      <div className="grid grid-cols-7 gap-2">
        {moods.map((mood) => {
          const config = moodConfig[mood]
          const Icon = config.icon
          const isSelected = todayMood?.mood === mood

          return (
            <motion.button
              key={mood}
              onClick={() => onSetMood(mood)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={`p-3 rounded-xl transition-all ${
                isSelected
                  ? `bg-gradient-to-br ${config.color} text-white shadow-lg`
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              }`}
              title={config.label}
            >
              <Icon className="w-5 h-5 mx-auto" />
            </motion.button>
          )
        })}
      </div>

      {/* Recent Moods */}
      {recentMoods.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Recent Moods</h4>
          <div className="flex items-center space-x-2">
            {recentMoods.slice(0, 7).map((mood) => {
              const config = moodConfig[mood.mood]
              const Icon = config.icon
              const isTodayMood = isToday(new Date(mood.mood_date))

              return (
                <div
                  key={mood.id}
                  className={`w-10 h-10 rounded-full bg-gradient-to-br ${config.color} flex items-center justify-center ${
                    isTodayMood ? 'ring-2 ring-purple-400' : ''
                  }`}
                  title={`${config.label} - ${format(new Date(mood.mood_date), 'MMM d')}`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

