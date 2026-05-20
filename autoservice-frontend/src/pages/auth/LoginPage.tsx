import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Car, Lock, User, Eye, EyeOff, UserCircle, Briefcase } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { MountainBackground } from '../../components/layout/MountainBackground'
import { ROUTES } from '../../router/routes'
import { ROLE_NAMES, ROLE_ROUTES } from '../../utils/roleConstants'
import toast from 'react-hot-toast'

const CLIENT_ROLES = [ROLE_NAMES.CLIENT]
const EMPLOYEE_ROLES = [ROLE_NAMES.ADMIN, ROLE_NAMES.MASTER, ROLE_NAMES.ACCOUNTING, ROLE_NAMES.DIRECTOR]

type Tab = 'client' | 'employee'

export function LoginPage() {
  const { login } = useAuth()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const u = JSON.parse(stored)
        const roleName = u?.role?.roleName ?? ''
        if (!ROLE_ROUTES[roleName]) {
          localStorage.removeItem('user')
        }
      }
    } catch {
      localStorage.removeItem('user')
    }
  }, [])
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
      const allowedRoles = tab === 'client' ? CLIENT_ROLES : EMPLOYEE_ROLES
      await login({ login: loginVal, passwordHash: password }, allowedRoles)
    } catch (err: any) {
      if (err?.message === 'role_mismatch') {
        toast.error(tab === 'client'
          ? 'Этот аккаунт не является клиентом. Используйте вкладку «Сотрудник».'
          : 'Этот аккаунт не является сотрудником. Используйте вкладку «Клиент».'
        )
      } else {
        toast.error('Неверный логин или пароль')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <style>{`
        @keyframes float-car { 0%,100%{transform:translateY(0px) rotate(-1deg)} 50%{transform:translateY(-18px) rotate(1deg)} }
        @keyframes float-moon { 0%,100%{transform:translateY(0px) rotate(3deg)} 50%{transform:translateY(-12px) rotate(-2deg)} }
        .anim-car  { animation: float-car  5s ease-in-out infinite; }
        .anim-moon { animation: float-moon 7s ease-in-out infinite; }
      `}</style>
      <MountainBackground />

      <div className="hidden lg:block absolute left-12 top-1/2 -translate-y-1/2 anim-car">
        <div className="mb-4 text-center px-2" style={{ filter: 'drop-shadow(0 0 10px rgba(139,92,246,0.7))' }}>
          <p className="text-white font-bold leading-tight tracking-wide"
            style={{ fontSize: '15px', textShadow: '0 0 12px rgba(139,92,246,1), 0 0 24px rgba(139,92,246,0.6)' }}>
            ЧЕМ ВЫШЕ ГОРЫ,
          </p>
          <p className="text-white font-bold leading-tight tracking-wide"
            style={{ fontSize: '15px', textShadow: '0 0 12px rgba(139,92,246,1), 0 0 24px rgba(139,92,246,0.6)' }}>
            ТЕМ НИЖЕ ПРИОРЫ
          </p>
          <p className="text-white/40 italic mt-1" style={{ fontSize: '11px' }}>
            — Министр внутренних дел
          </p>
        </div>
        <div style={{ filter: 'drop-shadow(0 0 18px rgba(139,92,246,0.5))' }}>
        <svg width="300" height="125" viewBox="0 0 300 125" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22,105 L22,78 L38,70 L76,65 L104,36 L122,23 L186,21 L213,30 L243,58 L263,62 L273,74 L273,105 Z"
            fill="rgba(89,50,180,0.18)" stroke="rgba(139,92,246,0.75)" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M108,38 L123,24 L184,22 L209,32 L237,59 L109,59 Z"
            fill="rgba(59,130,246,0.15)" stroke="rgba(139,92,246,0.35)" strokeWidth="1"/>
          <line x1="166" y1="22" x2="166" y2="59" stroke="rgba(139,92,246,0.55)" strokeWidth="2"/>
          <line x1="166" y1="59" x2="164" y2="103" stroke="rgba(139,92,246,0.2)" strokeWidth="1"/>
          <path d="M28,84 L262,82" stroke="rgba(139,92,246,0.3)" strokeWidth="1" strokeDasharray="4 3"/>
          <circle cx="229" cy="105" r="22" fill="#090920" stroke="rgba(139,92,246,0.8)" strokeWidth="2"/>
          <circle cx="229" cy="105" r="12" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5"/>
          <circle cx="229" cy="105" r="4" fill="rgba(139,92,246,0.7)"/>
          <circle cx="72" cy="105" r="22" fill="#090920" stroke="rgba(139,92,246,0.8)" strokeWidth="2"/>
          <circle cx="72" cy="105" r="12" fill="none" stroke="rgba(139,92,246,0.4)" strokeWidth="1.5"/>
          <circle cx="72" cy="105" r="4" fill="rgba(139,92,246,0.7)"/>
          <ellipse cx="268" cy="74" rx="5" ry="9" fill="rgba(200,180,255,0.75)" stroke="rgba(139,92,246,0.6)" strokeWidth="1"/>
          <ellipse cx="268" cy="74" rx="2" ry="4" fill="rgba(255,255,255,0.4)"/>
          <rect x="18" y="73" width="5" height="14" rx="1.5" fill="rgba(239,68,68,0.65)"/>
          <line x1="50" y1="23" x2="44" y2="6" stroke="rgba(139,92,246,0.45)" strokeWidth="1.2"/>
          <circle cx="44" cy="5" r="1.5" fill="rgba(139,92,246,0.5)"/>
        </svg>
        <p className="text-center text-xs text-white/20 mt-1 tracking-widest">LADA PRIORA</p>
        </div>
      </div>

      <div className="hidden lg:block absolute right-14 top-1/3 -translate-y-1/2 anim-moon" style={{ filter: 'drop-shadow(0 0 20px rgba(139,92,246,0.6))' }}>
        <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="crescent">
              <rect width="130" height="130" fill="white"/>
              <circle cx="82" cy="55" r="40" fill="black"/>
            </mask>
          </defs>
          <circle cx="58" cy="58" r="42"
            fill="rgba(139,92,246,0.22)"
            stroke="rgba(180,140,255,0.85)"
            strokeWidth="1.5"
            mask="url(#crescent)"/>
          <circle cx="42" cy="52" r="5" fill="none" stroke="rgba(180,140,255,0.25)" strokeWidth="1" mask="url(#crescent)"/>
          <circle cx="55" cy="70" r="3" fill="none" stroke="rgba(180,140,255,0.2)" strokeWidth="1" mask="url(#crescent)"/>
          <circle cx="105" cy="22" r="2"   fill="rgba(255,255,255,0.65)"/>
          <circle cx="118" cy="55" r="1.5" fill="rgba(255,255,255,0.45)"/>
          <circle cx="100" cy="90" r="1"   fill="rgba(255,255,255,0.5)"/>
          <circle cx="15"  cy="18" r="1.5" fill="rgba(255,255,255,0.4)"/>
          <circle cx="8"   cy="95" r="1"   fill="rgba(255,255,255,0.3)"/>
          <circle cx="115" cy="105" r="1"  fill="rgba(255,255,255,0.35)"/>
          <path d="M30,38 Q38,32 46,36" stroke="rgba(255,255,255,0.3)" strokeWidth="1.2" fill="none" strokeLinecap="round" mask="url(#crescent)"/>
        </svg>
      </div>

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-violet shadow-neon-violet mb-4">
            <Car size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold neon-text mb-1">МастерАвто</h1>
          <p className="text-white/40 text-sm">CRM система управления автосервисом</p>
        </div>

        <div className="glass-card p-8">
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
