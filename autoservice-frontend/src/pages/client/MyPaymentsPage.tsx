import { useQuery } from '@tanstack/react-query'
import { CreditCard } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { applicationsApi } from '../../api/applications'
import { paymentsApi } from '../../api/payments'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate, formatMoney } from '../../utils/formatters'

export function MyPaymentsPage() {
  const { user } = useAuth()

  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.getAll().then(r => r.data),
  })

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll().then(r => r.data),
  })

  if (isLoading) return <PageSpinner />

  const myAppIds = new Set((applications ?? []).filter(a => a.clientId === user?.id).map(a => a.id))
  const myPayments = (payments ?? []).filter(p => myAppIds.has(p.applicationId))
  const sorted = [...myPayments].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
  const total = myPayments.filter(p => p.paymentStatus === 'Оплачено').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Мои платежи</h1>
        <p className="text-white/40 text-sm mt-1">История оплаты услуг</p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={CreditCard} title="Платежей нет" description="История ваших платежей появится здесь" />
      ) : (
        <>
          <div className="glass-card p-4 flex items-center justify-between">
            <p className="text-white/50 text-sm">Всего оплачено</p>
            <p className="text-xl font-bold text-emerald-400">{formatMoney(total)}</p>
          </div>

          <div className="glass-card overflow-hidden">
            <table className="table-glass">
              <thead><tr><th>Дата</th><th>Заявка</th><th>Сумма</th><th>Метод</th><th>Статус</th></tr></thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.id}>
                    <td className="text-white/40">{formatDate(p.paymentDate)}</td>
                    <td className="text-violet-light">#{p.applicationId}</td>
                    <td className="font-medium">{formatMoney(p.amount)}</td>
                    <td>{p.paymentMethod}</td>
                    <td>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${p.paymentStatus === 'Оплачено' ? 'bg-emerald-accent/20 text-emerald-400' : 'bg-amber-accent/20 text-amber-400'}`}>
                        {p.paymentStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
