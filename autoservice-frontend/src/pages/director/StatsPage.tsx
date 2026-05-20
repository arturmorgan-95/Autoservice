import { useQuery } from '@tanstack/react-query'
import { BarChart2 } from 'lucide-react'
import { applicationsApi } from '../../api/applications'
import { applicationServicesApi } from '../../api/applicationServices'
import { paymentsApi } from '../../api/payments'
import { usersApi } from '../../api/users'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatMoney } from '../../utils/formatters'
import { ROLE_NAMES } from '../../utils/roleConstants'

export function StatsPage() {
  const { data: applications, isLoading } = useQuery({ queryKey: ['applications'],      queryFn: () => applicationsApi.getAll().then(r => r.data) })
  const { data: appServices }             = useQuery({ queryKey: ['applicationservices'], queryFn: () => applicationServicesApi.getAll().then(r => r.data) })
  const { data: payments }                = useQuery({ queryKey: ['payments'],            queryFn: () => paymentsApi.getAll().then(r => r.data) })
  const { data: users }                   = useQuery({ queryKey: ['users'],               queryFn: () => usersApi.getAll().then(r => r.data) })

  if (isLoading) return <PageSpinner />

  const apps = applications ?? []
  const services = appServices ?? []
  const paid = (payments ?? []).filter(p => p.paymentStatus === 'Оплачено')
  const clients = (users ?? []).filter(u => u.role?.roleName === ROLE_NAMES.CLIENT)

  const serviceRevenue: Record<string, { name: string; count: number; total: number }> = {}
  services.forEach(s => {
    const name = s.service?.serviceName ?? 'Неизвестно'
    if (!serviceRevenue[name]) serviceRevenue[name] = { name, count: 0, total: 0 }
    serviceRevenue[name].count++
    serviceRevenue[name].total += s.price
  })
  const topServices = Object.values(serviceRevenue).sort((a, b) => b.total - a.total).slice(0, 8)

  const clientStats = clients.map(c => ({
    name: c.fullName,
    count: apps.filter(a => a.clientId === c.id).length,
    revenue: paid.filter(p => apps.find(a => a.id === p.applicationId && a.clientId === c.id)).reduce((s, p) => s + p.amount, 0),
  })).sort((a, b) => b.count - a.count).slice(0, 8)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Статистика</h1>
        <p className="text-white/40 text-sm mt-1">Аналитика по услугам и клиентам</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h3 className="font-medium text-white flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-violet-neon" /> Топ услуг по выручке
          </h3>
          {topServices.length === 0 ? (
            <p className="text-white/40 text-sm">Нет данных</p>
          ) : (
            <div className="space-y-3">
              {topServices.map((s, i) => {
                const maxRev = topServices[0].total || 1
                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/30 w-4">{i + 1}.</span>
                        <span className="text-sm">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-violet-light text-sm font-medium">{formatMoney(s.total)}</span>
                        <span className="text-white/30 text-xs ml-2">×{s.count}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-violet rounded-full" style={{ width: `${(s.total / maxRev) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="font-medium text-white flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-blue-accent" /> Топ клиентов по заявкам
          </h3>
          {clientStats.length === 0 ? (
            <p className="text-white/40 text-sm">Нет данных</p>
          ) : (
            <div className="space-y-2">
              {clientStats.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/30 w-4">{i + 1}.</span>
                    <span className="text-sm">{c.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-violet-light text-sm">{c.count} заявок</span>
                    {c.revenue > 0 && <p className="text-xs text-emerald-400">{formatMoney(c.revenue)}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
