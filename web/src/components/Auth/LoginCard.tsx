import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { AppleIcon } from '@/components/Icons/AppleIcon'
import { GoogleIcon } from '@/components/Icons/GoogleIcon'

export function LoginCard() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null)
  const { signIn, signInWithOAuth, user } = useAuth()
  const navigate = useNavigate()

  // Load remember me dari localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('arrvyy_remember_email')
    if (savedEmail) {
      setEmail(savedEmail)
      setRememberMe(true)
    }
  }, [])

  // Redirect jika sudah login (tapi tunggu sedikit untuk pastikan state sudah update)
  useEffect(() => {
    if (user) {
      // Delay kecil untuk pastikan state sudah benar-benar set
      const timer = setTimeout(() => {
        if (window.location.pathname !== '/home') {
          window.location.href = '/home'
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn(email, password)
      
      if (rememberMe) {
        localStorage.setItem('arrvyy_remember_email', email)
      } else {
        localStorage.removeItem('arrvyy_remember_email')
      }

      if (result?.user) {
        navigate('/home')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Gagal login. Cek email dan password kamu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-purple-200 relative overflow-hidden">
      {/* Background specks effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`,
              animation: `float ${Math.random() * 3 + 2}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
      `}</style>

      <div className="relative z-10 min-h-screen flex flex-col px-4 pt-12 pb-8">
        {/* Title Section - Top Left */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 max-w-md"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Let's
            <br />
            Explore
            <br />
            & Collect
            <br />
            Your Moments
          </h1>
        </motion.div>

        {/* Central Illustration - Center Right */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex-1 flex items-center justify-center md:justify-end mb-8"
        >
          <div className="w-48 h-48 md:w-64 md:h-64 relative">
            {/* 3D Robot Illustration Placeholder - bisa diganti dengan SVG/Image nanti */}
            <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400 flex items-center justify-center shadow-2xl relative overflow-hidden">
              {/* Robot Body */}
              <div className="absolute w-32 h-32 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center">
                {/* Robot Head */}
                <div className="absolute -top-8 w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full">
                  {/* Eyes */}
                  <div className="absolute top-4 left-4 w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <div className="absolute top-4 right-4 w-4 h-4 bg-yellow-400 rounded-full"></div>
                </div>
                {/* Umbrella */}
                <div className="absolute -right-4 top-8 w-16 h-16 bg-white rounded-full flex items-center justify-center">
                  <div className="w-12 h-12 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md mx-auto mb-4"
          >
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          </motion.div>
        )}

        {/* Email/Password Form - Show when "Sign In" clicked */}
        {showEmailForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md mx-auto mb-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3.5 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400 shadow-md"
                    placeholder="Email address"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-12 py-3.5 bg-white/90 backdrop-blur-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition text-gray-900 placeholder-gray-400 shadow-md"
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot Password
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-900 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>{loading ? 'Logging in...' : 'Login'}</span>
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          </motion.div>
        )}

        {/* Large Rounded Card - Bottom (Only for Social Login + Get Started) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md mx-auto mt-auto"
        >
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 md:p-8">
            {/* Social Login Buttons */}
            <div className="flex items-center space-x-3 mb-6">
              <button
                onClick={async () => {
                  setOauthLoading('apple')
                  setError('')
                  try {
                    // Apple login akan diimplementasikan nanti
                    alert('Apple login coming soon!')
                    setOauthLoading(null)
                  } catch (err: any) {
                    setError(err.message || 'Gagal login dengan Apple')
                    setOauthLoading(null)
                  }
                }}
                disabled={oauthLoading !== null}
                className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                title="Login dengan Apple"
              >
                {oauthLoading === 'apple' ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <AppleIcon className="w-7 h-7 text-white" />
                )}
              </button>
              <button
                onClick={async () => {
                  setOauthLoading('google')
                  setError('')
                  try {
                    await signInWithOAuth('google')
                  } catch (err: any) {
                    setError(err.message || 'Gagal login dengan Google')
                    setOauthLoading(null)
                  }
                }}
                disabled={oauthLoading !== null}
                className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                title="Login dengan Google"
              >
                {oauthLoading === 'google' ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <GoogleIcon className="w-7 h-7" />
                )}
              </button>
              {/* Get Started Button - Next to Social Buttons */}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="flex-1 bg-white border-2 border-gray-300 text-gray-900 py-3.5 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-1">Already have an account?</p>
              <button
                onClick={() => setShowEmailForm(!showEmailForm)}
                className="text-gray-900 hover:text-gray-700 font-semibold text-sm"
              >
                Sign In
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

