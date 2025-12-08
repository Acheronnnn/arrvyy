import { useState } from 'react'
import { LoginForm } from '@/components/Auth/LoginForm'
import { RegisterForm } from '@/components/Auth/RegisterForm'
import { SupabaseConfigWarning } from '@/components/SupabaseConfigWarning'

export function Login() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <SupabaseConfigWarning />
        {isLogin ? <LoginForm /> : <RegisterForm />}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary-600 hover:text-primary-700 font-medium text-sm"
          >
            {isLogin
              ? 'Belum punya akun? Daftar sekarang'
              : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  )
}

