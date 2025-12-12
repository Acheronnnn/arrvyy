import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Heart, Shuffle, SkipBack, SkipForward, ListMusic, Pause, Play } from 'lucide-react'
import { useLyrics } from '@/hooks/useLyrics'
import { useAudioPlayer } from '@/hooks/useAudioPlayer'
import { motion, AnimatePresence } from 'framer-motion'
import type { Song } from '@/types'

interface MusicPlayerProps {
  song: Song | null
  isPlaying: boolean
  onPlayPause: () => void
  onBack: () => void
  onNext?: () => void
  onPrevious?: () => void
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function MusicPlayer({ song, isPlaying, onPlayPause, onBack, onNext, onPrevious }: MusicPlayerProps) {
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const [lyrics, setLyrics] = useState<string[]>([])
  const [loadingLyrics, setLoadingLyrics] = useState(false)
  const lyricsContainerRef = useRef<HTMLDivElement>(null)
  const { fetchLyrics } = useLyrics()
  
  // Use audio player hook if preview_url is available
  const audioPlayer = useAudioPlayer(song)
  const currentTime = song?.preview_url ? audioPlayer.currentTime : 0
  const duration = song?.preview_url ? audioPlayer.duration : (song?.duration_ms ? song.duration_ms / 1000 : 0)

  // Sync audio player with parent state
  useEffect(() => {
    if (song?.preview_url) {
      if (isPlaying && !audioPlayer.isPlaying) {
        audioPlayer.togglePlayPause()
      } else if (!isPlaying && audioPlayer.isPlaying) {
        audioPlayer.togglePlayPause()
      }
    }
  }, [isPlaying, song?.preview_url])

  // Fetch lyrics when song changes
  useEffect(() => {
    if (song) {
      setLoadingLyrics(true)
      fetchLyrics(song.title, song.artist)
        .then((fetchedLyrics) => {
          setLyrics(fetchedLyrics)
          setCurrentLyricIndex(0)
        })
        .finally(() => setLoadingLyrics(false))
    }
  }, [song, fetchLyrics])

  // Auto-scroll lyrics
  useEffect(() => {
    if (lyricsContainerRef.current && currentLyricIndex < lyrics.length) {
      const lyricElement = lyricsContainerRef.current.children[currentLyricIndex] as HTMLElement
      if (lyricElement) {
        lyricElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [currentLyricIndex, lyrics.length])

  // Update current lyric index based on time (simple implementation)
  useEffect(() => {
    if (isPlaying && lyrics.length > 0) {
      const lyricInterval = Math.floor(duration / lyrics.length)
      const newIndex = Math.min(Math.floor(currentTime / lyricInterval), lyrics.length - 1)
      if (newIndex !== currentLyricIndex) {
        setCurrentLyricIndex(newIndex)
      }
    }
  }, [currentTime, duration, lyrics.length, isPlaying, currentLyricIndex])

  if (!song) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-b from-white via-sky-50/50 to-blue-50/50 text-gray-900">
        <div className="text-center">
          <p className="text-gray-600">No song selected</p>
        </div>
      </div>
    )
  }

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white via-sky-50/50 to-blue-50/50 text-gray-900 overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-12 pb-6 flex items-center justify-between flex-shrink-0">
        <button 
          onClick={onBack} 
          className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-sky-600" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Now Playing</h2>
        <button className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors">
          <Heart className="w-5 h-5 text-sky-600" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 overflow-hidden">
        {/* Album Art - Large Circular */}
        <div className="relative w-64 h-64 mb-8 flex-shrink-0">
          <motion.div
            animate={{ rotate: isPlaying ? 360 : 0 }}
            transition={{ duration: 20, repeat: isPlaying ? Infinity : 0, ease: 'linear' }}
            className="absolute inset-0 rounded-full overflow-hidden"
          >
            {song.cover_url ? (
              <img 
                src={song.cover_url} 
                alt={song.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center">
                <span className="text-4xl">🎵</span>
              </div>
            )}
          </motion.div>
          {/* Blur background effect */}
          <div 
            className="absolute -inset-20 blur-3xl opacity-30 -z-10 rounded-full"
            style={{
              background: song.cover_url 
                ? `url(${song.cover_url})` 
                : 'linear-gradient(to bottom right, #38bdf8, #06b6d4)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          ></div>
        </div>

        {/* Song Info */}
        <div className="text-center mb-6 flex-shrink-0">
          <h3 className="text-2xl font-bold mb-2 text-gray-900">{song.title}</h3>
          <p className="text-gray-600">{song.artist}</p>
        </div>

        {/* Lyrics Display */}
        <div 
          ref={lyricsContainerRef}
          className="w-full max-h-48 overflow-y-auto mb-6 space-y-2 text-center flex-shrink-0 scrollbar-hide"
        >
            {loadingLyrics ? (
            <div className="py-8">
              <div className="w-6 h-6 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 text-sm mt-2">Loading lyrics...</p>
            </div>
          ) : lyrics.length > 0 ? (
            <AnimatePresence>
              {lyrics.map((line, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-sm transition-all duration-300 ${
                    index === currentLyricIndex
                      ? 'text-sky-600 font-semibold text-base scale-105'
                      : index < currentLyricIndex
                      ? 'text-gray-500'
                      : 'text-gray-400'
                  }`}
                >
                  {line}
                </motion.p>
              ))}
            </AnimatePresence>
          ) : (
            <p className="text-gray-500 text-sm">Lyrics not available</p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full px-4 mb-6 flex-shrink-0">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
          </div>
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-sky-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </div>

        {/* Controls */}
        <div className="w-full px-4 flex items-center justify-between flex-shrink-0 pb-8">
          <button className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity">
            <Shuffle className="w-5 h-5 text-gray-500" />
          </button>
          <button 
            onClick={onPrevious}
            className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <SkipBack className="w-6 h-6 text-gray-700" />
          </button>
          <motion.button
            onClick={onPlayPause}
            whileTap={{ scale: 0.95 }}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow"
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 text-white" />
            ) : (
              <Play className="w-8 h-8 text-white ml-1" />
            )}
          </motion.button>
          <button 
            onClick={onNext}
            className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity"
          >
            <SkipForward className="w-6 h-6 text-gray-700" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:opacity-70 transition-opacity">
            <ListMusic className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

