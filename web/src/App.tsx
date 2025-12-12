import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { Login } from './pages/Login'
import { Chat } from './pages/Chat'
import { Home } from './pages/Home'
import { ForgotPassword } from './pages/ForgotPassword'
import { OTPVerification } from './pages/OTPVerification'
import { ResetPasswordOTP } from './pages/ResetPasswordOTP'
import { ResetPassword } from './pages/ResetPassword'
import { Loader2 } from 'lucide-react'
import { supabase } from './lib/supabase'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
      </div>
    )
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />
}

// Handle email confirmation and OAuth callback
function AuthCallback() {
  const { user } = useAuth()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Handle OAuth callback (from query params)
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get('code')
      
      if (code) {
        // OAuth callback - exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error && data.session) {
          window.location.href = '/home'
          return
        }
      }

      // Handle email confirmation (from hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      const type = hashParams.get('type')

      if (accessToken && refreshToken) {
        // Set session dari URL hash
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (!error) {
          // Jika type recovery, redirect ke reset password
          if (type === 'recovery') {
            window.location.href = '/reset-password'
          } else {
            // Redirect ke home setelah session di-set
            window.location.href = '/home'
          }
        }
      }
    }

    handleAuthCallback()
  }, [])

  if (user) {
    return <Navigate to="/home" replace />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 text-sky-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Memproses autentikasi...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<OTPVerification />} />
        <Route path="/reset-password-otp" element={<ResetPasswordOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

