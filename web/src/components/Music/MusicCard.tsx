import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MusicHome } from './MusicHome'
import { MusicPlayer } from './MusicPlayer'
import { MusicLibrary } from './MusicLibrary'
import type { Song } from '@/types'

type MusicView = 'home' | 'playing' | 'library'

export function MusicCard() {
  const [currentView, setCurrentView] = useState<MusicView>('home')
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const handlePlaySong = (song: Song) => {
    setCurrentSong(song)
    setCurrentView('playing')
    setIsPlaying(true)
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-gradient-to-br from-white via-sky-50/50 to-blue-50/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-sky-100/80"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      <AnimatePresence mode="wait">
        {currentView === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full"
          >
            <MusicHome 
              onPlaySong={handlePlaySong}
              onNavigateToLibrary={() => setCurrentView('library')}
            />
          </motion.div>
        )}

        {currentView === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="h-full"
          >
            <MusicPlayer 
              song={currentSong}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onBack={() => setCurrentView('home')}
              onNext={() => {
                // TODO: Implement next song logic
                console.log('Next song')
              }}
              onPrevious={() => {
                // TODO: Implement previous song logic
                console.log('Previous song')
              }}
            />
          </motion.div>
        )}

        {currentView === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="h-full"
          >
            <MusicLibrary 
              onPlaySong={handlePlaySong}
              onBack={() => setCurrentView('home')}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

