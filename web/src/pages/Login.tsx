import { useLocation } from 'react-router-dom'
import { LoginForm } from '@/components/Auth/LoginForm'
import { RegisterForm } from '@/components/Auth/RegisterForm'
import { SupabaseConfigWarning } from '@/components/SupabaseConfigWarning'

export function Login() {
  const location = useLocation()
  const isRegister = location.pathname === '/register'

  return (
    <div className="min-h-screen bg-gray-50">
      <SupabaseConfigWarning />
      {isRegister ? <RegisterForm /> : <LoginForm />}
    </div>
  )
}

