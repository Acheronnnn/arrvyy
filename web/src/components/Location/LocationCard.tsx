import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, RefreshCw, Navigation } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from '@/hooks/useLocation'
import { supabase } from '@/lib/supabase'

// Fix untuk default marker icon (Leaflet issue)
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const DefaultIcon = new Icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Component untuk auto-fit map ke kedua lokasi
function MapBounds({ myLocation, partnerLocation }: { myLocation: any; partnerLocation: any }) {
  const map = useMap()

  useEffect(() => {
    if (myLocation && partnerLocation) {
      const bounds = [
        [myLocation.latitude, myLocation.longitude],
        [partnerLocation.latitude, partnerLocation.longitude],
      ] as [number, number][]
      map.fitBounds(bounds, { padding: [50, 50] })
    } else if (myLocation) {
      map.setView([myLocation.latitude, myLocation.longitude], 13)
    } else if (partnerLocation) {
      map.setView([partnerLocation.latitude, partnerLocation.longitude], 13)
    }
  }, [map, myLocation, partnerLocation])

  return null
}

export function LocationCard() {
  const { user } = useAuth()
  const [partner, setPartner] = useState<{ id: string; name: string; [key: string]: any } | null>(null)
  const { myLocation, partnerLocation, distance, loading, updateMyLocation, getCurrentLocation, refreshLocations } = useLocation(
    user?.id,
    partner?.id
  )
  const [updating, setUpdating] = useState(false)

  // Fetch partner
  useEffect(() => {
    const fetchPartner = async () => {
      if (user?.partner_id) {
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.partner_id)
          .single()
        
        if (data) {
          setPartner(data as any)
        }
      }
    }

    if (user?.partner_id) {
      fetchPartner()
    }
  }, [user?.partner_id])

  // Get initial location on mount
  useEffect(() => {
    if (user?.id && !myLocation) {
      getCurrentLocation()
        .then(({ latitude, longitude }) => {
          updateMyLocation(latitude, longitude)
        })
        .catch((err) => {
          console.error('Error getting initial location:', err)
        })
    }
  }, [user?.id, myLocation, getCurrentLocation, updateMyLocation])

  const handleRefresh = async () => {
    setUpdating(true)
    try {
      const { latitude, longitude } = await getCurrentLocation()
      await updateMyLocation(latitude, longitude)
      await refreshLocations()
    } catch (err: any) {
      console.error('Error refreshing location:', err)
      alert('Gagal mendapatkan lokasi. Pastikan izin lokasi sudah diberikan.')
    } finally {
      setUpdating(false)
    }
  }

  // Default center (Jakarta) jika belum ada lokasi
  const defaultCenter: [number, number] = [-6.2088, 106.8456]
  const hasLocations = myLocation || partnerLocation

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-sky-100/80"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-2xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Location</h2>
              <p className="text-sm text-gray-600">
                {distance !== null ? `${distance.toFixed(1)} km apart` : 'Share your location'}
              </p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={updating || loading}
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-5 h-5 text-gray-700 ${updating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Map Container - MAP BESAR */}
      <div className="flex-1 relative overflow-hidden">
        {loading && !hasLocations ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-2 animate-pulse" />
              <p className="text-gray-600 text-sm">Loading map...</p>
            </div>
          </div>
        ) : (
          <MapContainer
            center={hasLocations ? [myLocation?.latitude || partnerLocation?.latitude || defaultCenter[0], myLocation?.longitude || partnerLocation?.longitude || defaultCenter[1]] : defaultCenter}
            zoom={hasLocations ? 6 : 2}
            className="w-full h-full z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* My Location Marker */}
            {myLocation && (
              <Marker
                position={[myLocation.latitude, myLocation.longitude]}
                icon={DefaultIcon}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold text-gray-900">📍 Kamu</p>
                    {myLocation.address && (
                      <p className="text-xs text-gray-600 mt-1">{myLocation.address}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(myLocation.last_updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Partner Location Marker */}
            {partnerLocation && (
              <Marker
                position={[partnerLocation.latitude, partnerLocation.longitude]}
                icon={new Icon({
                  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
                      <path fill="#ef4444" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5S25 25 25 12.5C25 5.6 19.4 0 12.5 0zm0 17c-2.5 0-4.5-2-4.5-4.5s2-4.5 4.5-4.5 4.5 2 4.5 4.5-2 4.5-4.5 4.5z"/>
                    </svg>
                  `),
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                })}
              >
                <Popup>
                  <div className="text-center">
                    <p className="font-semibold text-red-600">💕 {partner?.name || 'Partner'}</p>
                    {partnerLocation.address && (
                      <p className="text-xs text-gray-600 mt-1">{partnerLocation.address}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {partnerLocation.is_online ? '🟢 Online' : '⚫ Offline'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(partnerLocation.last_updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Auto-fit bounds */}
            {myLocation && partnerLocation && (
              <MapBounds myLocation={myLocation} partnerLocation={partnerLocation} />
            )}
          </MapContainer>
        )}

        {/* Distance Badge */}
        {distance !== null && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-gray-200"
            >
              <p className="text-sm font-semibold text-gray-900">
                <span className="text-sky-500">{distance.toFixed(1)} km</span>
                <span className="text-gray-500 ml-2">apart</span>
              </p>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
