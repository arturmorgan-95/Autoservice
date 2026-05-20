import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Users, FileText, CreditCard } from 'lucide-react'
import { applicationsApi } from '../../api/applications'
import { paymentsApi } from '../../api/payments'
import { usersApi } from '../../api/users'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatMoney } from '../../utils/formatters'
import { ROLE_NAMES } from '../../utils/roleConstants'

export function DirectorDashboard() {
  const { data: applications, isLoading } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.getAll().then(r => r.data) })
  const { data: payments } = useQuery({ queryKey: ['payments'], queryFn: () => paymentsApi.getAll().then(r => r.data) })
  const { data: users }    = useQuery({ queryKey: ['users'],    queryFn: () => usersApi.getAll().then(r => r.data) })

  if (isLoading) return <PageSpinner />

  const apps = applications ?? []
  const paid = (payments ?? []).filter(p => p.paymentStatus === 'Оплачено')
  const revenue = paid.reduce((s, p) => s + p.amount, 0)
  const avgCheck = paid.length > 0 ? revenue / paid.length : 0
  const clients = (users ?? []).filter(u => u.role?.roleName === ROLE_NAMES.CLIENT)
  const masters = (users ?? []).filter(u => u.role?.roleName === ROLE_NAMES.MASTER)

  const statsByStatus = apps.reduce<Record<string, number>>((acc, a) => {
    const s = a.status?.statusName ?? 'Неизвестно'
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Аналитика</h1>
        <p className="text-white/40 text-sm mt-1">Панель директора</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Выручка (оплачено)" value={formatMoney(revenue)} icon={TrendingUp}  iconColor="text-emerald-accent" iconBg="bg-emerald-accent/10" />
        <StatCard title="Всего заявок"       value={apps.length}         icon={FileText}    iconColor="text-blue-accent"    iconBg="bg-blue-accent/10" />
        <StatCard title="Клиентов"           value={clients.length}      icon={Users}       iconColor="text-violet-neon"   iconBg="bg-violet-neon/10" />
        <StatCard title="Средний чек"        value={formatMoney(avgCheck)} icon={CreditCard} iconColor="text-amber-accent"  iconBg="bg-amber-accent/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
<div className="glass-card p-5">
          <h3 className="font-medium text-white mb-4">Заявки по статусам</h3>
          <div className="space-y-3">
            {Object.entries(statsByStatus).map(([status, count]) => {
              const pct = apps.length > 0 ? (count / apps.length) * 100 : 0
              return (
                <div key={status}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge statusName={status} />
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-violet-neon/60 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

<div className="glass-card p-5">
          <h3 className="font-medium text-white mb-4">Мастера ({masters.length})</h3>
          <div className="space-y-2">
            {masters.length === 0 ? (
              <p className="text-white/40 text-sm">Мастеров нет</p>
            ) : masters.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                <p className="text-sm font-medium">{m.fullName}</p>
                <span className="text-xs text-violet-light">{m.login}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
