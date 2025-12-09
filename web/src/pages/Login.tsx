import { useLocation } from 'react-router-dom'
import { LoginCard } from '@/components/Auth/LoginCard'
import { RegisterCard } from '@/components/Auth/RegisterCard'
import { SupabaseConfigWarning } from '@/components/SupabaseConfigWarning'

export function Login() {
  const location = useLocation()
  const isRegister = location.pathname === '/register'

  return (
    <div className="min-h-screen">
      <SupabaseConfigWarning />
      {isRegister ? (
        <RegisterCard />
      ) : (
        <LoginCard />
      )}
    </div>
  )
}

