import { useState, type FormEvent } from 'react'
import { Car, Lock, User, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { MountainBackground } from '../../components/layout/MountainBackground'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { login } = useAuth()
  const [login_, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!login_ || !password) {
      toast.error('Введите логин и пароль')
      return
    }
    setLoading(true)
    try {
      await login({ login: login_, passwordHash: password })
    } catch {
      toast.error('Неверный логин или пароль')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <MountainBackground />

      <div className="w-full max-w-md animate-fade-in">
        {/* Логотип */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-violet shadow-neon-violet mb-4">
            <Car size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold neon-text mb-1">МастерАвто</h1>
          <p className="text-white/40 text-sm">CRM система управления автосервисом</p>
        </div>

        {/* Форма */}
        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Вход в систему</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Логин</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={login_}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="Введите логин"
                  className="input-glass pl-9"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Пароль</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  className="input-glass pl-9 pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : null}
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          <p className="text-center text-xs text-white/20 mt-6">
            Автосервис «МастерАвто» — система управления заявками
          </p>
        </div>

        {/* Декоративные горы внизу */}
        <div className="text-center mt-4 text-white/10 text-xs">
          Кавказские горы, 2026
        </div>
      </div>
    </div>
  )
}
