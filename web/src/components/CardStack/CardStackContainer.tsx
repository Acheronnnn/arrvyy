import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNavigation, NavigationItem } from '@/components/Navigation/BottomNavigation'
import { DashboardCard } from '@/components/Dashboard/DashboardCard'
import { ChatCard } from '@/components/Chat/ChatCard'
import { MusicCard } from '@/components/Music/MusicCard'
import { LocationCard } from '@/components/Location/LocationCard'
import { WishlistCard } from '@/components/Wishlist/WishlistCard'
import { ProfileCard } from '@/components/Profile/ProfileCard'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, LogOut as LogOutIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function CardStackContainer() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()
  const [activeCard, setActiveCard] = useState<NavigationItem>('dashboard')
  const [loggingOut, setLoggingOut] = useState(false)

  const handleCardChange = (item: NavigationItem) => {
    console.log('🔄 Changing card from', activeCard, 'to', item)
    setActiveCard(item)
  }

  const handleLogout = async () => {
    if (!confirm('Yakin mau logout?')) return
    
    setLoggingOut(true)
    try {
      // Sign out (non-blocking - state already cleared)
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
      // Continue anyway - state already cleared
    } finally {
      // Always redirect, even if signOut fails
      // Use setTimeout to ensure state is cleared
      setTimeout(() => {
        window.location.href = '/login'
      }, 100)
    }
  }

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true })
    }
  }, [user, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 relative overflow-hidden">
      {/* Top Bar - App Name & Logout Icon */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: App Name */}
          <h1 className="text-gray-900 font-bold text-xl">Arrvyy</h1>
          
          {/* Right: Logout Icon */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 text-gray-900 hover:text-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Logout"
          >
            {loggingOut ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <LogOutIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Background specks effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
            }}
          />
        ))}
      </div>


      {/* Card Container - Simple, hanya show active card dengan animasi smooth */}
      <div className="relative min-h-screen" style={{ paddingTop: '55px', paddingBottom: '75px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCard}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
              mass: 0.8,
            }}
            className="absolute inset-0 flex items-center justify-center px-3 py-2"
            style={{ top: '55px', bottom: '75px' }}
          >
            <div className="w-full max-w-md h-full" style={{ height: 'calc(100vh - 130px)', maxHeight: 'calc(100vh - 130px)' }}>
              {activeCard === 'dashboard' && <DashboardCard />}
              {activeCard === 'chat' && <ChatCard />}
              {activeCard === 'music' && <MusicCard />}
              {activeCard === 'location' && <LocationCard />}
              {activeCard === 'wishlist' && <WishlistCard />}
              {activeCard === 'profile' && <ProfileCard />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation activeItem={activeCard} onItemClick={handleCardChange} />
    </div>
  )
}

