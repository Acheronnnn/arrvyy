import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Plus, Navigation } from 'lucide-react'

interface Location {
  id: string
  name: string
  latitude: number
  longitude: number
  address?: string
}

export function LocationCard() {
  const [locations] = useState<Location[]>([])
  const [showAddForm, setShowAddForm] = useState(false)

  // Sample location (akan di-fetch dari database nanti)
  const [currentLocation] = useState<{ lat: number; lng: number } | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-gradient-to-br from-white via-green-50/50 to-emerald-50/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/80"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Location</h2>
              <p className="text-sm text-gray-600">Share & explore places</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Map Placeholder */}
        <div className="w-full h-64 rounded-2xl bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjlmYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM2YjcyODAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NYXAgVmlldzwvdGV4dD48L3N2Zz4=')] bg-cover bg-center opacity-30"></div>
          <div className="relative z-10 text-center">
            <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">Map will be displayed here</p>
            <p className="text-xs text-gray-500 mt-1">Google Maps integration</p>
          </div>
        </div>

        {/* Locations List */}
        {locations.length > 0 ? (
          <div className="space-y-3">
            {locations.map((location) => (
              <div
                key={location.id}
                className="bg-gray-50 rounded-xl p-4 flex items-center space-x-3"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{location.name}</p>
                  {location.address && (
                    <p className="text-sm text-gray-600">{location.address}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No locations saved</p>
            <p className="text-sm text-gray-500 mt-2">Add a location to get started</p>
          </div>
        )}

        {/* Add Location Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gray-50 rounded-2xl p-4 space-y-3"
          >
            <input
              type="text"
              placeholder="Location name"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <input
              type="text"
              placeholder="Address (optional)"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button className="flex-1 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-medium hover:from-green-600 hover:to-blue-600 transition-all">
                Add Location
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

