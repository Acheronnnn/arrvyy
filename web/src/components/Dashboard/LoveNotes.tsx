import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, Lock, Mail, Sparkles, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { LoveNote } from '@/types'

interface LoveNotesProps {
  notes: LoveNote[]
  onAdd: () => void
  onView: (note: LoveNote) => void
  onDelete?: (id: string) => void
}

export function LoveNotes({ notes, onAdd, onView, onDelete }: LoveNotesProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const unreadCount = notes.filter((n) => !n.is_read).length
  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  console.log('💌 LoveNotes render - notes count:', notes.length, 'recentNotes:', recentNotes.length)

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    e.preventDefault()
    
    console.log('🗑️ handleDelete called for note:', noteId)
    console.log('🗑️ onDelete available:', !!onDelete)
    
    if (!onDelete) {
      console.error('❌ onDelete function not provided')
      alert('Delete function not available')
      return
    }
    
    if (confirm('Are you sure you want to delete this love note?')) {
      setDeletingId(noteId)
      try {
        console.log('🗑️ Calling onDelete...')
        await onDelete(noteId)
        console.log('✅ Delete successful')
      } catch (error: any) {
        console.error('❌ Delete failed:', error)
        alert(`Failed to delete: ${error.message || 'Unknown error'}`)
      } finally {
        setDeletingId(null)
      }
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-sky-500" />
          <h3 className="text-lg font-bold text-gray-900">Love Notes</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-sky-500 text-white text-xs font-bold rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onAdd}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white flex items-center justify-center hover:from-sky-600 hover:to-cyan-600 transition-colors"
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
                className={`p-4 rounded-xl cursor-pointer transition-all relative group ${
                  note.is_read
                    ? 'bg-white/60 border border-gray-200'
                    : 'bg-gradient-to-r from-sky-50 to-cyan-50 border-2 border-sky-200'
                } hover:shadow-md`}
              >
                {/* Delete Button */}
                {onDelete && (
                  <button
                    onClick={(e) => handleDelete(e, note.id)}
                    disabled={deletingId === note.id}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 z-10"
                    title="Delete love note"
                  >
                    {deletingId === note.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-white" />
                    )}
                  </button>
                )}
                
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
                        <Sparkles className="w-3 h-3 text-sky-500" />
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
          className="w-full py-2 text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors"
        >
          View All ({notes.length} notes)
        </button>
      )}
    </div>
  )
}

