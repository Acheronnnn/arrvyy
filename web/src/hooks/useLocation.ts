import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { UserLocation } from '@/types'

export function useLocation(userId: string | undefined, partnerId: string | undefined) {
  const [myLocation, setMyLocation] = useState<UserLocation | null>(null)
  const [partnerLocation, setPartnerLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [distance, setDistance] = useState<number | null>(null)
  const [distanceToMyHome, setDistanceToMyHome] = useState<number | null>(null)
  const [distanceToPartnerHome, setDistanceToPartnerHome] = useState<number | null>(null)

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
  }, [])

  // Fetch locations
  const fetchLocations = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Fetch my location
      const { data: myLocData, error: myError } = await (supabase
        .from('user_locations') as any)
        .select('*')
        .eq('user_id', userId)
        .single()

      if (myError && myError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw myError
      }

      if (myLocData) {
        setMyLocation({
          id: myLocData.id,
          user_id: myLocData.user_id,
          latitude: Number(myLocData.latitude),
          longitude: Number(myLocData.longitude),
          address: myLocData.address,
          is_online: myLocData.is_online,
          last_updated_at: myLocData.last_updated_at,
          created_at: myLocData.created_at,
          home_latitude: myLocData.home_latitude ? Number(myLocData.home_latitude) : null,
          home_longitude: myLocData.home_longitude ? Number(myLocData.home_longitude) : null,
          home_address: myLocData.home_address,
        })
      }

      // Fetch partner location if partner exists
      let partnerLocData: any = null
      if (partnerId) {
        const { data, error: partnerError } = await (supabase
          .from('user_locations') as any)
          .select('*')
          .eq('user_id', partnerId)
          .single()

        if (partnerError && partnerError.code !== 'PGRST116') {
          throw partnerError
        }

        if (data) {
          partnerLocData = data
          setPartnerLocation({
            id: data.id,
            user_id: data.user_id,
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            address: data.address,
            is_online: data.is_online,
            last_updated_at: data.last_updated_at,
            created_at: data.created_at,
            home_latitude: data.home_latitude ? Number(data.home_latitude) : null,
            home_longitude: data.home_longitude ? Number(data.home_longitude) : null,
            home_address: data.home_address,
          })
        } else {
          setPartnerLocation(null)
        }
      } else {
        setPartnerLocation(null)
      }

      // Calculate distances
      if (myLocData && partnerLocData) {
        // Distance between current locations
        const dist = calculateDistance(
          Number(myLocData.latitude),
          Number(myLocData.longitude),
          Number(partnerLocData.latitude),
          Number(partnerLocData.longitude)
        )
        setDistance(dist)

        // Distance to my home
        if (myLocData.home_latitude && myLocData.home_longitude) {
          const distToMyHome = calculateDistance(
            Number(myLocData.latitude),
            Number(myLocData.longitude),
            Number(myLocData.home_latitude),
            Number(myLocData.home_longitude)
          )
          setDistanceToMyHome(distToMyHome)
        } else {
          setDistanceToMyHome(null)
        }

        // Distance to partner home
        if (partnerLocData.home_latitude && partnerLocData.home_longitude) {
          const distToPartnerHome = calculateDistance(
            Number(partnerLocData.latitude),
            Number(partnerLocData.longitude),
            Number(partnerLocData.home_latitude),
            Number(partnerLocData.home_longitude)
          )
          setDistanceToPartnerHome(distToPartnerHome)
        } else {
          setDistanceToPartnerHome(null)
        }
      } else {
        setDistance(null)
        setDistanceToMyHome(null)
        setDistanceToPartnerHome(null)
      }
    } catch (err: any) {
      console.error('Error fetching locations:', err)
      setError(err.message || 'Failed to fetch locations')
    } finally {
      setLoading(false)
    }
  }, [userId, partnerId, calculateDistance])

  // Update my location
  const updateMyLocation = useCallback(async (latitude: number, longitude: number, address?: string) => {
    if (!userId) return

    try {
      const { error } = await (supabase
        .from('user_locations') as any)
        .upsert({
          user_id: userId,
          latitude,
          longitude,
          address: address || null,
          is_online: true,
          last_updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })

      if (error) throw error

      // Update local state
      setMyLocation(prev => ({
        id: prev?.id || '',
        user_id: userId,
        latitude,
        longitude,
        address: address || null,
        is_online: true,
        last_updated_at: new Date().toISOString(),
        home_latitude: prev?.home_latitude || null,
        home_longitude: prev?.home_longitude || null,
        home_address: prev?.home_address || null,
      }))

      // Recalculate distance
      if (partnerLocation) {
        const dist = calculateDistance(latitude, longitude, partnerLocation.latitude, partnerLocation.longitude)
        setDistance(dist)
      }
    } catch (err: any) {
      console.error('Error updating location:', err)
      setError(err.message || 'Failed to update location')
    }
  }, [userId, partnerLocation, calculateDistance])

  // Set home location
  const setHomeLocation = useCallback(async (latitude: number, longitude: number, address?: string) => {
    if (!userId) return

    try {
      const { error } = await (supabase
        .from('user_locations') as any)
        .update({
          home_latitude: latitude,
          home_longitude: longitude,
          home_address: address || null,
        })
        .eq('user_id', userId)

      if (error) throw error

      // Update local state
      setMyLocation(prev => prev ? {
        ...prev,
        home_latitude: latitude,
        home_longitude: longitude,
        home_address: address || null,
      } : null)

      // Recalculate distance to home
      if (myLocation) {
        const dist = calculateDistance(
          myLocation.latitude,
          myLocation.longitude,
          latitude,
          longitude
        )
        setDistanceToMyHome(dist)
      }
    } catch (err: any) {
      console.error('Error setting home location:', err)
      setError(err.message || 'Failed to set home location')
      throw err
    }
  }, [userId, myLocation, calculateDistance])

  // Get current location from browser
  const getCurrentLocation = useCallback((): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          reject(error)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }, [])

  // Realtime subscriptions
  useEffect(() => {
    if (!userId) return

    fetchLocations()

    // Subscribe to my location changes
    const mySubscription = supabase
      .channel('user_locations_my_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_locations',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchLocations()
        }
      )
      .subscribe()

    // Subscribe to partner location changes
    let partnerSubscription: RealtimeChannel | null = null
    if (partnerId) {
      partnerSubscription = supabase
        .channel('user_locations_partner_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_locations',
            filter: `user_id=eq.${partnerId}`,
          },
          () => {
            fetchLocations()
          }
        )
        .subscribe()
    }

    return () => {
      mySubscription.unsubscribe()
      if (partnerSubscription) {
        partnerSubscription.unsubscribe()
      }
    }
  }, [userId, partnerId, fetchLocations])

  // Auto-update location every 30 seconds (only if user has given permission)
  useEffect(() => {
    if (!userId) return

    let updateInterval: NodeJS.Timeout | null = null

    const startAutoUpdate = async () => {
      try {
        // Try to get location once to check permission
        const { latitude, longitude } = await getCurrentLocation()
        await updateMyLocation(latitude, longitude)
        
        // If successful, start interval
        updateInterval = setInterval(async () => {
          try {
            const { latitude, longitude } = await getCurrentLocation()
            await updateMyLocation(latitude, longitude)
          } catch (err) {
            console.error('Error auto-updating location:', err)
            // Stop interval if permission denied
            if (err instanceof GeolocationPositionError && err.code === 1) {
              if (updateInterval) clearInterval(updateInterval)
            }
          }
        }, 30000) // Update every 30 seconds
      } catch (err) {
        console.error('Error getting initial location for auto-update:', err)
        // Don't start interval if permission denied
      }
    }

    startAutoUpdate()

    return () => {
      if (updateInterval) clearInterval(updateInterval)
    }
  }, [userId, getCurrentLocation, updateMyLocation])

  return {
    myLocation,
    partnerLocation,
    distance,
    distanceToMyHome,
    distanceToPartnerHome,
    loading,
    error,
    updateMyLocation,
    setHomeLocation,
    getCurrentLocation,
    refreshLocations: fetchLocations,
  }
}
