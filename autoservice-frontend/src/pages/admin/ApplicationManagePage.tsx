import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Wrench, CreditCard } from 'lucide-react'
import { applicationsApi } from '../../api/applications'
import { applicationServicesApi } from '../../api/applicationServices'
import { paymentsApi } from '../../api/payments'
import { servicesApi } from '../../api/services'
import { statusesApi } from '../../api/statuses'
import { usersApi } from '../../api/users'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { Modal } from '../../components/ui/Modal'
import { AssignMasterForm } from '../../components/forms/AssignMasterForm'
import { formatDate, formatDateTime, formatMoney } from '../../utils/formatters'
import { ROLE_NAMES } from '../../utils/roleConstants'
import toast from 'react-hot-toast'

export function ApplicationManagePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const appId = Number(id)
  const [showAddService, setShowAddService] = useState(false)

  const { data: app, isLoading } = useQuery({
    queryKey: ['application', appId],
    queryFn: () => applicationsApi.getById(appId).then(r => r.data),
  })
  const { data: allServices }    = useQuery({ queryKey: ['applicationservices'], queryFn: () => applicationServicesApi.getAll().then(r => r.data) })
  const { data: allPayments }    = useQuery({ queryKey: ['payments'],            queryFn: () => paymentsApi.getAll().then(r => r.data) })
  const { data: services }       = useQuery({ queryKey: ['services'],            queryFn: () => servicesApi.getAll().then(r => r.data) })
  const { data: statuses }       = useQuery({ queryKey: ['statuses'],            queryFn: () => statusesApi.getAll().then(r => r.data) })
  const { data: users }          = useQuery({ queryKey: ['users'],               queryFn: () => usersApi.getAll().then(r => r.data) })

  const changeStatusMutation = useMutation({
    mutationFn: (statusId: number) => applicationsApi.changeStatus(appId, statusId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); qc.invalidateQueries({ queryKey: ['application', appId] }); toast.success('Статус обновлён') },
    onError: () => toast.error('Ошибка обновления статуса'),
  })

  const addServiceMutation = useMutation({
    mutationFn: (data: { serviceId: number; masterId: number; statusId: number; price: number }) =>
      applicationServicesApi.create({ ...data, applicationId: appId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applicationservices'] }); setShowAddService(false); toast.success('Услуга добавлена') },
    onError: () => toast.error('Ошибка добавления услуги'),
  })

  if (isLoading) return <PageSpinner />
  if (!app) return <p className="text-white/40">Заявка не найдена</p>

  const appServices = (allServices ?? []).filter(s => s.applicationId === appId)
  const appPayments = (allPayments ?? []).filter(p => p.applicationId === appId)
  const masters     = (users ?? []).filter(u => u.role?.roleName === ROLE_NAMES.MASTER)
  const totalPrice  = appServices.reduce((s, as) => s + as.price, 0)

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">Управление заявкой #{app.id}</h1>
          <p className="text-white/40 text-sm">{formatDateTime(app.createdAt)}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <StatusBadge statusName={app.status?.statusName} />
          <select
            className="select-glass text-sm w-44"
            value={app.statusId}
            onChange={e => changeStatusMutation.mutate(Number(e.target.value))}
          >
            {(statuses ?? []).map(s => <option key={s.id} value={s.id}>{s.statusName}</option>)}
          </select>
        </div>
      </div>

      {/* Инфо */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-xs text-white/40 mb-1">Клиент</p>
          <p className="font-medium">{app.client?.fullName ?? '—'}</p>
          <p className="text-xs text-white/40">{app.client?.phoneNumber}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-white/40 mb-1">Автомобиль</p>
          <p className="font-medium">{app.car ? `${app.car.brand} ${app.car.model}` : '—'}</p>
          <p className="text-xs font-mono text-violet-light">{app.car?.licensePlate}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-xs text-white/40 mb-1">Проблема</p>
          <p className="text-sm leading-relaxed">{app.problemDescription}</p>
        </div>
      </div>

      {/* Услуги */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-white flex items-center gap-2"><Wrench size={16} className="text-violet-neon" /> Услуги</h3>
          <button onClick={() => setShowAddService(true)} className="btn-primary text-sm flex items-center gap-1.5">
            <Plus size={14} /> Добавить услугу
          </button>
        </div>
        {appServices.length === 0 ? (
          <p className="text-white/40 text-sm">Услуги не назначены</p>
        ) : (
          <table className="table-glass">
            <thead><tr><th>Услуга</th><th>Мастер</th><th>Цена</th><th>Статус</th></tr></thead>
            <tbody>
              {appServices.map(s => (
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
        {appServices.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
            <p className="text-sm text-white/50">Итого: <span className="text-violet-light font-semibold">{formatMoney(totalPrice)}</span></p>
          </div>
        )}
      </div>

      {/* Платежи */}
      <div className="glass-card p-5">
        <h3 className="font-medium text-white flex items-center gap-2 mb-4"><CreditCard size={16} className="text-emerald-accent" /> Платежи</h3>
        {appPayments.length === 0 ? (
          <p className="text-white/40 text-sm">Платежей нет</p>
        ) : (
          <table className="table-glass">
            <thead><tr><th>Дата</th><th>Сумма</th><th>Метод</th><th>Статус</th></tr></thead>
            <tbody>
              {appPayments.map(p => (
                <tr key={p.id}>
                  <td className="text-white/40">{formatDate(p.paymentDate)}</td>
                  <td className="text-emerald-400 font-medium">{formatMoney(p.amount)}</td>
                  <td>{p.paymentMethod}</td>
                  <td><span className={`text-xs px-2 py-0.5 rounded-full ${p.paymentStatus === 'Оплачено' ? 'bg-emerald-accent/20 text-emerald-400' : 'bg-amber-accent/20 text-amber-400'}`}>{p.paymentStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={showAddService} onClose={() => setShowAddService(false)} title="Добавить услугу" size="md">
        <AssignMasterForm
          services={services ?? []}
          masters={masters}
          statuses={statuses ?? []}
          onSubmit={(data) => addServiceMutation.mutate(data)}
          loading={addServiceMutation.isPending}
          onCancel={() => setShowAddService(false)}
        />
      </Modal>
    </div>
  )
}
