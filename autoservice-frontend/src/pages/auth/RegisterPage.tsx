import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Car, Lock, User, Phone, Mail, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/auth'
import { MountainBackground } from '../../components/layout/MountainBackground'
import { ROUTES } from '../../router/routes'

const CLIENT_ROLE_ID = 4

export function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    login: '',
    password: '',
    confirm: '',
  })

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!form.fullName || !form.login || !form.password) {
      toast.error('Заполните обязательные поля')
      return
    }
    if (form.password !== form.confirm) {
      toast.error('Пароли не совпадают')
      return
    }
    if (form.password.length < 4) {
      toast.error('Пароль должен быть не менее 4 символов')
      return
    }

    setLoading(true)
    try {
      await authApi.register({
        roleId: CLIENT_ROLE_ID,
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        login: form.login,
        passwordHash: form.password,
      })
      toast.success('Аккаунт создан! Войдите в систему.')
      navigate(ROUTES.LOGIN)
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Ошибка регистрации. Попробуйте другой логин.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <MountainBackground />

      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-violet shadow-neon-violet mb-4">
            <Car size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold neon-text mb-1">МастерАвто</h1>
          <p className="text-white/40 text-sm">Регистрация клиента</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold text-white mb-6">Создать аккаунт</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">
                ФИО <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  value={form.fullName}
                  onChange={set('fullName')}
                  placeholder="Иванов Иван Иванович"
                  className="input-glass pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  placeholder="example@mail.com"
                  className="input-glass pl-9"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/60 mb-1.5">Телефон</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={set('phoneNumber')}
                  placeholder="+7 900 000 00 00"
                  className="input-glass pl-9"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/60 mb-1.5">
                  Логин <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    value={form.login}
                    onChange={set('login')}
                    placeholder="Придумайте логин"
                    className="input-glass pl-9"
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-white/60 mb-1.5">
                  Пароль <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder="Минимум 4 символа"
                    className="input-glass pl-9 pr-10"
                    autoComplete="new-password"
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

              <div>
                <label className="block text-sm font-medium text-white/60 mb-1.5">
                  Подтвердите пароль <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirm}
                    onChange={set('confirm')}
                    placeholder="Повторите пароль"
                    className={`input-glass pl-9 pr-10 ${form.confirm && form.confirm !== form.password ? 'border-rose-500/50' : ''}`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {form.confirm && form.confirm !== form.password && (
                  <p className="text-xs text-rose-400 mt-1">Пароли не совпадают</p>
                )}
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
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>

          <div className="flex items-center justify-center mt-5">
            <Link
              to={ROUTES.LOGIN}
              className="flex items-center gap-1.5 text-sm text-white/40 hover:text-violet-light transition-colors"
            >
              <ArrowLeft size={14} />
              Уже есть аккаунт? Войти
            </Link>
          </div>
        </div>

        <div className="text-center mt-4 text-white/10 text-xs">
          Кавказские горы, 2026
        </div>
      </div>
    </div>
  )
}
