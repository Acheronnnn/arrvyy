import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Plus, Heart, Image as ImageIcon, Calendar, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import type { Memory } from '@/types'
import { AddMemoryModal } from './AddMemoryModal'
import { ViewAllMemoriesModal } from './ViewAllMemoriesModal'
import { ViewMemoryModal } from './ViewMemoryModal'

interface MemoryTimelineProps {
  memories: Memory[]
  onAdd?: () => void
  onView: (memory: Memory) => void
  onDelete?: (id: string) => void
}

// Helper function to get Google Drive thumbnail URL
function getDriveImageUrl(photoUrl: string | undefined): string | null {
  if (!photoUrl) {
    console.log('🔍 No photo_url provided')
    return null
  }
  
  console.log('🔍 Original photo_url:', photoUrl)
  
  // Extract file ID from various Google Drive URL formats:
  // Format 1: https://drive.google.com/uc?export=view&id=FILE_ID
  // Format 2: https://drive.google.com/file/d/FILE_ID/view
  // Format 3: https://drive.google.com/thumbnail?id=FILE_ID
  let fileId: string | null = null
  
  // Try format 1: ?id= or &id= (stop at &, ?, or end of string)
  const match1 = photoUrl.match(/[?&]id=([^&?]+)/)
  if (match1 && match1[1]) {
    fileId = match1[1].trim()
  } else {
    // Try format 2: /file/d/FILE_ID/ (stop at /, ?, &, or end of string)
    const match2 = photoUrl.match(/\/file\/d\/([^\/?&]+)/)
    if (match2 && match2[1]) {
      fileId = match2[1].trim()
    }
  }
  
  if (fileId) {
    // Clean file ID: remove any trailing query params that might have been captured
    fileId = fileId.split('?')[0].split('&')[0].trim()
    // Use Google Drive thumbnail API for better reliability
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`
    console.log('✅ Generated thumbnail URL:', thumbnailUrl)
    return thumbnailUrl
  }
  
  // If URL doesn't match expected format, return as-is
  console.log('⚠️ Could not extract file ID, using original URL')
  return photoUrl
}

export function MemoryTimeline({ memories, onAdd, onView, onDelete }: MemoryTimelineProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewAllModal, setShowViewAllModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  // Filter memories with photos and sort by date (newest first)
  const memoriesWithPhotos = memories
    .filter(m => {
      const hasPhoto = !!m.photo_url
      if (!hasPhoto) {
        console.log('⚠️ Memory without photo_url:', m.id, m.title)
      }
      return hasPhoto
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  
  console.log('📸 Memories with photos:', memoriesWithPhotos.length, 'out of', memories.length)
  console.log('📸 Photo URLs:', memoriesWithPhotos.map(m => ({ id: m.id, url: m.photo_url })))
  
  // Get only 2 most recent photos
  const recentMemories = memoriesWithPhotos.slice(0, 2)

  const handleDelete = async (e: React.MouseEvent, memoryId: string) => {
    e.stopPropagation()
    e.preventDefault()
    
    console.log('🗑️ handleDelete called:', { memoryId, hasOnDelete: !!onDelete })
    
    if (!onDelete) {
      console.error('❌ onDelete function not provided')
      alert('Delete function not available. Please refresh the page.')
      return
    }
    
    if (confirm('Are you sure you want to delete this memory?')) {
      setDeletingId(memoryId)
      try {
        console.log('🗑️ Calling onDelete with id:', memoryId)
        await onDelete(memoryId)
        console.log('✅ Memory deleted successfully')
      } catch (error: any) {
        console.error('❌ Error deleting memory:', error)
        alert(`Failed to delete memory: ${error.message || 'Unknown error'}`)
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
          <Camera className="w-5 h-5 text-sky-500" />
          <h3 className="text-lg font-bold text-gray-900">Memory Timeline</h3>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 text-white flex items-center justify-center hover:from-sky-600 hover:to-cyan-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Recent Memories (2 photos only) */}
      {recentMemories.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          <AnimatePresence>
            {recentMemories.map((memory) => {
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
                        console.log('✅ Image loaded successfully:', imageUrl)
                      }}
                      onError={(e) => {
                        console.error('❌ Image failed to load:', imageUrl)
                        // Try multiple fallback URLs
                        const currentSrc = e.currentTarget.src
                        const originalUrl = memory.photo_url
                        
                        // If thumbnail failed, try original URL
                        if (originalUrl && currentSrc !== originalUrl) {
                          console.log('🔄 Trying original URL:', originalUrl)
                          e.currentTarget.src = originalUrl
                        } else {
                          // If original also failed, show placeholder
                          console.log('❌ All URLs failed, showing placeholder')
                          e.currentTarget.style.display = 'none'
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-sky-100 to-cyan-100 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Delete Button - Always visible for better UX */}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        console.log('🗑️ Delete button clicked for memory:', memory.id)
                        handleDelete(e, memory.id)
                      }}
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                      <p className="font-semibold text-sm truncate">{memory.title}</p>
                      <p className="text-xs opacity-90 flex items-center space-x-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        <span>{format(new Date(memory.memory_date), 'MMM d, yyyy')}</span>
                      </p>
                    </div>
                  </div>

                  {/* Heart icon */}
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center">
                      <Heart className="w-3 h-3 text-sky-500 fill-sky-500" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
      {memoriesWithPhotos.length > 2 && (
        <button
          onClick={() => setShowViewAllModal(true)}
          className="w-full py-2 text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors"
        >
          View All ({memoriesWithPhotos.length} photos)
        </button>
      )}

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* View All Memories Modal */}
      <ViewAllMemoriesModal
        isOpen={showViewAllModal}
        onClose={() => setShowViewAllModal(false)}
        memories={memoriesWithPhotos}
        onDelete={onDelete}
        onView={(memory) => {
          setSelectedMemory(memory)
          setShowViewModal(true)
          onView(memory)
        }}
      />

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
    </div>
  )
}

