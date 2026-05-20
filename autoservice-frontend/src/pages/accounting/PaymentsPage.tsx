import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Plus, FileText } from 'lucide-react'
import { paymentsApi } from '../../api/payments'
import { applicationsApi } from '../../api/applications'
import { applicationServicesApi } from '../../api/applicationServices'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { PaymentForm } from '../../components/forms/PaymentForm'
import { formatDate, formatMoney } from '../../utils/formatters'
import toast from 'react-hot-toast'
import type { CreatePaymentRequest } from '../../types'

const PAYMENT_STATUSES = ['Ожидает', 'Оплачено', 'Отменено']


export function PaymentsPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')
  const [activeTab, setActiveTab] = useState<'payments' | 'applications'>('payments')

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll().then(r => r.data),
    staleTime: 0,
  })
  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.getAll().then(r => r.data),
  })
  const { data: appServices } = useQuery({
    queryKey: ['applicationservices'],
    queryFn: () => applicationServicesApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreatePaymentRequest) => paymentsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); setShowAdd(false); toast.success('Платёж добавлен') },
    onError: () => toast.error('Ошибка'),
  })

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => paymentsApi.changeStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['payments'] }); toast.success('Статус обновлён') },
    onError: () => toast.error('Ошибка'),
  })

  if (isLoading) return <PageSpinner />

  const allPayments = payments ?? []
  const filtered = filterStatus ? allPayments.filter(p => p.paymentStatus === filterStatus) : allPayments
  const sorted = [...filtered].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())

  const paidAppIds = new Set(allPayments.map(p => p.applicationId))
  const unpaidApplications = (applications ?? []).filter(a => !paidAppIds.has(a.id))

  const appRows = (applications ?? []).map(app => {
    const services = (appServices ?? []).filter(s => s.applicationId === app.id)
    const servicesTotal = services.reduce((sum, s) => sum + s.price, 0)
    const paymentsTotal = allPayments
      .filter(p => p.applicationId === app.id && p.paymentStatus === 'Оплачено')
      .reduce((sum, p) => sum + p.amount, 0)
    const balance = servicesTotal - paymentsTotal
    return { app, servicesTotal, paymentsTotal, balance }
  }).filter(r => r.servicesTotal > 0)
    .sort((a, b) => b.balance - a.balance)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Платежи</h1>
          <p className="text-white/40 text-sm mt-1">Всего: {allPayments.length}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Добавить платёж
        </button>
      </div>

      <div className="flex rounded-xl bg-white/5 p-1 gap-1 w-fit">
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'payments' ? 'bg-gradient-violet text-white shadow-neon-sm' : 'text-white/40 hover:text-white/70'}`}
        >
          <CreditCard size={14} /> Платежи
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'applications' ? 'bg-gradient-violet text-white shadow-neon-sm' : 'text-white/40 hover:text-white/70'}`}
        >
          <FileText size={14} /> Стоимость заявок
        </button>
      </div>

      {activeTab === 'payments' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {['', ...PAYMENT_STATUSES].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filterStatus === s ? 'bg-violet-neon/20 border-violet-neon text-violet-light' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
                {s || 'Все'}
              </button>
            ))}
          </div>

          {sorted.length === 0 ? (
            <EmptyState icon={CreditCard} title="Платежей нет" action={{ label: 'Добавить платёж', onClick: () => setShowAdd(true) }} />
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="table-glass">
                <thead>
                  <tr>
                    <th>Дата</th>
                    <th>Заявка</th>
                    <th>Клиент</th>
                    <th>Автомобиль</th>
                    <th>Сумма</th>
                    <th>Метод</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(p => {
                    const app = p.application ?? (applications ?? []).find(a => a.id === p.applicationId)
                    return (
                      <tr key={p.id}>
                        <td className="text-white/40 whitespace-nowrap">{formatDate(p.paymentDate)}</td>
                        <td className="text-violet-light font-medium">#{p.applicationId}</td>
                        <td>{app?.client?.fullName ?? '—'}</td>
                        <td className="text-white/60">{app?.car ? `${app.car.brand} ${app.car.model}` : '—'}</td>
                        <td className="font-medium text-emerald-400">{formatMoney(p.amount)}</td>
                        <td className="text-white/60">{p.paymentMethod || '—'}</td>
                        <td>
                          <select
                            className="select-glass text-xs py-1 px-2 w-32"
                            value={p.paymentStatus}
                            onChange={e => changeStatusMutation.mutate({ id: p.id, status: e.target.value })}
                          >
                            {PAYMENT_STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'applications' && (
        <>
          {appRows.length === 0 ? (
            <EmptyState icon={FileText} title="Нет данных" description="Заявки с услугами не найдены" />
          ) : (
            <div className="glass-card overflow-hidden">
              <table className="table-glass">
                <thead>
                  <tr>
                    <th>Заявка</th>
                    <th>Клиент</th>
                    <th>Автомобиль</th>
                    <th>Статус</th>
                    <th>Стоимость услуг</th>
                    <th>Оплачено</th>
                    <th>Остаток</th>
                  </tr>
                </thead>
                <tbody>
                  {appRows.map(({ app, servicesTotal, paymentsTotal, balance }) => (
                    <tr key={app.id}>
                      <td className="text-violet-light font-medium">#{app.id}</td>
                      <td>{app.client?.fullName ?? '—'}</td>
                      <td className="text-white/60">{app.car ? `${app.car.brand} ${app.car.model}` : '—'}</td>
                      <td>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/60">
                          {app.status?.statusName ?? '—'}
                        </span>
                      </td>
                      <td className="font-medium text-white">{formatMoney(servicesTotal)}</td>
                      <td className="text-emerald-400">{formatMoney(paymentsTotal)}</td>
                      <td>
                        <span className={`font-semibold ${balance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {balance > 0 ? `−${formatMoney(balance)}` : 'Оплачено'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Новый платёж">
        <PaymentForm
          applications={unpaidApplications}
          onSubmit={(d) => createMutation.mutate(d)}
          loading={createMutation.isPending}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}
