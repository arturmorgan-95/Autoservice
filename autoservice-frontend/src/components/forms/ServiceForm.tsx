import { useState } from 'react'
import type { Service, CreateServiceRequest } from '../../types'

interface ServiceFormProps {
  initial?: Service
  onSubmit: (data: CreateServiceRequest) => void
  loading: boolean
  onCancel: () => void
}

export function ServiceForm({ initial, onSubmit, loading, onCancel }: ServiceFormProps) {
  const [form, setForm] = useState<CreateServiceRequest>({
    serviceName:   initial?.serviceName   ?? '',
    basePrice:     initial?.basePrice     ?? 0,
    durationHours: initial?.durationHours ?? 1,
  })

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: ['basePrice', 'durationHours'].includes(e.target.name) ? Number(e.target.value) : e.target.value }))

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form) }} className="space-y-4">
      <div>
        <label className="block text-sm text-white/60 mb-1">Название услуги</label>
        <input name="serviceName" value={form.serviceName} onChange={handle} required placeholder="Диагностика двигателя" className="input-glass" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/60 mb-1">Базовая цена (₽)</label>
          <input name="basePrice" type="number" value={form.basePrice} onChange={handle} min="0" className="input-glass" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Длительность (ч.)</label>
          <input name="durationHours" type="number" value={form.durationHours} onChange={handle} min="0.5" step="0.5" className="input-glass" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Отмена</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? 'Сохранение...' : 'Сохранить'}</button>
      </div>
    </form>
  )
}
