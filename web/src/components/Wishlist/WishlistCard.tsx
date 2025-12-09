import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, Trash2, Edit2 } from 'lucide-react'

interface WishlistItem {
  id: string
  title: string
  description?: string
  category?: string
  createdAt: string
}

export function WishlistCard() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  })

  const handleAdd = () => {
    if (!formData.title.trim()) return

    const newItem: WishlistItem = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      category: formData.category,
      createdAt: new Date().toISOString(),
    }

    setItems([...items, newItem])
    setFormData({ title: '', description: '', category: '' })
    setShowAddForm(false)
  }

  const handleEdit = (item: WishlistItem) => {
    setEditingId(item.id)
    setFormData({
      title: item.title,
      description: item.description || '',
      category: item.category || '',
    })
    setShowAddForm(true)
  }

  const handleUpdate = () => {
    if (!formData.title.trim()) return

    setItems(
      items.map((item) =>
        item.id === editingId
          ? { ...item, ...formData }
          : item
      )
    )
    setFormData({ title: '', description: '', category: '' })
    setEditingId(null)
    setShowAddForm(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('Yakin mau hapus item ini?')) {
      setItems(items.filter((item) => item.id !== id))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-gradient-to-br from-white via-orange-50/50 to-amber-50/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/80"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-red-400 rounded-2xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Wishlist</h2>
              <p className="text-sm text-gray-600">Your notes & wishes</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm)
              setEditingId(null)
              setFormData({ title: '', description: '', category: '' })
            }}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Add/Edit Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl p-4 space-y-3"
            >
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
              />
              <input
                type="text"
                placeholder="Category (optional)"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setEditingId(null)
                    setFormData({ title: '', description: '', category: '' })
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingId ? handleUpdate : handleAdd}
                  className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-red-600 transition-all"
                >
                  {editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items List */}
        {items.length > 0 ? (
          <div className="space-y-3">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gray-50 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      )}
                      {item.category && (
                        <span className="inline-block px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-lg">
                          {item.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No wishlist items yet</p>
            <p className="text-sm text-gray-500 mt-2">Add your first wish or note</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

