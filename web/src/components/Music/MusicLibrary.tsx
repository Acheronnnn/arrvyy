import { useState } from 'react'
import { ChevronLeft, MoreVertical, Play, Heart, Download, Music2 } from 'lucide-react'
import { useMusic } from '@/hooks/useMusic'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'
import type { Song, Playlist } from '@/types'

type LibraryFilter = 'All' | 'Playlists' | 'Liked Songs' | 'Downloads'

interface MusicLibraryProps {
  onPlaySong: (song: Song) => void
  onBack: () => void
}

export function MusicLibrary({ onPlaySong, onBack }: MusicLibraryProps) {
  const { user } = useAuth()
  const { playlists, likedSongs, loading } = useMusic(user?.id)
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('All')
  
  const filters: LibraryFilter[] = ['All', 'Playlists', 'Liked Songs', 'Downloads']

  // Filter data berdasarkan activeFilter
  const filteredPlaylists = playlists.filter((playlist) => {
    if (activeFilter === 'All' || activeFilter === 'Playlists') return true
    return false
  })

  const filteredLikedSongs = likedSongs.filter((liked) => {
    if (activeFilter === 'All' || activeFilter === 'Liked Songs') return true
    return false
  })

  const displayItems = activeFilter === 'Liked Songs' 
    ? filteredLikedSongs.map((liked) => ({
        id: liked.id,
        title: liked.song?.title || 'Unknown',
        artist: liked.song?.artist || 'Unknown',
        songCount: 1,
        coverUrl: liked.song?.cover_url,
        type: 'song' as const,
        song: liked.song,
      }))
    : filteredPlaylists.map((playlist) => ({
        id: playlist.id,
        title: playlist.title,
        artist: 'You',
        songCount: playlist.song_count || 0,
        coverUrl: playlist.cover_url,
        type: 'playlist' as const,
        playlist,
      }))

  const handlePlayItem = async (item: any) => {
    if (item.type === 'song' && item.song) {
      onPlaySong(item.song)
    } else if (item.type === 'playlist') {
      // TODO: Fetch playlist songs and play first one
      // For now, just log
      console.log('Play playlist:', item.playlist)
    }
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white via-sky-50/50 to-blue-50/50 text-gray-900 overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack} 
            className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-sky-600" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">My Music</h2>
          <button className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors">
            <MoreVertical className="w-5 h-5 text-sky-600" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter
                  ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-sky-50 border border-gray-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : displayItems.length > 0 ? (
          <div className="space-y-3">
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handlePlayItem(item)}
                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-sky-50 transition-colors cursor-pointer group border border-transparent hover:border-sky-100"
              >
                {/* Album Art */}
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-sky-400 to-cyan-400 flex-shrink-0 shadow-md">
                  {item.coverUrl ? (
                    <img 
                      src={item.coverUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {item.type === 'song' ? item.artist : `By ${item.artist} • ${item.songCount} Songs`}
                  </p>
                </div>
                
                {/* Play Button */}
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlayItem(item)
                  }}
                  className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Play className="w-5 h-5 ml-0.5 text-sky-600" />
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {activeFilter === 'Liked Songs' 
                ? 'No liked songs yet' 
                : activeFilter === 'Playlists'
                ? 'No playlists yet'
                : 'No music yet'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {activeFilter === 'Liked Songs'
                ? 'Like songs to see them here'
                : 'Create playlists to organize your music'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

