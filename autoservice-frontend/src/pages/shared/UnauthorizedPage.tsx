import { useNavigate } from 'react-router-dom'
import { ShieldOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_ROUTES } from '../../utils/roleConstants'

export function UnauthorizedPage() {
  const navigate = useNavigate()
  const { roleName, logout } = useAuth()

  const goHome = () => {
    const route = (roleName && ROLE_ROUTES[roleName]) ?? '/login'
    navigate(route)
  }

  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <ShieldOff size={48} className="text-rose-accent/60 mb-4" />
      <h1 className="text-2xl font-bold text-white mb-2">Доступ запрещён</h1>
      <p className="text-white/50 mb-6">У вас нет прав для просмотра этой страницы</p>
      <div className="flex gap-3">
        <button onClick={goHome} className="btn-primary">На главную</button>
        <button onClick={logout} className="btn-secondary">Выйти</button>
      </div>
    </div>
  )
}
