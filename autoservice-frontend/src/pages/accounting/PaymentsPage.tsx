import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { CreditCard, Plus } from 'lucide-react'
import { paymentsApi } from '../../api/payments'
import { applicationsApi } from '../../api/applications'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { PaymentForm } from '../../components/forms/PaymentForm'
import { formatDate, formatMoney } from '../../utils/formatters'
import toast from 'react-hot-toast'
import type { CreatePaymentRequest } from '../../types'

const PAYMENT_STATUSES = ['Ожидает', 'Оплачено', 'Отменено']

function statusStyle(s: string) {
  if (s === 'Оплачено') return 'bg-emerald-accent/20 text-emerald-400'
  if (s === 'Отменено') return 'bg-rose-accent/20 text-rose-400'
  return 'bg-amber-accent/20 text-amber-400'
}

export function PaymentsPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll().then(r => r.data),
    staleTime: 0,
  })
  const { data: applications } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.getAll().then(r => r.data),
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

  const all = payments ?? []
  const filtered = filterStatus ? all.filter(p => p.paymentStatus === filterStatus) : all
  const sorted = [...filtered].sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Платежи</h1>
          <p className="text-white/40 text-sm mt-1">Всего: {all.length}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Добавить платёж
        </button>
      </div>

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
                    <td className="text-white/60">
                      {app?.car ? `${app.car.brand} ${app.car.model}` : '—'}
                    </td>
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

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Новый платёж">
        <PaymentForm
          applications={applications ?? []}
          onSubmit={(d) => createMutation.mutate(d)}
          loading={createMutation.isPending}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}
