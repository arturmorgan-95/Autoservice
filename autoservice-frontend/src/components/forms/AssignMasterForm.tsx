import { useState } from 'react'
import type { Service, User, Status } from '../../types'

interface AssignMasterFormProps {
  services: Service[]
  masters: User[]
  statuses: Status[]
  onSubmit: (data: { serviceId: number; masterId: number; statusId: number; price: number }) => void
  loading: boolean
  onCancel: () => void
}

export function AssignMasterForm({ services, masters, statuses, onSubmit, loading, onCancel }: AssignMasterFormProps) {
  const defaultStatus = statuses.find(s => s.statusName === 'Новая') ?? statuses[0]
  const [form, setForm] = useState({
    serviceId: services[0]?.id ?? 0,
    masterId:  masters[0]?.id ?? 0,
    statusId:  defaultStatus?.id ?? 1,
    price:     services[0]?.basePrice ?? 0,
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const val = ['serviceId', 'masterId', 'statusId', 'price'].includes(e.target.name) ? Number(e.target.value) : e.target.value
    if (e.target.name === 'serviceId') {
      const svc = services.find(s => s.id === Number(e.target.value))
      setForm(p => ({ ...p, serviceId: Number(e.target.value), price: svc?.basePrice ?? p.price }))
    } else {
      setForm(p => ({ ...p, [e.target.name]: val }))
    }
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/60 mb-1">Услуга</label>
        <select name="serviceId" value={form.serviceId} onChange={handleChange} className="select-glass">
          {services.map(s => <option key={s.id} value={s.id}>{s.serviceName} — {s.basePrice} ₽</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1">Мастер</label>
        <select name="masterId" value={form.masterId} onChange={handleChange} className="select-glass">
          {masters.map(m => <option key={m.id} value={m.id}>{m.fullName}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1">Статус</label>
        <select name="statusId" value={form.statusId} onChange={handleChange} className="select-glass">
          {statuses.map(s => <option key={s.id} value={s.id}>{s.statusName}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm text-white/60 mb-1">Цена (₽)</label>
        <input name="price" type="number" value={form.price} onChange={handleChange} min="0" className="input-glass" />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Отмена</button>
        <button type="submit" disabled={loading || masters.length === 0} className="btn-primary flex-1">
          {loading ? 'Сохранение...' : 'Добавить'}
        </button>
      </div>
    </form>
  )
}
