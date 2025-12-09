import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, Lock, Mail, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import type { LoveNote } from '@/types'

interface LoveNotesProps {
  notes: LoveNote[]
  onAdd: () => void
  onView: (note: LoveNote) => void
}

export function LoveNotes({ notes, onAdd, onView }: LoveNotesProps) {
  const unreadCount = notes.filter((n) => !n.is_read).length
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-pink-500" />
          <h3 className="text-lg font-bold text-gray-900">Love Notes</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-pink-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white flex items-center justify-center hover:from-pink-600 hover:to-rose-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Notes List */}
      {recentNotes.length > 0 ? (
        <div className="space-y-2">
          <AnimatePresence>
            {recentNotes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onClick={() => onView(note)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  note.is_read
                    ? 'bg-white/60 border border-gray-200'
                    : 'bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-200'
                } hover:shadow-md`}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: note.color || '#f472b6' }}
                  >
                    {note.is_secret ? (
                      <Lock className="w-5 h-5 text-white" />
                    ) : (
                      <Heart className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {note.is_secret && (
                        <Lock className="w-3 h-3 text-gray-500" />
                      )}
                      {!note.is_read && (
                        <Sparkles className="w-3 h-3 text-pink-500" />
                      )}
                      <span className="text-xs text-gray-500">
                        {format(new Date(note.created_at), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900 line-clamp-2">
                      {note.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
          <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No love notes yet</p>
          <p className="text-gray-400 text-xs mt-1">Send your first love note!</p>
        </div>
      )}

      {/* View All Button */}
      {notes.length > 3 && (
        <button
          onClick={() => onView(null as any)}
          className="w-full py-2 text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
        >
          View All ({notes.length} notes)
        </button>
      )}
    </div>
  )
}

