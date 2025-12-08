import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data as User)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      // Jika user belum confirm email
      if (error.message.includes('Email not confirmed')) {
        throw new Error('Email belum dikonfirmasi. Cek email kamu dan klik link konfirmasi.')
      }
      throw error
    }
    
    // Pastikan user profile ada setelah login
    if (data?.user) {
      try {
        await fetchUserProfile(data.user.id)
      } catch (err) {
        console.warn('Profile fetch warning:', err)
      }
    }
    
    return data
  }

  const signUp = async (email: string, password: string, name: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: `${window.location.origin}/chat`,
      },
    })
    if (error) throw error

    // Profile akan dibuat otomatis oleh trigger handle_new_user
    // Jika trigger gagal, coba create manual
    if (data.user) {
      try {
        const { error: profileError } = await (supabase
          .from('users') as any)
          .insert({
            id: data.user.id,
            email,
            name,
          })
        // Ignore error jika sudah ada (dibuat oleh trigger)
        if (profileError && !profileError.message.includes('duplicate')) {
          console.warn('Profile creation warning:', profileError)
        }
      } catch (err) {
        // Trigger mungkin sudah membuat profile
        console.warn('Profile may already exist:', err)
      }
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return {
    user,
    supabaseUser,
    loading,
    signIn,
    signUp,
    signOut,
  }
}

