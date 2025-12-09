import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, SkipForward, SkipBack, Music2 } from 'lucide-react'

interface Song {
  id: string
  title: string
  artist: string
  youtubeId: string
  lyrics: string[]
}

export function MusicCard() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [showLyrics, setShowLyrics] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Sample songs (akan di-fetch dari database nanti)
  const [songs] = useState<Song[]>([
    {
      id: '1',
      title: 'Sample Song',
      artist: 'Artist Name',
      youtubeId: 'dQw4w9WgXcQ', // Replace with actual YouTube video ID
      lyrics: [
        'Never gonna give you up',
        'Never gonna let you down',
        'Never gonna run around and desert you',
        'Never gonna make you cry',
        'Never gonna say goodbye',
        'Never gonna tell a lie and hurt you',
      ],
    },
  ])

  useEffect(() => {
    if (songs.length > 0 && !currentSong) {
      setCurrentSong(songs[0])
    }
  }, [songs, currentSong])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // YouTube IFrame API control akan diimplementasikan nanti
  }

  const handleNext = () => {
    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id)
    const nextIndex = (currentIndex + 1) % songs.length
    setCurrentSong(songs[nextIndex])
    setIsPlaying(true)
  }

  const handlePrevious = () => {
    const currentIndex = songs.findIndex((s) => s.id === currentSong?.id)
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1
    setCurrentSong(songs[prevIndex])
    setIsPlaying(true)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full bg-gradient-to-br from-white via-purple-50/50 to-violet-50/50 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-white/80"
      style={{ backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Music</h2>
            <p className="text-sm text-gray-600">Play & share your favorite songs</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {currentSong ? (
          <div className="space-y-6">
            {/* YouTube Player */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100">
              <iframe
                ref={iframeRef}
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${currentSong.youtubeId}?enablejsapi=1&controls=1&modestbranding=1`}
                title={currentSong.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Song Info */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900">{currentSong.title}</h3>
              <p className="text-gray-600 mt-1">{currentSong.artist}</p>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center space-x-6">
              <button
                onClick={handlePrevious}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <SkipBack className="w-6 h-6 text-gray-700" />
              </button>
              <button
                onClick={handlePlayPause}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <SkipForward className="w-6 h-6 text-gray-700" />
              </button>
            </div>

            {/* Lyrics Toggle */}
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className="w-full py-3 bg-gray-100 rounded-xl text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              {showLyrics ? 'Hide Lyrics' : 'Show Lyrics'}
            </button>

            {/* Lyrics Display */}
            {showLyrics && isPlaying && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 space-y-3 max-h-64 overflow-y-auto"
              >
                {currentSong.lyrics.map((line, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-gray-700 text-center"
                  >
                    {line}
                  </motion.p>
                ))}
              </motion.div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No songs available</p>
            <p className="text-sm text-gray-500 mt-2">Add songs to start playing</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

