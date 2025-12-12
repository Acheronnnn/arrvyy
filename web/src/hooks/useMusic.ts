import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Playlist, Song, LikedSong } from '@/types'

export function useMusic(userId: string | undefined) {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [likedSongs, setLikedSongs] = useState<LikedSong[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    fetchPlaylists()
    fetchLikedSongs()

    // Realtime subscriptions
    const playlistsSub = supabase
      .channel('playlists_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'playlists',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchPlaylists()
      )
      .subscribe()

    const likedSongsSub = supabase
      .channel('liked_songs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'liked_songs',
          filter: `user_id=eq.${userId}`,
        },
        () => fetchLikedSongs()
      )
      .subscribe()

    return () => {
      playlistsSub.unsubscribe()
      likedSongsSub.unsubscribe()
    }
  }, [userId])

  const fetchPlaylists = async () => {
    if (!userId) return

    try {
      const { data, error: fetchError } = await supabase
        .from('playlists')
        .select(`
          *,
          playlist_songs(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const playlistsWithCount = (data || []).map((playlist: any) => ({
        ...playlist,
        song_count: playlist.playlist_songs?.[0]?.count || 0,
      }))

      setPlaylists(playlistsWithCount)
    } catch (err: any) {
      console.error('Error fetching playlists:', err)
      setError(err.message)
    }
  }

  const fetchLikedSongs = async () => {
    if (!userId) return

    try {
      const { data, error: fetchError } = await supabase
        .from('liked_songs')
        .select(`
          *,
          songs (*)
        `)
        .eq('user_id', userId)
        .order('liked_at', { ascending: false })

      if (fetchError) throw fetchError

      setLikedSongs((data || []) as LikedSong[])
    } catch (err: any) {
      console.error('Error fetching liked songs:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPlaylist = async (title: string, description?: string, coverUrl?: string) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      const { data, error: createError } = await supabase
        .from('playlists')
        .insert({
          user_id: userId,
          title,
          description,
          cover_url: coverUrl,
        } as any)
        .select()
        .single()

      if (createError) throw createError

      await fetchPlaylists()
      return data
    } catch (err: any) {
      console.error('Error creating playlist:', err)
      throw err
    }
  }

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    try {
      // First, ensure song exists in songs table
      let songId = song.id

      if (song.spotify_id) {
        const { data: existingSong } = await supabase
          .from('songs')
          .select('id')
          .eq('spotify_id', song.spotify_id)
          .single()

        if (existingSong) {
          songId = (existingSong as any).id
        } else {
          // Create song record
          const { data: newSong, error: songError } = await supabase
            .from('songs')
            .insert({
              spotify_id: song.spotify_id,
              title: song.title,
              artist: song.artist,
              album: song.album,
              cover_url: song.cover_url,
              preview_url: song.preview_url,
              duration_ms: song.duration_ms,
              external_url: song.external_url,
            } as any)
            .select()
            .single()

          if (songError) throw songError
          songId = (newSong as any).id
        }
      }

      // Get current max order_index
      const { data: maxOrder } = await supabase
        .from('playlist_songs')
        .select('order_index')
        .eq('playlist_id', playlistId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single()

      const orderIndex = ((maxOrder as any)?.order_index || -1) + 1

      // Add to playlist
      const { error: addError } = await supabase
        .from('playlist_songs')
        .insert({
          playlist_id: playlistId,
          song_id: songId,
          order_index: orderIndex,
        } as any)

      if (addError) throw addError

      await fetchPlaylists()
    } catch (err: any) {
      console.error('Error adding song to playlist:', err)
      throw err
    }
  }

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      const { error } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('playlist_id', playlistId)
        .eq('song_id', songId)

      if (error) throw error

      await fetchPlaylists()
    } catch (err: any) {
      console.error('Error removing song from playlist:', err)
      throw err
    }
  }

  const deletePlaylist = async (playlistId: string) => {
    try {
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)

      if (error) throw error

      await fetchPlaylists()
    } catch (err: any) {
      console.error('Error deleting playlist:', err)
      throw err
    }
  }

  const likeSong = async (song: Song) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      // Ensure song exists
      let songId = song.id

      if (song.spotify_id) {
        const { data: existingSong } = await supabase
          .from('songs')
          .select('id')
          .eq('spotify_id', song.spotify_id)
          .single()

        if (existingSong) {
          songId = (existingSong as any).id
        } else {
          const { data: newSong, error: songError } = await supabase
            .from('songs')
            .insert({
              spotify_id: song.spotify_id,
              title: song.title,
              artist: song.artist,
              album: song.album,
              cover_url: song.cover_url,
              preview_url: song.preview_url,
              duration_ms: song.duration_ms,
              external_url: song.external_url,
            } as any)
            .select()
            .single()

          if (songError) throw songError
          songId = (newSong as any).id
        }
      }

      const { error: likeError } = await supabase
        .from('liked_songs')
        .insert({
          user_id: userId,
          song_id: songId,
        } as any)

      if (likeError && likeError.code !== '23505') throw likeError // Ignore duplicate

      await fetchLikedSongs()
    } catch (err: any) {
      console.error('Error liking song:', err)
      throw err
    }
  }

  const unlikeSong = async (songId: string) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('liked_songs')
        .delete()
        .eq('user_id', userId)
        .eq('song_id', songId)

      if (error) throw error

      await fetchLikedSongs()
    } catch (err: any) {
      console.error('Error unliking song:', err)
      throw err
    }
  }

  const isSongLiked = (songId: string): boolean => {
    return likedSongs.some((liked) => liked.song_id === songId)
  }

  return {
    playlists,
    likedSongs,
    loading,
    error,
    createPlaylist,
    addSongToPlaylist,
    removeSongFromPlaylist,
    deletePlaylist,
    likeSong,
    unlikeSong,
    isSongLiked,
    refreshPlaylists: fetchPlaylists,
    refreshLikedSongs: fetchLikedSongs,
  }
}

