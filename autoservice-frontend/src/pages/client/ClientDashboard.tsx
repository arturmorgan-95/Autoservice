import { useQuery } from '@tanstack/react-query'
import { FileText, Car, CreditCard, Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { applicationsApi } from '../../api/applications'
import { carsApi } from '../../api/cars'
import { paymentsApi } from '../../api/payments'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatDate, formatDateTime } from '../../utils/formatters'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '../../router/routes'

export function ClientDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.getAll().then(r => r.data),
  })

  const { data: cars, isLoading: carsLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: () => carsApi.getAll().then(r => r.data),
  })

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll().then(r => r.data),
  })

  if (appsLoading || carsLoading) return <PageSpinner />

  const myApps = (applications ?? []).filter(a => a.clientId === user?.id)
  const myCars = (cars ?? []).filter(c => c.clientId === user?.id)
  const myPayments = (payments ?? []).filter(p =>
    myApps.some(a => a.id === p.applicationId)
  )

  const activeApps = myApps.filter(a => a.status?.statusName !== 'Завершена' && a.status?.statusName !== 'Отменена')
  const pendingPayments = myPayments.filter(p => p.paymentStatus === 'Ожидает')
  const recentApps = [...myApps].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Добро пожаловать, {user?.fullName}</h1>
        <p className="text-white/40 text-sm mt-1">Обзор ваших заявок и автомобилей</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Активных заявок"  value={activeApps.length}      icon={FileText}  iconColor="text-blue-accent"    iconBg="bg-blue-accent/10" />
        <StatCard title="Автомобилей"      value={myCars.length}          icon={Car}       iconColor="text-violet-neon"   iconBg="bg-violet-neon/10" />
        <StatCard title="Ожидают оплаты"  value={pendingPayments.length} icon={CreditCard} iconColor="text-amber-accent"  iconBg="bg-amber-accent/10" />
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Clock size={16} className="text-violet-neon" /> Последние заявки
          </h2>
          <button
            onClick={() => navigate(ROUTES.CLIENT_APPLICATIONS)}
            className="text-xs text-violet-light hover:text-violet-neon transition-colors"
          >
            Все заявки →
          </button>
        </div>

        {recentApps.length === 0 ? (
          <p className="text-white/40 text-sm py-4 text-center">Заявок пока нет</p>
        ) : (
          <table className="table-glass">
            <thead>
              <tr>
                <th>№</th>
                <th>Автомобиль</th>
                <th>Проблема</th>
                <th>Дата</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.map(app => (
                <tr key={app.id} className="cursor-pointer" onClick={() => navigate(`/client/applications/${app.id}`)}>
                  <td className="font-medium text-violet-light">#{app.id}</td>
                  <td>{app.car ? `${app.car.brand} ${app.car.model}` : '—'}</td>
                  <td className="max-w-48 truncate">{app.problemDescription}</td>
                  <td className="text-white/40">{formatDate(app.createdAt)}</td>
                  <td><StatusBadge statusName={app.status?.statusName} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
