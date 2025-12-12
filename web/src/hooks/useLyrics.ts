import { useState } from 'react'

// interface LyricsResponse {
//   lyrics: string[]
//   synced?: boolean
// }

export function useLyrics() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchLyrics = async (title: string, artist: string): Promise<string[]> => {
    setLoading(true)
    setError(null)

    try {
      // Try Lyrics.ovh API (free, no API key needed)
      const response = await fetch(
        `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`
      )

      if (response.ok) {
        const data = await response.json()
        if (data.lyrics) {
          // Split lyrics into lines
          const lines = data.lyrics
            .split('\n')
            .map((line: string) => line.trim())
            .filter((line: string) => line.length > 0)
          return lines
        }
      }

      // Fallback: Return placeholder lyrics
      return [
        `${title} by ${artist}`,
        'Lyrics not available',
        'Please check back later',
      ]
    } catch (err: any) {
      console.error('Error fetching lyrics:', err)
      setError(err.message || 'Failed to fetch lyrics')
      
      // Return placeholder
      return [
        `${title} by ${artist}`,
        'Lyrics not available',
        'Please check back later',
      ]
    } finally {
      setLoading(false)
    }
  }

  return {
    fetchLyrics,
    loading,
    error,
  }
}

