import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export function ResetPasswordOTP() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [email, setEmail] = useState('')
  const [countdown, setCountdown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { verifyPasswordResetOTP, resendPasswordResetOTP } = useAuth()

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email')
    const savedEmail = localStorage.getItem('arrvyy_reset_email')
    
    if (emailParam) {
      setEmail(emailParam)
      localStorage.setItem('arrvyy_reset_email', emailParam)
    } else if (savedEmail) {
      setEmail(savedEmail)
    } else {
      navigate('/forgot-password')
    }
  }, [searchParams, navigate])

  useEffect(() => {
    // Countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [countdown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only numbers

    const newOtp = [...otp]
    newOtp[index] = value.slice(-1) // Only take last character
    setOtp(newOtp)
    setError('')

    // Auto focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').slice(0, 6)
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''))
      setOtp(newOtp.slice(0, 6))
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus()
    }
  }

  useEffect(() => {
    // Cek apakah ada token di URL hash dari email link
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')
    
    if (accessToken && refreshToken && type === 'recovery') {
      // User sudah klik link dari email, set session dan redirect
      const setSession = async () => {
        const { supabase } = await import('@/lib/supabase')
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (!error) {
          navigate('/reset-password')
        }
      }
      setSession()
    }
  }, [navigate])

  const handleVerify = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) {
      setError('Masukkan 6 digit kode OTP')
      return
    }

    setError('')
    setLoading(true)

    try {
      // Cek apakah ada token di URL hash (user klik link dari email)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')
      
      if (accessToken && refreshToken) {
        // User sudah klik link, set session dan redirect
        const { supabase } = await import('@/lib/supabase')
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })
        if (error) throw error
        
        navigate('/reset-password')
        return
      }
      
      // Jika tidak ada hash, user input OTP code
      // Kita simpan flag bahwa OTP sudah verified
      // Lalu redirect ke reset password
      localStorage.setItem('arrvyy_otp_verified', 'true')
      localStorage.setItem('arrvyy_otp_email', email)
      localStorage.setItem('arrvyy_otp_code', otpCode)
      
      // Redirect ke reset password
      navigate('/reset-password')
    } catch (err: any) {
      console.error('OTP verification error:', err)
      setError(err.message || 'Kode OTP tidak valid. Coba lagi.')
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0) return

    setResending(true)
    setError('')

    try {
      // Resend OTP untuk password reset
      await resendPasswordResetOTP(email)

      setCountdown(60) // 60 seconds countdown
    } catch (err: any) {
      setError(err.message || 'Gagal mengirim ulang kode. Coba lagi.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Back Button */}
      <div className="p-4">
        <button
          onClick={() => navigate('/forgot-password')}
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
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify OTP</h1>
            <p className="text-gray-600 text-sm mb-2">
              Kami telah mengirim kode OTP ke
            </p>
            <p className="text-gray-900 font-semibold">{email}</p>
          </div>

          <div className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* OTP Input */}
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-14 text-center text-2xl font-semibold bg-white border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500 outline-none transition text-gray-900"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.join('').length !== 6}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Verifying...
                </>
              ) : (
                'Verify'
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center">
              <p className="text-gray-600 text-sm mb-2">Tidak menerima kode?</p>
              <button
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? (
                  'Mengirim...'
                ) : countdown > 0 ? (
                  `Kirim ulang dalam ${countdown}s`
                ) : (
                  'Kirim ulang kode'
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

