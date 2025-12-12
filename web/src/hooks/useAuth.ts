import { useState, useEffect } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { User } from '@/types'
import { getAccessibleUrl } from '@/lib/getAccessibleUrl'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null)

  useEffect(() => {
    let mounted = true
    let timeoutId: NodeJS.Timeout | null = null

    // Set timeout untuk memastikan loading tidak stuck
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth check timeout, setting loading to false')
        setLoading(false)
      }
    }, 5000) // 5 detik timeout

    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return
      
      if (timeoutId) clearTimeout(timeoutId)
      
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((error) => {
      console.error('Error getting session:', error)
      if (mounted) {
        if (timeoutId) clearTimeout(timeoutId)
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event, session?.user?.id)
      if (timeoutId) clearTimeout(timeoutId)
      
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        // Clear state when signed out
        setUser(null)
        setSupabaseUser(null)
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      if (timeoutId) clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      // Set timeout untuk fetch profile
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Fetch profile timeout')), 3000)
      })

      const fetchPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any

      if (error) throw error
      setUser(data as User)
      return data
    } catch (error) {
      console.error('Error fetching user profile:', error)
      // Tetap set loading false meskipun error
      throw error
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

    // Signup dengan OTP (bukan magic link)
    // Supabase akan kirim OTP code via email jika email template sudah di-setup
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        },
        // emailRedirectTo tetap diperlukan untuk fallback, tapi user akan pakai OTP code
        emailRedirectTo: `${getAccessibleUrl()}/verify-otp`,
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
      type: 'signup',
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

  const sendPasswordResetOTP = async (email: string) => {
    // Supabase tidak support type 'recovery' untuk OTP
    // Kita pakai resetPasswordForEmail yang akan kirim magic link
    // Link akan redirect ke /reset-password-otp dengan hash token
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAccessibleUrl()}/reset-password-otp`,
    })
    if (error) throw error
  }

  const verifyPasswordResetOTP = async (_email: string, token: string) => {
    // Untuk password reset, Supabase menggunakan magic link dengan hash token
    // Token dari email template adalah hash token panjang, bukan 6 digit OTP
    // Tapi kita bisa coba verify jika user input token dari email
    
    // Cek apakah token adalah hash token (panjang) atau OTP code (6 digit)
    if (token.length === 6) {
      // Ini adalah OTP code dari email template
      // Untuk password reset, kita perlu extract token dari URL hash
      // Atau user harus klik link dari email
      throw new Error('Untuk reset password, silakan klik link dari email. OTP code hanya untuk referensi.')
    }
    
    // Jika token panjang, coba verify sebagai hash token
    // Tapi untuk password reset, token harus dari URL hash, bukan dari input manual
    throw new Error('Token tidak valid. Silakan klik link dari email untuk reset password.')
  }

  const resendPasswordResetOTP = async (email: string) => {
    // Resend password reset email
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${getAccessibleUrl()}/reset-password-otp`,
    })
    if (error) throw error
  }

  const updatePassword = async (newPassword: string) => {
    // Cek apakah ada session
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      // Tidak ada session, coba reset password dengan OTP menggunakan Edge Function
      const otpVerified = localStorage.getItem('arrvyy_otp_verified')
      const otpEmail = localStorage.getItem('arrvyy_otp_email')
      const otpCode = localStorage.getItem('arrvyy_otp_code')
      
      if (otpVerified && otpEmail && otpCode) {
        // Reset password menggunakan Edge Function
        const { data, error } = await supabase.functions.invoke('reset-password-otp', {
          body: {
            email: otpEmail,
            otpCode: otpCode,
            newPassword: newPassword,
          },
        })
        
        if (error) throw error
        if (data?.error) throw new Error(data.error)
        
        // Clear OTP data
        localStorage.removeItem('arrvyy_otp_verified')
        localStorage.removeItem('arrvyy_otp_email')
        localStorage.removeItem('arrvyy_otp_code')
        
        return
      }
      
      throw new Error('Tidak ada session atau OTP verified. Silakan request reset password lagi.')
    }

    // Ada session, update password langsung
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })
    if (error) throw error
  }

  const signInWithOAuth = async (provider: 'google' | 'facebook') => {
    // Check jumlah user sebelum OAuth (maksimal 2 user)
    const userCount = await checkUserCount()
    if (userCount >= 2) {
      throw new Error('Aplikasi ini hanya untuk 2 user. Sudah mencapai batas maksimal.')
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getAccessibleUrl()}/auth/callback`,
      },
    })
    if (error) throw error
    return data
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
      const otherUserId = (otherUser as User).id
      const { error } = await (supabase.from('messages') as any)
        .delete()
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`)
      
      if (error) throw error
    }
  }

  const signOut = async () => {
    // Clear state first (optimistic update)
    setUser(null)
    setSupabaseUser(null)
    
    // Clear all localStorage items
    localStorage.removeItem('arrvyy_remember_email')
    localStorage.removeItem('arrvyy_verify_email')
    localStorage.removeItem('arrvyy_otp_verified')
    localStorage.removeItem('arrvyy_otp_email')
    localStorage.removeItem('arrvyy_otp_code')
    
    // Clear sessionStorage
    sessionStorage.clear()
    
    // Clear Supabase session storage (Chrome specific issue)
    try {
      // Clear Supabase auth storage
      const supabaseStorageKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      )
      supabaseStorageKeys.forEach(key => localStorage.removeItem(key))
      
      // Also clear from sessionStorage
      const supabaseSessionKeys = Object.keys(sessionStorage).filter(key => 
        key.startsWith('sb-') || key.includes('supabase')
      )
      supabaseSessionKeys.forEach(key => sessionStorage.removeItem(key))
    } catch (e) {
      console.warn('Error clearing Supabase storage:', e)
    }
    
    // Then try to sign out from Supabase (non-blocking)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.warn('Supabase signOut error (non-critical):', error)
        // Don't throw - we already cleared local state
      }
    } catch (error) {
      console.error('SignOut error:', error)
      // Don't throw - allow logout to proceed
    }
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
    signInWithOAuth,
    sendPasswordResetOTP,
    verifyPasswordResetOTP,
    resendPasswordResetOTP,
    updatePassword,
    fetchUserProfile,
  }
}

