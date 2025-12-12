import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  preview_url: string | null
  external_urls: {
    spotify: string
  }
  duration_ms: number
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[]
  }
}

interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: Array<{ url: string }>
  owner: {
    display_name: string
  }
  tracks: {
    total: number
  }
}

interface SpotifyArtist {
  id: string
  name: string
  images: Array<{ url: string }>
  popularity: number
}

interface SpotifyPlaylistsResponse {
  playlists: {
    items: SpotifyPlaylist[]
  }
}

interface SpotifyArtistsResponse {
  artists: {
    items: SpotifyArtist[]
  }
}

// Spotify API configuration
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || 'http://localhost:5173/auth/spotify/callback'

export function useSpotify() {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get access token from URL (after OAuth redirect)
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      const params = new URLSearchParams(hash.substring(1))
      const token = params.get('access_token')
      if (token) {
        setAccessToken(token)
        localStorage.setItem('spotify_access_token', token)
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname)
      }
    } else {
      // Try to get from localStorage
      const storedToken = localStorage.getItem('spotify_access_token')
      if (storedToken) {
        setAccessToken(storedToken)
      }
    }
  }, [])

  const searchTracks = useCallback(async (query: string): Promise<SpotifyTrack[]> => {
    if (!query.trim()) return []
    
    setLoading(true)
    setError(null)

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSpotify.ts:87',message:'searchTracks called',data:{query},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    // Variables for error tracking (declared outside try block for scope)
    let edgeError: any = null
    let isRateLimited = false
    let data: any = null

    try {
      // Try using Edge Function first (Client Credentials Flow - no auth needed)
      try {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSpotify.ts:96',message:'Invoking Edge Function',data:{query,method:'POST',body:{q:query,type:'track',limit:20}},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
        // #endregion

        // Retry logic with exponential backoff for rate limiting
        let retries = 0
        const maxRetries = 3
        data = null
        edgeError = null

        while (retries <= maxRetries) {
          const response = await supabase.functions.invoke('spotify-search', {
            method: 'POST',
            body: { q: query, type: 'track', limit: 20 },
          })

          data = response.data
          edgeError = response.error

          // Check for 429 rate limiting - Supabase error might be in context or message
          // Try to get status from multiple places
          let errorStatus: number | null = null
          if (edgeError) {
            errorStatus = (edgeError as any)?.status || 
                         (edgeError as any)?.context?.status ||
                         (edgeError as any)?.context?.statusCode ||
                         null
            
            // If context is a Response object, try to get status from it
            if (!errorStatus && (edgeError as any)?.context) {
              const context = (edgeError as any).context
              if (context instanceof Response) {
                errorStatus = context.status
              } else if (typeof context === 'object' && context.status) {
                errorStatus = context.status
              }
            }
          }
          
          // Also check if error message contains 429
          const errorMessage = (edgeError as any)?.message || ''
          isRateLimited = errorStatus === 429 || 
                         errorMessage.includes('429') ||
                         errorMessage.includes('Too Many Requests')

          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSpotify.ts:120',message:'Checking rate limit',data:{hasError:!!edgeError,errorStatus,isRateLimited,retries,maxRetries,errorMessage,contextType:typeof (edgeError as any)?.context},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'A'})}).catch(()=>{});
          // #endregion

          // If 429 (rate limited), wait and retry
          if (edgeError && isRateLimited && retries < maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000 // Exponential backoff: 1s, 2s, 4s
            console.warn(`Rate limited (429), retrying in ${waitTime}ms... (attempt ${retries + 1}/${maxRetries})`)
            await new Promise(resolve => setTimeout(resolve, waitTime))
            retries++
            continue
          }

          // If not 429 or max retries reached, break
          break
        }

        // #region agent log
        const errorDetails = edgeError ? {
          name: (edgeError as any).name,
          message: (edgeError as any).message,
          status: (edgeError as any).status,
          context: (edgeError as any).context,
          retries
        } : null
        fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSpotify.ts:132',message:'Edge Function response after retries',data:{hasError:!!edgeError,errorDetails,hasData:!!data,hasTracks:!!data?.tracks,itemsCount:data?.tracks?.items?.length||0,retries},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'E'})}).catch(()=>{});
        // #endregion

        // Log detailed error for debugging
        if (edgeError) {
          const errorObj = edgeError as any
          console.error('Edge Function error details:', {
            name: errorObj.name,
            message: errorObj.message,
            status: errorObj.status,
            context: errorObj.context,
            contextType: typeof errorObj.context,
            contextKeys: errorObj.context ? Object.keys(errorObj.context) : [],
            retries,
            fullError: JSON.stringify(errorObj, null, 2)
          })
          
          // Try to extract status from Response object in context
          if (errorObj.context && typeof errorObj.context === 'object') {
            try {
              // If context has status property
              if ('status' in errorObj.context) {
                console.log('Found status in context:', errorObj.context.status)
              }
              // If context is a Response-like object
              if (errorObj.context.status !== undefined) {
                console.log('Context status:', errorObj.context.status)
              }
            } catch (e) {
              console.warn('Could not parse context:', e)
            }
          }
        }

        if (!edgeError && data?.tracks?.items) {
          // #region agent log
          fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSpotify.ts:106',message:'Returning tracks from Edge Function',data:{count:data.tracks.items.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
          // #endregion
          return data.tracks.items
        }

        // #region agent log
        const errorDetails2 = edgeError ? {
          name: (edgeError as any).name,
          message: (edgeError as any).message,
          status: (edgeError as any).status,
          context: (edgeError as any).context
        } : null
        fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSpotify.ts:112',message:'Edge Function returned no data',data:{hasError:!!edgeError,errorDetails:errorDetails2,hasData:!!data,dataKeys:data?Object.keys(data):[],dataString:data?JSON.stringify(data).substring(0,200):null},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
      } catch (edgeErr: any) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSpotify.ts:115',message:'Edge Function exception',data:{error:edgeErr?.toString(),message:edgeErr?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
        // #endregion
        console.warn('Edge Function failed, trying direct API:', edgeErr)
      }

      // Fallback: Use direct API with access token if available
      if (accessToken) {
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSpotify.ts:120',message:'Trying direct API fallback',data:{hasAccessToken:!!accessToken},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion

        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        )

        if (response.ok) {
          const data: SpotifySearchResponse = await response.json()
          return data.tracks.items
        }
      }

      // If both fail, return empty
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/25dedc46-53b0-457e-b861-4b95567c7538',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'useSpotify.ts:195',message:'Both methods failed, returning empty',data:{hasAccessToken:!!accessToken,edgeErrorHad429:edgeError && (isRateLimited || (edgeError as any)?.message?.includes('429'))},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'F'})}).catch(()=>{});
      // #endregion
      
      // If rate limited, suggest connecting Spotify for better experience
      if (edgeError && (isRateLimited || (edgeError as any)?.message?.includes('429'))) {
        console.warn('Spotify API: Rate limited. Consider connecting Spotify for unlimited access.')
        setError('Rate limited. Please wait a moment or connect Spotify for better experience.')
      } else {
        console.warn('Spotify API: No authentication available. Please setup Edge Function or connect Spotify.')
      }
      return []
    } catch (err: any) {
      console.error('Error searching Spotify:', err)
      setError(err.message || 'Failed to search tracks')
      return []
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  const getTrackDetails = async (trackId: string): Promise<SpotifyTrack | null> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
          'Authorization': accessToken ? `Bearer ${accessToken}` : '',
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to get track details: ${response.statusText}`)
      }

      return await response.json()
    } catch (err: any) {
      console.error('Error getting track details:', err)
      setError(err.message || 'Failed to get track details')
      return null
    } finally {
      setLoading(false)
    }
  }

  const getTrendingPlaylists = useCallback(async (limit: number = 20): Promise<SpotifyPlaylist[]> => {
    setLoading(true)
    setError(null)

    try {
      // Try using Edge Function first
      try {
        const { data, error: edgeError } = await supabase.functions.invoke('spotify-search', {
          method: 'POST',
          body: { q: 'trending', type: 'playlist', limit },
        })

        if (!edgeError && data?.playlists?.items) {
          return data.playlists.items
        }
      } catch (edgeErr) {
        console.warn('Edge Function failed, trying direct API:', edgeErr)
      }

      // Fallback: Use direct API with access token if available
      if (accessToken) {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=trending&type=playlist&limit=${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        )

        if (response.ok) {
          const data: SpotifyPlaylistsResponse = await response.json()
          return data.playlists.items
        }
      }

      console.warn('Spotify API: No authentication available.')
      return []
    } catch (err: any) {
      console.error('Error fetching trending playlists:', err)
      setError(err.message || 'Failed to fetch playlists')
      return []
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  const getTopArtists = useCallback(async (limit: number = 20): Promise<SpotifyArtist[]> => {
    setLoading(true)
    setError(null)

    try {
      // Try using Edge Function first - search for popular artists
      try {
        // Retry logic for rate limiting
        let retries = 0
        const maxRetries = 2
        let data: any = null
        let edgeError: any = null

        while (retries <= maxRetries) {
          const response = await supabase.functions.invoke('spotify-search', {
            method: 'POST',
            body: { q: 'popular', type: 'artist', limit },
          })

          data = response.data
          edgeError = response.error

          if (edgeError && (edgeError as any).status === 429 && retries < maxRetries) {
            const waitTime = Math.pow(2, retries) * 1000
            await new Promise(resolve => setTimeout(resolve, waitTime))
            retries++
            continue
          }
          break
        }

        if (!edgeError && data?.artists?.items) {
          // Sort by popularity and return top artists
          return data.artists.items.sort((a: any, b: any) => b.popularity - a.popularity).slice(0, limit)
        }
      } catch (edgeErr) {
        console.warn('Edge Function failed, trying direct API:', edgeErr)
      }

      // Fallback: Use direct API with access token if available
      if (accessToken) {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=*&type=artist&limit=${limit}`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        )

        if (response.ok) {
          const data: SpotifyArtistsResponse = await response.json()
          // Sort by popularity and return top artists
          return data.artists.items.sort((a: any, b: any) => b.popularity - a.popularity).slice(0, limit)
        }
      }

      console.warn('Spotify API: No authentication available.')
      return []
    } catch (err: any) {
      console.error('Error fetching top artists:', err)
      setError(err.message || 'Failed to fetch artists')
      return []
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  const authorize = useCallback(() => {
    const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming'
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${SPOTIFY_CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(SPOTIFY_REDIRECT_URI)}&scope=${encodeURIComponent(scopes)}`
    window.location.href = authUrl
  }, [])

  return {
    accessToken,
    loading,
    error,
    searchTracks,
    getTrackDetails,
    getTrendingPlaylists,
    getTopArtists,
    authorize,
    isAuthenticated: !!accessToken,
  }
}

