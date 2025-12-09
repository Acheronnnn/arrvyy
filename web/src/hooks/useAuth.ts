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

  const checkUserCount = async (): Promise<number> => {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (error) throw error
    return count || 0
  }

  const signUp = async (email: string, password: string, name: string) => {
    // Check jumlah user sebelum register (maksimal 2 user)
    const userCount = await checkUserCount()
    if (userCount >= 2) {
      throw new Error('Aplikasi ini hanya untuk 2 user. Sudah mencapai batas maksimal.')
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        emailRedirectTo: `${window.location.origin}/verify-otp`,
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

  const verifyOTP = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    if (error) throw error
    return data
  }

  const resendOTP = async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    if (error) throw error
  }

  const deleteAccount = async () => {
    if (!user) throw new Error('Tidak ada user yang login')
    
    // Hapus semua pesan user
    const { error: messagesError } = await (supabase.from('messages') as any)
      .delete()
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    
    if (messagesError) throw messagesError
    
    // Hapus user profile
    const { error: userError } = await (supabase.from('users') as any)
      .delete()
      .eq('id', user.id)
    
    if (userError) throw userError
    
    // Sign out (auth user tetap ada di Supabase, tapi profile sudah dihapus)
    await signOut()
  }

  const resetChat = async () => {
    if (!user) throw new Error('Tidak ada user yang login')
    
    // Hapus semua pesan antara current user dan other user
    const { data: otherUser } = await supabase
      .from('users')
      .select('*')
      .neq('id', user.id)
      .limit(1)
      .single()
    
    if (otherUser) {
      await (supabase.from('messages') as any)
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${user.id})`)
    }
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
    deleteAccount,
    resetChat,
    checkUserCount,
    verifyOTP,
    resendOTP,
  }
}

