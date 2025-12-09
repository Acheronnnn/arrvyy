import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BottomNavigation, NavigationItem } from '@/components/Navigation/BottomNavigation'
import { DashboardCard } from '@/components/Dashboard/DashboardCard'
import { ChatCard } from '@/components/Chat/ChatCard'
import { MusicCard } from '@/components/Music/MusicCard'
import { LocationCard } from '@/components/Location/LocationCard'
import { WishlistCard } from '@/components/Wishlist/WishlistCard'
import { useAuth } from '@/hooks/useAuth'
import { Loader2, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const cardOrder: NavigationItem[] = ['dashboard', 'chat', 'music', 'location', 'wishlist']

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
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getCardIndex = (cardId: NavigationItem) => cardOrder.indexOf(cardId)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 relative overflow-hidden">
      {/* Top Bar - Sesuai Gambar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/98 backdrop-blur-xl">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          {/* Left: ETH Balance */}
          <div className="flex items-center space-x-2">
            {/* ETH Logo */}
            <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
              </svg>
            </div>
            <span className="text-white font-semibold text-base">0.0 ETH</span>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center space-x-2">
            <button className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-white hover:bg-gray-700 transition-colors">
              <span className="text-lg font-bold leading-none">+</span>
            </button>
            <button className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-white hover:bg-gray-700 transition-colors relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-8 h-8 rounded-full bg-gray-800/80 flex items-center justify-center text-white hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
              title="Logout"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"></div>
              )}
            </button>
          </div>
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
      <div className="relative min-h-screen pb-20 pt-16" style={{ paddingBottom: '80px' }}>
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
            className="absolute inset-0 flex items-center justify-center px-3 py-4"
            style={{ bottom: '80px' }}
          >
            <div className="w-full max-w-md h-full" style={{ maxHeight: 'calc(100vh - 200px)' }}>
              {activeCard === 'dashboard' && <DashboardCard />}
              {activeCard === 'chat' && <ChatCard />}
              {activeCard === 'music' && <MusicCard />}
              {activeCard === 'location' && <LocationCard />}
              {activeCard === 'wishlist' && <WishlistCard />}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Navigation */}
      {console.log('🔵 Rendering BottomNavigation with activeCard:', activeCard)}
      <BottomNavigation activeItem={activeCard} onItemClick={handleCardChange} />
    </div>
  )
}

