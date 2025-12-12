import { useState } from 'react'
import { X, Upload } from 'lucide-react'
import { useMemories } from '@/hooks/useMemories'
import { useAuth } from '@/hooks/useAuth'
import { format } from 'date-fns'

interface AddMemoryModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddMemoryModal({ isOpen, onClose }: AddMemoryModalProps) {
  const { user } = useAuth()
  const { addMemory, uploadingPhoto } = useMemories(user?.id)
  
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [memoryDate, setMemoryDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setPhoto(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPhotoPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Title is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const newMemory = await addMemory(
        {
          title: title.trim(),
          description: description.trim() || null,
          memory_date: memoryDate,
        },
        photo || undefined
      )

      console.log('✅ Memory added successfully:', newMemory?.id)

      // Reset form
      setTitle('')
      setDescription('')
      setMemoryDate(format(new Date(), 'yyyy-MM-dd'))
      setPhoto(null)
      setPhotoPreview(null)
      
      // Close modal after a brief delay to ensure state updates
      setTimeout(() => {
        onClose()
      }, 100)
    } catch (err: any) {
      setError(err.message || 'Failed to add memory')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-2">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-xs mx-auto max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-sm font-bold text-gray-900">Add Memory</h2>
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-2.5 space-y-2.5">
          {/* Photo Upload */}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-1">
              Photo (Optional)
            </label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-sky-500 transition-colors"
              >
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <>
                    <Upload className="w-5 h-5 text-gray-400 mb-0.5" />
                    <p className="text-[10px] text-gray-500">Click to upload</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Memory title..."
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What happened on this day?"
              rows={2}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={memoryDate}
              onChange={(e) => setMemoryDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-1.5 bg-red-50 border border-red-200 rounded-md text-red-600 text-[10px]">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || uploadingPhoto}
            className="w-full py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white font-semibold text-xs rounded-md hover:from-sky-600 hover:to-cyan-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || uploadingPhoto ? 'Uploading...' : 'Add Memory'}
          </button>
        </form>
      </div>
    </div>
  )
}

