import { useState, useEffect } from 'react'
import { Search, Heart, Play, Music2, Mic } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useSpotify } from '@/hooks/useSpotify'
import { motion } from 'framer-motion'
import type { Song } from '@/types'

// Helper function to get Google Drive thumbnail URL
function getDriveImageUrl(photoUrl: string | undefined | null): string | null {
  if (!photoUrl) {
    return null
  }
  
  // Extract file ID from various Google Drive URL formats:
  // Format 1: https://drive.google.com/uc?export=view&id=FILE_ID
  // Format 2: https://drive.google.com/file/d/FILE_ID/view
  // Format 3: https://drive.google.com/thumbnail?id=FILE_ID
  let fileId: string | null = null
  
  // Try format 1: ?id= or &id= (stop at &, ?, or end of string)
  const match1 = photoUrl.match(/[?&]id=([^&?]+)/)
  if (match1 && match1[1]) {
    fileId = match1[1].trim()
  } else {
    // Try format 2: /file/d/FILE_ID/ (stop at /, ?, &, or end of string)
    const match2 = photoUrl.match(/\/file\/d\/([^\/?&]+)/)
    if (match2 && match2[1]) {
      fileId = match2[1].trim()
    }
  }
  
  if (fileId) {
    // Clean file ID: remove any trailing query params that might have been captured
    const cleanedFileId = fileId.split('?')[0].split('&')[0].trim()
    // Use Google Drive thumbnail API for better reliability
    const thumbnailUrl = `https://drive.google.com/thumbnail?id=${cleanedFileId}&sz=w1000`
    return thumbnailUrl
  }
  
  // If URL doesn't match expected format, return as-is
  return photoUrl
}

interface MusicHomeProps {
  onPlaySong: (song: Song) => void
  onNavigateToLibrary: () => void
}

export function MusicHome({ onPlaySong, onNavigateToLibrary }: MusicHomeProps) {
  const { user } = useAuth()
  const { searchTracks, getTrendingPlaylists, getTopArtists, loading: searching, authorize, isAuthenticated } = useSpotify()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [trendingPlaylists, setTrendingPlaylists] = useState<any[]>([])
  const [topArtists, setTopArtists] = useState<any[]>([])
  const [loadingPlaylists, setLoadingPlaylists] = useState(true)
  const [loadingArtists, setLoadingArtists] = useState(true)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [avatarError, setAvatarError] = useState(false)

  // Get display name (fallback to name)
  const displayName = (user as any)?.display_name || user?.name?.split(' ')[0] || 'User'
  
  // Get avatar URL
  const avatarUrl = getDriveImageUrl(user?.avatar_url)

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false)
  }, [user?.avatar_url])

  // Fetch trending playlists and top artists on mount
  useEffect(() => {
    const fetchData = async () => {
      if (isAuthenticated) {
        setLoadingPlaylists(true)
        setLoadingArtists(true)
        
        const playlists = await getTrendingPlaylists(10)
        setTrendingPlaylists(playlists)
        setLoadingPlaylists(false)

        const artists = await getTopArtists(10)
        setTopArtists(artists)
        setLoadingArtists(false)
      } else {
        setLoadingPlaylists(false)
        setLoadingArtists(false)
      }
    }

    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]) // Only depend on isAuthenticated, functions are memoized with useCallback

  // Debounced search with longer delay to reduce rate limiting
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    // Increase debounce delay to 800ms to reduce API calls
    const timeoutId = setTimeout(async () => {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MusicHome.tsx:103',message:'Search triggered',data:{query:searchQuery},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
      // #endregion

      const tracks = await searchTracks(searchQuery)

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'MusicHome.tsx:107',message:'Search results received',data:{tracksCount:tracks.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion

      const songs: Song[] = tracks.map((track) => ({
        id: track.id,
        spotify_id: track.id,
        title: track.name,
        artist: track.artists.map((a) => a.name).join(', '),
        album: track.album.name,
        cover_url: track.album.images[0]?.url,
        preview_url: track.preview_url || undefined,
        duration_ms: track.duration_ms,
        external_url: track.external_urls.spotify,
      }))
      setSearchResults(songs)
      setShowSearchResults(true)
    }, 800) // Increased from 500ms to 800ms to reduce rate limiting

    return () => clearTimeout(timeoutId)
  }, [searchQuery, searchTracks])

  const handleVoiceSearch = () => {
    // TODO: Implement voice search
    // For now, just focus on search input
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement
    if (searchInput) {
      searchInput.focus()
    }
  }

  const handlePlayPlaylist = async (playlist: any) => {
    // TODO: Fetch playlist tracks and play first song
    // For now, just log
    console.log('Play playlist:', playlist)
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-white via-sky-50/50 to-blue-50/50 text-gray-900 overflow-y-auto">
      {/* Header dengan greeting */}
      <div className="px-4 pt-12 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Profile Picture */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center overflow-hidden ring-2 ring-sky-200/50">
              {avatarUrl && !avatarError ? (
                <img 
                  src={avatarUrl} 
                  alt={user?.name || 'User'} 
                  className="w-full h-full object-cover"
                  onError={() => setAvatarError(true)}
                />
              ) : (
                <span className="text-white font-bold text-lg">{user?.name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold">Hello, {displayName} 👋</h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowSearchResults(false)}
              className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors"
            >
              <Search className="w-5 h-5 text-sky-600" />
            </button>
            <button 
              onClick={onNavigateToLibrary}
              className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors"
            >
              <Heart className="w-5 h-5 text-sky-600" />
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4 flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search here ..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
            />
            {searching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          <button
            onClick={handleVoiceSearch}
            className="w-12 h-12 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Mic className="w-5 h-5 text-sky-600" />
          </button>
        </div>

      </div>

      {/* Search Results */}
      {showSearchResults && (
        <div className="flex-1 px-4 pb-4">
          <h2 className="text-xl font-bold mb-4">Search Results</h2>
          {searchResults.length > 0 ? (
            <div className="space-y-3">
              {searchResults.map((song) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    onPlaySong(song)
                    setShowSearchResults(false)
                  }}
                  className="flex items-center space-x-3 p-3 rounded-xl hover:bg-sky-50 transition-colors cursor-pointer group border border-transparent hover:border-sky-100"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-sky-400 to-cyan-400 flex-shrink-0 shadow-md">
                    {song.cover_url ? (
                      <img src={song.cover_url} alt={song.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-gray-900">{song.title}</h3>
                    <p className="text-sm text-gray-600 truncate">{song.artist}</p>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-sky-100 hover:bg-sky-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-5 h-5 ml-0.5 text-sky-600" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {searching ? 'Searching...' : 'No results found'}
              </p>
              {!isAuthenticated && !searching && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm text-gray-500">
                    Connect Spotify for full access
                  </p>
                  <button
                    onClick={authorize}
                    className="px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-full hover:from-sky-600 hover:to-cyan-600 transition-colors shadow-md"
                  >
                    Connect Spotify
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content - Trending Playlists & Top Chart */}
      {!showSearchResults && (
        <>
          {/* Trending Playlist Section */}
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Trending playlist</h2>
            {loadingPlaylists ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : trendingPlaylists.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {trendingPlaylists.slice(0, 2).map((playlist) => (
                  <motion.div
                    key={playlist.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => handlePlayPlaylist(playlist)}
                    className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group"
                  >
                    {playlist.images?.[0]?.url ? (
                      <img 
                        src={playlist.images[0].url} 
                        alt={playlist.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-sky-400 to-cyan-400 flex items-center justify-center">
                        <Music2 className="w-16 h-16 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-white font-bold text-lg mb-1">{playlist.name}</h3>
                      <p className="text-white/80 text-sm">{playlist.owner?.display_name || 'Spotify'}</p>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors">
                        <Play className="w-5 h-5 text-gray-900 ml-0.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">
                  {!isAuthenticated ? 'Connect Spotify to see trending playlists' : 'No playlists found'}
                </p>
              </div>
            )}
          </div>

          {/* Top Chart Section */}
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Top Chart</h2>
            {loadingArtists ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : topArtists.length > 0 ? (
              <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                {topArtists.map((artist) => (
                  <motion.div
                    key={artist.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={() => {
                      // TODO: Navigate to artist page or play top track
                      console.log('Artist:', artist)
                    }}
                    className="flex-shrink-0 text-center cursor-pointer group"
                  >
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-sky-400 to-cyan-400 mb-2 shadow-md mx-auto">
                      {artist.images?.[0]?.url ? (
                        <img 
                          src={artist.images[0].url} 
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 className="w-12 h-12 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 truncate w-24">{artist.name}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music2 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 text-sm">
                  {loadingArtists 
                    ? 'Loading artists...' 
                    : !isAuthenticated 
                    ? 'Connect Spotify to see top artists' 
                    : 'No artists found'}
                </p>
                {!isAuthenticated && !loadingArtists && (
                  <button
                    onClick={authorize}
                    className="mt-3 px-4 py-2 bg-gradient-to-r from-sky-500 to-cyan-500 text-white rounded-full hover:from-sky-600 hover:to-cyan-600 transition-colors shadow-md text-sm"
                  >
                    Connect Spotify
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

