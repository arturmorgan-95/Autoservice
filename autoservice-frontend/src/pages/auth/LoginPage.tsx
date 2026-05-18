import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Car, Lock, User, Eye, EyeOff, UserCircle, Briefcase } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { MountainBackground } from '../../components/layout/MountainBackground'
import { ROUTES } from '../../router/routes'
import toast from 'react-hot-toast'

type Tab = 'client' | 'employee'

export function LoginPage() {
  const { login } = useAuth()
  const [tab, setTab] = useState<Tab>('client')
  const [loginVal, setLoginVal] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleTabChange = (next: Tab) => {
    setTab(next)
    setLoginVal('')
    setPassword('')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!loginVal || !password) {
      toast.error('Введите логин и пароль')
      return
    }
    setLoading(true)
    try {
      await login({ login: loginVal, passwordHash: password })
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

        <div className="glass-card p-8">
          {/* Вкладки */}
          <div className="flex rounded-xl bg-white/5 p-1 mb-6 gap-1">
            <button
              type="button"
              onClick={() => handleTabChange('client')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'client'
                  ? 'bg-gradient-violet text-white shadow-neon-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <UserCircle size={16} />
              Клиент
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('employee')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === 'employee'
                  ? 'bg-gradient-violet text-white shadow-neon-sm'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              <Briefcase size={16} />
              Сотрудник
            </button>
          </div>

          <h2 className="text-xl font-semibold text-white mb-1">Вход в систему</h2>
          <p className="text-xs text-white/30 mb-6">
            {tab === 'client' ? 'Войдите как клиент или зарегистрируйтесь' : 'Вход для сотрудников автосервиса'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Логин</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={loginVal}
                  onChange={(e) => setLoginVal(e.target.value)}
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
              {loading && (
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {/* Ссылка на регистрацию — только для клиентов */}
          {tab === 'client' && (
            <div className="mt-5 text-center">
              <span className="text-sm text-white/30">Нет аккаунта? </span>
              <Link
                to={ROUTES.REGISTER}
                className="text-sm text-violet-light hover:text-violet-neon transition-colors font-medium"
              >
                Зарегистрироваться
              </Link>
            </div>
          )}

          {tab === 'employee' && (
            <p className="mt-5 text-center text-xs text-white/20">
              Аккаунт сотрудника создаётся администратором
            </p>
          )}
        </div>

        <div className="text-center mt-4 text-white/10 text-xs">
          Кавказские горы, 2026
        </div>
      </div>
    </div>
  )
}
