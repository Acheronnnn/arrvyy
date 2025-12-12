import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2, Calendar, Heart, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import type { Memory } from '@/types'
import { ViewMemoryModal } from './ViewMemoryModal'

interface ViewAllMemoriesModalProps {
  isOpen: boolean
  onClose: () => void
  memories: Memory[]
  onDelete?: (id: string) => void
  onView: (memory: Memory) => void
}

// Helper function to get Google Drive thumbnail URL
function getDriveImageUrl(photoUrl: string | undefined): string | null {
  if (!photoUrl) return null
  
  // Extract file ID from various Google Drive URL formats
  let fileId: string | null = null
  
  // Try format 1: ?id= or &id=
  const match1 = photoUrl.match(/[?&]id=([^&]+)/)
  if (match1 && match1[1]) {
    fileId = match1[1]
  } else {
    // Try format 2: /file/d/FILE_ID/
    const match2 = photoUrl.match(/\/file\/d\/([^\/]+)/)
    if (match2 && match2[1]) {
      fileId = match2[1]
    }
  }
  
  if (fileId) {
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
  }
  
  return photoUrl
}

export function ViewAllMemoriesModal({
  isOpen,
  onClose,
  memories,
  onDelete,
  onView,
}: ViewAllMemoriesModalProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)

  const handleDelete = async (e: React.MouseEvent, memoryId: string) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!onDelete) {
      console.error('❌ onDelete function not provided')
      alert('Delete function not available. Please refresh the page.')
      return
    }
    
    if (confirm('Are you sure you want to delete this memory?')) {
      setDeletingId(memoryId)
      try {
        await onDelete(memoryId)
        if (selectedMemory?.id === memoryId) {
          setSelectedMemory(null)
        }
      } catch (error: any) {
        console.error('❌ Error deleting memory:', error)
        alert(`Failed to delete memory: ${error.message || 'Unknown error'}`)
      } finally {
        setDeletingId(null)
      }
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Memories</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {memories.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                <AnimatePresence>
                  {memories.map((memory) => {
                    const imageUrl = getDriveImageUrl(memory.photo_url)
                    return (
                      <motion.div
                        key={memory.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={() => {
                          setSelectedMemory(memory)
                          setShowViewModal(true)
                          onView(memory)
                        }}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={memory.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            onLoad={() => {
                              console.log('✅ Image loaded in modal:', imageUrl)
                            }}
                            onError={(e) => {
                              console.error('❌ Image failed to load in modal:', imageUrl)
                              const currentSrc = e.currentTarget.src
                              const originalUrl = memory.photo_url
                              
                              if (originalUrl && currentSrc !== originalUrl) {
                                console.log('🔄 Trying original URL in modal:', originalUrl)
                                e.currentTarget.src = originalUrl
                              } else {
                                e.currentTarget.style.display = 'none'
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-gray-400" />
                          </div>
                        )}

                        {/* Delete Button - Always visible */}
                        {onDelete && (
                          <button
                            onClick={(e) => handleDelete(e, memory.id)}
                            disabled={deletingId === memory.id}
                            className="absolute top-2 left-2 w-7 h-7 rounded-full bg-red-500/90 backdrop-blur-sm flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50 z-10"
                            title="Delete memory"
                          >
                            {deletingId === memory.id ? (
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5 text-white" />
                            )}
                          </button>
                        )}

                        {/* Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                            <p className="font-semibold text-xs truncate">{memory.title}</p>
                            <p className="text-[10px] opacity-90 flex items-center space-x-1 mt-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>{format(new Date(memory.memory_date), 'MMM d, yyyy')}</span>
                            </p>
                          </div>
                        </div>

                        {/* Heart icon */}
                        <div className="absolute top-2 right-2">
                          <div className="w-5 h-5 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500" />
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No memories with photos yet</p>
              </div>
            )}
          </div>

          {/* View Memory Modal (Full Size) */}
          <ViewMemoryModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false)
              setSelectedMemory(null)
            }}
            memory={selectedMemory}
            onDelete={onDelete}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

