import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Car, FileText, CreditCard, Wrench,
  Users, Settings, BarChart2, TrendingUp, ClipboardList,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ROLE_NAMES } from '../../utils/roleConstants'
import { ROUTES } from '../../router/routes'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
}

const NAV_BY_ROLE: Record<string, NavItem[]> = {
  [ROLE_NAMES.CLIENT]: [
    { label: 'Главная',       to: ROUTES.CLIENT_DASHBOARD,    icon: LayoutDashboard },
    { label: 'Мои авто',      to: ROUTES.CLIENT_CARS,         icon: Car },
    { label: 'Мои заявки',   to: ROUTES.CLIENT_APPLICATIONS, icon: FileText },
    { label: 'Платежи',      to: ROUTES.CLIENT_PAYMENTS,     icon: CreditCard },
  ],
  [ROLE_NAMES.ADMIN]: [
    { label: 'Главная',      to: ROUTES.ADMIN_DASHBOARD,     icon: LayoutDashboard },
    { label: 'Все заявки',   to: ROUTES.ADMIN_APPLICATIONS,  icon: FileText },
    { label: 'Клиенты',      to: ROUTES.ADMIN_CLIENTS,       icon: Users },
    { label: 'Платежи',      to: ROUTES.ADMIN_PAYMENTS,      icon: CreditCard },
    { label: 'Отчёты',       to: ROUTES.ADMIN_REPORTS,       icon: BarChart2 },
    { label: 'Услуги',       to: ROUTES.ADMIN_SERVICES,      icon: Wrench },
    { label: 'Сотрудники',   to: ROUTES.ADMIN_USERS,         icon: Settings },
  ],
  [ROLE_NAMES.MASTER]: [
    { label: 'Главная',     to: ROUTES.MASTER_DASHBOARD, icon: LayoutDashboard },
    { label: 'Мои задачи', to: ROUTES.MASTER_TASKS,     icon: ClipboardList },
  ],
  [ROLE_NAMES.ACCOUNTING]: [
    { label: 'Главная',    to: ROUTES.ACCOUNTING_DASHBOARD, icon: LayoutDashboard },
  ],
  [ROLE_NAMES.DIRECTOR]: [
    { label: 'Главная',      to: ROUTES.DIRECTOR_DASHBOARD, icon: LayoutDashboard },
    { label: 'Мастера',     to: ROUTES.DIRECTOR_MASTERS,   icon: Users },
    { label: 'Статистика',  to: ROUTES.DIRECTOR_STATS,     icon: TrendingUp },
  ],
}

export function Sidebar() {
  const { roleName } = useAuth()
  const items = (roleName && NAV_BY_ROLE[roleName]) ?? []

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-full bg-bg-secondary/80 border-r border-violet-neon/10">
      {/* Логотип */}
      <div className="px-4 py-5 border-b border-violet-neon/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-violet flex items-center justify-center shadow-neon-sm">
            <Car size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold neon-text">МастерАвто</p>
            <p className="text-xs text-white/30">CRM система</p>
          </div>
        </div>
      </div>

      {/* Навигация */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Роль */}
      <div className="px-4 py-3 border-t border-violet-neon/10">
        <p className="text-xs text-white/30 uppercase tracking-wider">{roleName}</p>
      </div>
    </aside>
  )
}
