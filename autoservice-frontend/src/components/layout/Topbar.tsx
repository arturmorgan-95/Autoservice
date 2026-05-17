import { LogOut, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export function Topbar() {
  const { user, logout } = useAuth()

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-violet-neon/10 bg-bg-secondary/50 backdrop-blur-sm flex-shrink-0">
      <div />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-violet-neon/20 border border-violet-neon/30 flex items-center justify-center">
            <User size={14} className="text-violet-light" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-white leading-none">{user?.fullName}</p>
            <p className="text-xs text-white/40 mt-0.5">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-rose-accent/10 border border-white/10 hover:border-rose-accent/30 flex items-center justify-center transition-all duration-200"
          title="Выйти"
        >
          <LogOut size={14} className="text-white/50 hover:text-rose-400 transition-colors" />
        </button>
      </div>
    </header>
  )
}
