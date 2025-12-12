import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Home, MessageSquare, Music, MapPin, Heart, User } from 'lucide-react'

export type NavigationItem = 'dashboard' | 'chat' | 'music' | 'location' | 'wishlist' | 'profile'

interface BottomNavigationProps {
  activeItem: NavigationItem
  onItemClick: (item: NavigationItem) => void
}

const navigationItems: { id: NavigationItem; icon: typeof Home; label: string }[] = [
  { id: 'dashboard', icon: Home, label: 'Home' },
  { id: 'chat', icon: MessageSquare, label: 'Chat' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'location', icon: MapPin, label: 'Location' },
  { id: 'wishlist', icon: Heart, label: 'Wishlist' },
  { id: 'profile', icon: User, label: 'Profile' },
]

export function BottomNavigation({ activeItem, onItemClick }: BottomNavigationProps) {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    console.log('🔵 BottomNavigation mounted, activeItem:', activeItem)
    
    // Detect keyboard visibility on mobile
    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight
      const windowHeight = window.innerHeight
      const keyboardOpen = viewportHeight < windowHeight * 0.75
      console.log('📏 Viewport resize:', { viewportHeight, windowHeight, keyboardOpen })
      setIsKeyboardVisible(keyboardOpen)
    }

    // Listen for input focus/blur
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA'
      const isBottomNav = target?.closest('.bottom-nav-container')
      
      if (isBottomNav) {
        console.log('🔵 Focus on bottom nav, not hiding')
        return
      }
      
      if (isInput) {
        console.log('⌨️ Input focused, hiding bottom nav')
        setIsKeyboardVisible(true)
      }
    }
    
    const handleBlur = () => {
      setTimeout(() => {
        const viewportHeight = window.visualViewport?.height || window.innerHeight
        const windowHeight = window.innerHeight
        const keyboardOpen = viewportHeight < windowHeight * 0.75
        console.log('⌨️ Input blurred, keyboard open:', keyboardOpen)
        setIsKeyboardVisible(keyboardOpen)
      }, 300)
    }

    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
    document.addEventListener('focusin', handleFocus)
    document.addEventListener('focusout', handleBlur)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
      document.removeEventListener('focusin', handleFocus)
      document.removeEventListener('focusout', handleBlur)
    }
  }, [])

  const handleItemClick = (itemId: NavigationItem, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('🔵🔵🔵 Bottom nav button clicked:', itemId, 'Current active:', activeItem)
    console.log('🔵 Event:', e.type, e.target)
    
    try {
      onItemClick(itemId)
      console.log('✅ onItemClick called successfully')
    } catch (error) {
      console.error('❌ Error calling onItemClick:', error)
    }
  }

  // Disable keyboard hiding for now
  // if (isKeyboardVisible) {
  //   return null
  // }

  console.log('📍📍📍 Bottom nav RENDERING NOW!', { 
    activeItem, 
    isKeyboardVisible, 
    onItemClickType: typeof onItemClick,
    onItemClickExists: !!onItemClick 
  })

  return (
    <div 
      className="bottom-nav-container fixed bottom-0 left-0 right-0" 
      style={{ zIndex: 9999, position: 'fixed' }}
      onClick={(e) => {
        console.log('🖱️ Container clicked:', e.target)
      }}
    >
      {/* Background with blur */}
      <div className="absolute inset-0 bg-gray-900/98 backdrop-blur-xl border-t border-gray-700/50"></div>
      
      {/* Content */}
      <div className="relative max-w-md mx-auto px-2 py-1.5">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.id

            return (
              <button
                key={item.id}
                onClick={(e) => {
                  console.log('🖱️🖱️🖱️ CLICK EVENT TRIGGERED on:', item.id)
                  handleItemClick(item.id, e)
                }}
                onMouseDown={(e) => {
                  console.log('🖱️ Mouse DOWN on:', item.id, e.target)
                }}
                onMouseUp={(e) => {
                  console.log('🖱️ Mouse UP on:', item.id, e.target)
                }}
                onTouchStart={(e) => {
                  console.log('👆 Touch START on:', item.id, e.target)
                }}
                onTouchEnd={(e) => {
                  console.log('👆 Touch END on:', item.id, e.target)
                  e.preventDefault()
                  handleItemClick(item.id, e)
                }}
                className="bottom-nav-button flex flex-col items-center justify-center flex-1 py-1 relative group cursor-pointer focus:outline-none focus:ring-0 focus-visible:ring-0 active:outline-none"
                type="button"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  touchAction: 'manipulation',
                  userSelect: 'none',
                  position: 'relative',
                  zIndex: 10000,
                }}
                data-item-id={item.id}
                aria-label={item.label}
              >
                {/* Icon with smooth animation */}
                <motion.div
                  animate={{
                    scale: isActive ? 1.15 : 1,
                    y: isActive ? -2 : 0,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                  }}
                  className="relative z-10"
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive
                        ? 'text-sky-500'
                        : 'text-gray-900 group-hover:text-sky-500'
                    }`}
                  />
                </motion.div>
                
                {/* Label */}
                <motion.span
                  animate={{
                    opacity: isActive ? 1 : 0.7,
                    scale: isActive ? 1 : 0.95,
                  }}
                  transition={{ duration: 0.2 }}
                  className={`text-[10px] mt-0.5 relative z-10 transition-colors duration-200 ${
                    isActive
                      ? 'text-sky-500 font-semibold'
                      : 'text-gray-900 group-hover:text-sky-500'
                  }`}
                >
                  {item.label}
                </motion.span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
