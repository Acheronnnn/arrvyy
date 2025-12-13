import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, RefreshCw, Navigation, Home, Map, X, Check } from 'lucide-react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, DivIcon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAuth } from '@/hooks/useAuth'
import { useLocation } from '@/hooks/useLocation'
import { supabase } from '@/lib/supabase'

// Helper untuk get avatar URL
function getDriveImageUrl(photoUrl: string | undefined | null): string | null {
  if (!photoUrl) return null
  let fileId: string | null = null
  const match1 = photoUrl.match(/[?&]id=([^&?]+)/)
  if (match1 && match1[1]) {
    fileId = match1[1].trim()
  } else {
    const match2 = photoUrl.match(/\/file\/d\/([^\/?&]+)/)
    if (match2 && match2[1]) {
      fileId = match2[1].trim()
    }
  }
  if (fileId) {
    const cleanedFileId = fileId.split('?')[0].split('&')[0].trim()
    return `https://drive.google.com/thumbnail?id=${cleanedFileId}&sz=w200`
  }
  return photoUrl
}

// Component untuk auto-fit map
function MapBounds({ myLocation, partnerLocation, myHome, partnerHome }: any) {
  const map = useMap()

  useEffect(() => {
    const bounds: [number, number][] = []
    
    if (myLocation) {
      bounds.push([myLocation.latitude, myLocation.longitude])
    }
    if (partnerLocation) {
      bounds.push([partnerLocation.latitude, partnerLocation.longitude])
    }
    if (myHome) {
      bounds.push([myHome.latitude, myHome.longitude])
    }
    if (partnerHome) {
      bounds.push([partnerHome.latitude, partnerHome.longitude])
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [80, 80] })
    }
  }, [map, myLocation, partnerLocation, myHome, partnerHome])

  return null
}

// Custom Avatar Marker Component
function createAvatarMarker(avatarUrl: string | null, name: string, color: string, isOnline: boolean) {
  const avatarSrc = avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color.replace('#', '')}&color=fff&size=128&bold=true`
  
  return new DivIcon({
    className: 'custom-avatar-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 3px solid ${color};
          overflow: hidden;
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <img 
            src="${avatarSrc}" 
            alt="${name}"
            style="width: 100%; height: 100%; object-fit: cover;"
            onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color.replace('#', '')}&color=fff&size=128&bold=true'"
          />
        </div>
        <div style="
          position: absolute;
          bottom: -2px;
          right: -2px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 2px solid white;
          background: ${isOnline ? '#10b981' : '#6b7280'};
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        "></div>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
  })
}

// Custom Home Marker
const HomeIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#f59e0b" stroke="#fff" stroke-width="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

export function LocationCard() {
  const { user } = useAuth()
  const [partner, setPartner] = useState<{ id: string; name: string; avatar_url?: string; [key: string]: any } | null>(null)
  const { 
    myLocation, 
    partnerLocation, 
    distance, 
    distanceToMyHome,
    distanceToPartnerHome,
    loading, 
    updateMyLocation, 
    setHomeLocation,
    getCurrentLocation, 
    refreshLocations 
  } = useLocation(user?.id, partner?.id)
  
  const [updating, setUpdating] = useState(false)
  const [settingHome, setSettingHome] = useState(false)
  const [showSetHomeModal, setShowSetHomeModal] = useState(false)

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

  const handleSetHome = async () => {
    if (!myLocation) {
      alert('Lokasi saat ini belum tersedia. Silakan refresh lokasi terlebih dahulu.')
      return
    }

    setSettingHome(true)
    try {
      const { latitude, longitude } = myLocation
      await setHomeLocation(latitude, longitude, myLocation.address || undefined)
      setShowSetHomeModal(false)
      alert('Lokasi rumah berhasil disimpan! 🏠')
    } catch (err: any) {
      console.error('Error setting home:', err)
      alert('Gagal menyimpan lokasi rumah: ' + (err.message || 'Unknown error'))
    } finally {
      setSettingHome(false)
    }
  }

  const defaultCenter: [number, number] = [-6.2088, 106.8456]
  const hasLocations = myLocation || partnerLocation
  const myHome = myLocation?.home_latitude && myLocation?.home_longitude ? {
    latitude: myLocation.home_latitude,
    longitude: myLocation.home_longitude,
    address: myLocation.home_address,
  } : null
  const partnerHome = partnerLocation?.home_latitude && partnerLocation?.home_longitude ? {
    latitude: partnerLocation.home_latitude,
    longitude: partnerLocation.home_longitude,
    address: partnerLocation.home_address,
  } : null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-sky-100/80"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      {/* Header - Compact */}
      <div className="p-4 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Location Tracker</h2>
              <p className="text-xs text-gray-500">
                {distance !== null ? `${distance.toFixed(1)} km apart` : 'Share your location'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSetHomeModal(true)}
              className="w-9 h-9 rounded-lg bg-amber-100 hover:bg-amber-200 flex items-center justify-center transition-colors"
              title="Set Home Location"
            >
              <Home className="w-4 h-4 text-amber-600" />
            </button>
            <button
              onClick={handleRefresh}
              disabled={updating || loading}
              className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors disabled:opacity-50"
              title="Refresh Location"
            >
              <RefreshCw className={`w-4 h-4 text-gray-700 ${updating ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Info Panel - Compact */}
        <div className="grid grid-cols-2 gap-2">
          {/* My Location Info */}
          {myLocation && (
            <div className="bg-sky-50 rounded-lg p-2 border border-sky-100">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                <p className="text-xs font-semibold text-gray-900">Kamu</p>
                <div className={`w-1.5 h-1.5 rounded-full ${myLocation.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
              {myLocation.address && (
                <p className="text-[10px] text-gray-600 truncate">{myLocation.address}</p>
              )}
              {distanceToMyHome !== null && (
                <p className="text-[10px] text-amber-600 mt-0.5">
                  🏠 {distanceToMyHome.toFixed(1)} km dari rumah
                </p>
              )}
            </div>
          )}

          {/* Partner Location Info */}
          {partnerLocation && (
            <div className="bg-red-50 rounded-lg p-2 border border-red-100">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <p className="text-xs font-semibold text-gray-900">{partner?.name || 'Partner'}</p>
                <div className={`w-1.5 h-1.5 rounded-full ${partnerLocation.is_online ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              </div>
              {partnerLocation.address && (
                <p className="text-[10px] text-gray-600 truncate">{partnerLocation.address}</p>
              )}
              {distanceToPartnerHome !== null && (
                <p className="text-[10px] text-amber-600 mt-0.5">
                  🏠 {distanceToPartnerHome.toFixed(1)} km dari rumah
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
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
            center={hasLocations ? [
              myLocation?.latitude || partnerLocation?.latitude || defaultCenter[0], 
              myLocation?.longitude || partnerLocation?.longitude || defaultCenter[1]
            ] : defaultCenter}
            zoom={hasLocations ? 6 : 2}
            className="w-full h-full z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* My Location Marker - Avatar */}
            {myLocation && (
              <Marker
                position={[myLocation.latitude, myLocation.longitude]}
                icon={createAvatarMarker(
                  getDriveImageUrl(user?.avatar_url) || null,
                  user?.name || 'You',
                  '#0ea5e9',
                  myLocation.is_online
                )}
              >
                <Popup>
                  <div className="text-center min-w-[120px]">
                    <p className="font-semibold text-gray-900 text-sm">📍 Kamu</p>
                    {myLocation.address && (
                      <p className="text-xs text-gray-600 mt-1">{myLocation.address}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(myLocation.last_updated_at).toLocaleTimeString()}
                    </p>
                    {distanceToMyHome !== null && (
                      <p className="text-xs text-amber-600 mt-1">
                        🏠 {distanceToMyHome.toFixed(1)} km dari rumah
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Partner Location Marker - Avatar */}
            {partnerLocation && (
              <Marker
                position={[partnerLocation.latitude, partnerLocation.longitude]}
                icon={createAvatarMarker(
                  getDriveImageUrl(partner?.avatar_url) || null,
                  partner?.name || 'Partner',
                  '#ef4444',
                  partnerLocation.is_online
                )}
              >
                <Popup>
                  <div className="text-center min-w-[120px]">
                    <p className="font-semibold text-red-600 text-sm">💕 {partner?.name || 'Partner'}</p>
                    {partnerLocation.address && (
                      <p className="text-xs text-gray-600 mt-1">{partnerLocation.address}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {partnerLocation.is_online ? '🟢 Online' : '⚫ Offline'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(partnerLocation.last_updated_at).toLocaleTimeString()}
                    </p>
                    {distanceToPartnerHome !== null && (
                      <p className="text-xs text-amber-600 mt-1">
                        🏠 {distanceToPartnerHome.toFixed(1)} km dari rumah
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* My Home Marker */}
            {myHome && (
              <Marker
                position={[myHome.latitude, myHome.longitude]}
                icon={HomeIcon}
              >
                <Popup>
                  <div className="text-center min-w-[120px]">
                    <p className="font-semibold text-amber-600 text-sm">🏠 Rumah Kamu</p>
                    {myHome.address && (
                      <p className="text-xs text-gray-600 mt-1">{myHome.address}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Partner Home Marker */}
            {partnerHome && (
              <Marker
                position={[partnerHome.latitude, partnerHome.longitude]}
                icon={HomeIcon}
              >
                <Popup>
                  <div className="text-center min-w-[120px]">
                    <p className="font-semibold text-amber-600 text-sm">🏠 Rumah {partner?.name || 'Partner'}</p>
                    {partnerHome.address && (
                      <p className="text-xs text-gray-600 mt-1">{partnerHome.address}</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Auto-fit bounds */}
            {(myLocation || partnerLocation || myHome || partnerHome) && (
              <MapBounds 
                myLocation={myLocation} 
                partnerLocation={partnerLocation}
                myHome={myHome}
                partnerHome={partnerHome}
              />
            )}
          </MapContainer>
        )}

        {/* Distance Badge - Enhanced */}
        {distance !== null && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000]">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-full px-4 py-2 shadow-xl border-2 border-sky-200"
            >
              <div className="flex items-center space-x-2">
                <Map className="w-4 h-4 text-sky-500" />
                <p className="text-sm font-bold text-gray-900">
                  <span className="text-sky-500">{distance.toFixed(1)} km</span>
                  <span className="text-gray-500 ml-1">apart</span>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Set Home Modal */}
      <AnimatePresence>
        {showSetHomeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4"
            onClick={() => setShowSetHomeModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <Home className="w-5 h-5 text-amber-500" />
                  <span>Set Home Location</span>
                </h3>
                <button
                  onClick={() => setShowSetHomeModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Simpan lokasi saat ini sebagai rumah kamu? Lokasi ini akan ditampilkan sebagai checkpoint di map.
              </p>

              {myLocation && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-xs text-gray-500 mb-1">Lokasi saat ini:</p>
                  <p className="text-sm font-medium text-gray-900">
                    {myLocation.address || `${myLocation.latitude.toFixed(6)}, ${myLocation.longitude.toFixed(6)}`}
                  </p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowSetHomeModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSetHome}
                  disabled={settingHome || !myLocation}
                  className="flex-1 px-4 py-2 rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {settingHome ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Simpan</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
