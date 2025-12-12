import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Heart, Trash2, Download } from 'lucide-react'
import { format } from 'date-fns'
import type { Memory } from '@/types'

interface ViewMemoryModalProps {
  isOpen: boolean
  onClose: () => void
  memory: Memory | null
  onDelete?: (id: string) => void
}

// Helper function to get Google Drive image URL
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
    // Try multiple URL formats for better compatibility
    // Format 1: Direct view (most reliable)
    // Format 2: Thumbnail with large size
    // Format 3: Original URL as fallback
    return `https://drive.google.com/uc?export=view&id=${fileId}`
  }
  
  return photoUrl
}

export function ViewMemoryModal({
  isOpen,
  onClose,
  memory,
  onDelete,
}: ViewMemoryModalProps) {
  if (!isOpen || !memory) return null

  const imageUrl = getDriveImageUrl(memory.photo_url)

  const handleDelete = async () => {
    if (!onDelete) return
    
    if (confirm('Are you sure you want to delete this memory?')) {
      try {
        await onDelete(memory.id)
        onClose()
      } catch (error: any) {
        console.error('Error deleting memory:', error)
        alert(`Failed to delete memory: ${error.message || 'Unknown error'}`)
      }
    }
  }

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `${memory.title}_${format(new Date(memory.memory_date), 'yyyy-MM-dd')}.jpg`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

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
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
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
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{memory.title}</h2>
              <div className="flex items-center space-x-4 mt-1">
                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(memory.memory_date), 'MMMM d, yyyy')}</span>
                </div>
                {memory.description && (
                  <p className="text-sm text-gray-500 line-clamp-1">{memory.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
              {/* Download Button */}
              {imageUrl && (
                <button
                  onClick={handleDownload}
                  className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors"
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {/* Delete Button */}
              {onDelete && (
                <button
                  onClick={handleDelete}
                  className="w-9 h-9 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                  title="Delete memory"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              {/* Close Button */}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Image Content */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center">
            {imageUrl ? (
              <div className="relative w-full max-w-2xl mx-auto">
                <motion.img
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  src={imageUrl}
                  alt={memory.title}
                  className="w-full h-auto rounded-xl shadow-2xl object-contain max-h-[60vh] mx-auto block"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                  }}
                  onError={(e) => {
                    console.error('❌ Image failed to load in view modal:', imageUrl)
                    const originalUrl = memory.photo_url
                    if (originalUrl) {
                      // Try to extract file ID and use thumbnail format
                      const match = originalUrl.match(/[?&]id=([^&]+)/)
                      if (match && match[1]) {
                        const fileId = match[1]
                        const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`
                        console.log('🔄 Trying thumbnail URL:', thumbnailUrl)
                        if (e.currentTarget.src !== thumbnailUrl) {
                          e.currentTarget.src = thumbnailUrl
                          return
                        }
                      }
                      // Fallback to original URL
                      if (e.currentTarget.src !== originalUrl) {
                        console.log('🔄 Trying original URL:', originalUrl)
                        e.currentTarget.src = originalUrl
                      }
                    }
                  }}
                />
                {/* Heart decoration */}
                <div className="absolute top-4 right-4">
                  <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-gray-500">No photo available for this memory</p>
              </div>
            )}

            {/* Description */}
            {memory.description && (
              <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200 max-w-3xl mx-auto">
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{memory.description}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

