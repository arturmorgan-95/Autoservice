import { useQuery } from '@tanstack/react-query'
import { CreditCard, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { paymentsApi } from '../../api/payments'
import { StatCard } from '../../components/shared/StatCard'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatMoney, formatDate } from '../../utils/formatters'

export function AccountingDashboard() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll().then(r => r.data),
  })

  if (isLoading) return <PageSpinner />

  const all = payments ?? []
  const now = new Date()
  const thisMonth = all.filter(p => {
    const d = new Date(p.paymentDate)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const paid    = all.filter(p => p.paymentStatus === 'Оплачено')
  const pending = all.filter(p => p.paymentStatus === 'Ожидает')
  const monthRevenue = thisMonth.filter(p => p.paymentStatus === 'Оплачено').reduce((s, p) => s + p.amount, 0)
  const totalRevenue = paid.reduce((s, p) => s + p.amount, 0)

  const recent = [...all].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()).slice(0, 8)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Финансы</h1>
        <p className="text-white/40 text-sm mt-1">Панель бухгалтерии</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Доход за месяц"  value={formatMoney(monthRevenue)} icon={TrendingUp}  iconColor="text-emerald-accent" iconBg="bg-emerald-accent/10" />
        <StatCard title="Всего оплачено"  value={formatMoney(totalRevenue)} icon={CreditCard}  iconColor="text-violet-neon"   iconBg="bg-violet-neon/10" />
        <StatCard title="Оплачено"        value={paid.length}              icon={CheckCircle}  iconColor="text-blue-accent"   iconBg="bg-blue-accent/10" />
        <StatCard title="Ожидают оплаты" value={pending.length}           icon={Clock}        iconColor="text-amber-accent"  iconBg="bg-amber-accent/10" />
      </div>

      <div className="glass-card p-5">
        <h2 className="font-semibold text-white mb-4">Последние платежи</h2>
        <table className="table-glass">
          <thead><tr><th>Дата</th><th>Заявка</th><th>Сумма</th><th>Метод</th><th>Статус</th></tr></thead>
          <tbody>
            {recent.map(p => (
              <tr key={p.id}>
                <td className="text-white/40">{formatDate(p.paymentDate)}</td>
                <td className="text-violet-light">#{p.applicationId}</td>
                <td className="font-medium">{formatMoney(p.amount)}</td>
                <td>{p.paymentMethod}</td>
                <td><span className={`text-xs px-2 py-0.5 rounded-full ${p.paymentStatus === 'Оплачено' ? 'bg-emerald-accent/20 text-emerald-400' : 'bg-amber-accent/20 text-amber-400'}`}>{p.paymentStatus}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
