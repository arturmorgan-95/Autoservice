import { useNavigate } from 'react-router-dom'
import { Home, AlertTriangle } from 'lucide-react'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <AlertTriangle size={48} className="text-amber-accent/60 mb-4" />
      <h1 className="text-4xl font-bold neon-text mb-2">404</h1>
      <p className="text-white/50 mb-6">Страница не найдена</p>
      <button onClick={() => navigate(-1)} className="btn-primary flex items-center gap-2">
        <Home size={16} /> Назад
      </button>
    </div>
  )
}
