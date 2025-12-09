import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, Users } from 'lucide-react'
import { FacebookIcon } from '@/components/Icons/FacebookIcon'
import { GoogleIcon } from '@/components/Icons/GoogleIcon'

export function RegisterForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null)
  const [userCount, setUserCount] = useState<number | null>(null)
  const { signUp, signInWithOAuth, checkUserCount } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Check jumlah user saat component mount
    checkUserCount().then(count => {
      setUserCount(count)
    }).catch(() => {
      // Ignore error
    })
  }, [checkUserCount])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Password tidak cocok')
      return
    }

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    try {
      // Check user count dulu
      const count = await checkUserCount()
      if (count >= 2) {
        setError('Aplikasi ini hanya untuk 2 user. Sudah mencapai batas maksimal. Silakan login dengan akun yang sudah ada.')
        setLoading(false)
        return
      }

      await signUp(email, password, name)
      
      // Save email untuk OTP verification
      localStorage.setItem('arrvyy_verify_email', email)
      
      // Redirect ke OTP verification
      navigate(`/verify-otp?email=${encodeURIComponent(email)}`)
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/login')}
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600 text-sm">
              Create a new account to get started and enjoy seamless access to our features.
            </p>
            {userCount !== null && (
              <div className="mt-3 flex items-center justify-center space-x-2 text-sm">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">
                  {userCount}/2 user terdaftar
                </span>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Name Field */}
            <div>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 placeholder-gray-400"
                  placeholder="Name"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 placeholder-gray-400"
                  placeholder="Email address"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 placeholder-gray-400"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition text-gray-900 placeholder-gray-400"
                  placeholder="Confirm Password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <span className="text-gray-600 text-sm">Already have an account? </span>
            <button
              onClick={() => navigate('/login')}
              className="text-green-600 hover:text-green-700 font-medium text-sm"
            >
              Sign In here
            </button>
          </div>

          {/* Social Login (Optional) */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or Continue With Account</span>
              </div>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={async () => {
                  setOauthLoading('facebook')
                  setError('')
                  try {
                    await signInWithOAuth('facebook')
                  } catch (err: any) {
                    setError(err.message || 'Gagal daftar dengan Facebook')
                    setOauthLoading(null)
                  }
                }}
                disabled={oauthLoading !== null}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                title="Daftar dengan Facebook"
              >
                {oauthLoading === 'facebook' ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FacebookIcon className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={async () => {
                  setOauthLoading('google')
                  setError('')
                  try {
                    await signInWithOAuth('google')
                  } catch (err: any) {
                    setError(err.message || 'Gagal daftar dengan Google')
                    setOauthLoading(null)
                  }
                }}
                disabled={oauthLoading !== null}
                className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                title="Daftar dengan Google"
              >
                {oauthLoading === 'google' ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <GoogleIcon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
