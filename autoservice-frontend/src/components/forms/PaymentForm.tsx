import { useState } from 'react'
import type { Application, CreatePaymentRequest } from '../../types'

interface PaymentFormProps {
  applications: Application[]
  onSubmit: (data: CreatePaymentRequest) => void
  loading: boolean
  onCancel: () => void
}

export function PaymentForm({ applications, onSubmit, loading, onCancel }: PaymentFormProps) {
  const [form, setForm] = useState({
    applicationId: applications[0]?.id ?? 0,
    amount: 0,
    paymentDate: new Date().toISOString().split('T')[0],
    paymentStatus: 'Оплачено',
    paymentMethod: 'Наличные',
  })

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.name === 'applicationId' || e.target.name === 'amount' ? Number(e.target.value) : e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, paymentDate: new Date(form.paymentDate).toISOString() })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/60 mb-1">Заявка</label>
        <select name="applicationId" value={form.applicationId} onChange={handle} className="select-glass">
          {applications.map(a => <option key={a.id} value={a.id}>#{a.id} — {a.client?.fullName ?? 'Клиент'}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/60 mb-1">Сумма (₽)</label>
          <input name="amount" type="number" value={form.amount} onChange={handle} min="0" required className="input-glass" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Дата</label>
          <input name="paymentDate" type="date" value={form.paymentDate} onChange={handle} className="input-glass" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/60 mb-1">Метод оплаты</label>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handle} className="select-glass">
            <option>Наличные</option>
            <option>Карта</option>
            <option>Перевод</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Статус</label>
          <select name="paymentStatus" value={form.paymentStatus} onChange={handle} className="select-glass">
            <option>Оплачено</option>
            <option>Ожидает</option>
            <option>Отменено</option>
          </select>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Отмена</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Сохранение...' : 'Добавить'}</button>
      </div>
    </form>
  )
}
