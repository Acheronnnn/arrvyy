import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Plus, Heart, Image as ImageIcon, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import type { Memory } from '@/types'

interface MemoryTimelineProps {
  memories: Memory[]
  onAdd: () => void
  onView: (memory: Memory) => void
}

export function MemoryTimeline({ memories, onAdd, onView }: MemoryTimelineProps) {
  const sortedMemories = [...memories].sort(
    (a, b) => new Date(b.memory_date).getTime() - new Date(a.memory_date).getTime()
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Camera className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-bold text-gray-900">Memory Timeline</h3>
        </div>
        <button
          onClick={onAdd}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center hover:from-pink-600 hover:to-purple-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Memories Grid */}
      {sortedMemories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {sortedMemories.slice(0, 4).map((memory) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => onView(memory)}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
              >
                {memory.photo_url ? (
                  <img
                    src={memory.photo_url}
                    alt={memory.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="font-semibold text-sm truncate">{memory.title}</p>
                    <p className="text-xs opacity-90 flex items-center space-x-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>{format(new Date(memory.memory_date), 'MMM d, yyyy')}</span>
                    </p>
                  </div>
                </div>

                {/* Heart icon for favorite memories */}
                {memory.memory_date && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
          <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No memories yet</p>
          <p className="text-gray-400 text-xs mt-1">Add your first memory!</p>
        </div>
      )}

      {/* View All Button */}
      {sortedMemories.length > 4 && (
        <button
          onClick={() => onView(null as any)}
          className="w-full py-2 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors"
        >
          View All ({sortedMemories.length} memories)
        </button>
      )}
    </div>
  )
}

