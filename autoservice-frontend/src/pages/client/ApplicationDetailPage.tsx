import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Car, Wrench, CreditCard, Calendar } from 'lucide-react'
import { applicationsApi } from '../../api/applications'
import { applicationServicesApi } from '../../api/applicationServices'
import { paymentsApi } from '../../api/payments'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatDate, formatDateTime, formatMoney } from '../../utils/formatters'

export function ApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const appId = Number(id)

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => applicationsApi.getById(appId).then(r => r.data),
  })

  const { data: allServices } = useQuery({
    queryKey: ['applicationservices'],
    queryFn: () => applicationServicesApi.getAll().then(r => r.data),
  })

  const { data: allPayments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll().then(r => r.data),
  })

  if (isLoading) return <PageSpinner />
  if (!app) return <p className="text-white/40">Заявка не найдена</p>

  const services = (allServices ?? []).filter(s => s.applicationId === appId)
  const payments = (allPayments ?? []).filter(p => p.applicationId === appId)
  const totalPrice = services.reduce((sum, s) => sum + s.price, 0)
  const totalPaid = payments.filter(p => p.paymentStatus === 'Оплачено').reduce((sum, p) => sum + p.amount, 0)

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10 transition-all">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Заявка #{app.id}</h1>
          <p className="text-white/40 text-sm">{formatDateTime(app.createdAt)}</p>
        </div>
        <div className="ml-auto"><StatusBadge statusName={app.status?.statusName} /></div>
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Car size={16} className="text-violet-neon" />
            <h3 className="font-medium text-white">Автомобиль</h3>
          </div>
          {app.car ? (
            <>
              <p className="text-lg font-semibold">{app.car.brand} {app.car.model}</p>
              <p className="text-white/40 text-sm">{app.car.year} год</p>
              <p className="text-xs font-mono bg-violet-neon/10 text-violet-light px-2 py-1 rounded mt-2 inline-block">{app.car.licensePlate}</p>
            </>
          ) : <p className="text-white/40">—</p>}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Calendar size={16} className="text-blue-accent" />
            <h3 className="font-medium text-white">Описание проблемы</h3>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{app.problemDescription}</p>
        </div>
      </div>

      {/* Услуги */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Wrench size={16} className="text-violet-neon" />
          <h3 className="font-medium text-white">Выполняемые услуги</h3>
        </div>
        {services.length === 0 ? (
          <p className="text-white/40 text-sm">Услуги ещё не назначены</p>
        ) : (
          <table className="table-glass">
            <thead><tr><th>Услуга</th><th>Мастер</th><th>Стоимость</th><th>Статус</th></tr></thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id}>
                  <td>{s.service?.serviceName ?? '—'}</td>
                  <td>{s.master?.fullName ?? '—'}</td>
                  <td className="text-violet-light">{formatMoney(s.price)}</td>
                  <td><StatusBadge statusName={s.status?.statusName} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {services.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
            <p className="text-sm text-white/50">Итого: <span className="text-violet-light font-semibold">{formatMoney(totalPrice)}</span></p>
          </div>
        )}
      </div>

      {/* Платежи */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={16} className="text-emerald-accent" />
          <h3 className="font-medium text-white">Платежи</h3>
        </div>
        {payments.length === 0 ? (
          <p className="text-white/40 text-sm">Платежей пока нет</p>
        ) : (
          <table className="table-glass">
            <thead><tr><th>Дата</th><th>Сумма</th><th>Метод</th><th>Статус</th></tr></thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id}>
                  <td className="text-white/40">{formatDate(p.paymentDate)}</td>
                  <td className="text-emerald-400 font-medium">{formatMoney(p.amount)}</td>
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
        )}
        {payments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
            <p className="text-sm text-white/50">Оплачено: <span className="text-emerald-400 font-semibold">{formatMoney(totalPaid)}</span></p>
          </div>
        )}
      </div>
    </div>
  )
}
