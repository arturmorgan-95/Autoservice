import { useState } from 'react'
import type { Car, Status, CreateApplicationRequest } from '../../types'

interface ApplicationFormProps {
  clientId: number
  cars: Car[]
  statuses: Status[]
  onSubmit: (data: CreateApplicationRequest) => void
  loading: boolean
  onCancel: () => void
  adminId?: number
}

export function ApplicationForm({ clientId, cars, statuses, onSubmit, loading, onCancel, adminId }: ApplicationFormProps) {
  const defaultStatus = statuses.find(s => s.statusName === 'Новая') ?? statuses[0]
  const [form, setForm] = useState({
    carId: cars[0]?.id ?? 0,
    statusId: defaultStatus?.id ?? 1,
    problemDescription: '',
  })

  const handle = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.name === 'carId' || e.target.name === 'statusId' ? Number(e.target.value) : e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, clientId, adminId: adminId ?? null })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm text-white/60 mb-1">Автомобиль</label>
        <select name="carId" value={form.carId} onChange={handle} required className="select-glass">
          {cars.map(c => (
            <option key={c.id} value={c.id}>{c.brand} {c.model} — {c.licensePlate}</option>
          ))}
        </select>
      </div>
      {adminId !== undefined && statuses.length > 0 && (
        <div>
          <label className="block text-sm text-white/60 mb-1">Статус</label>
          <select name="statusId" value={form.statusId} onChange={handle} className="select-glass">
            {statuses.map(s => <option key={s.id} value={s.id}>{s.statusName}</option>)}
          </select>
        </div>
      )}
      <div>
        <label className="block text-sm text-white/60 mb-1">Описание проблемы</label>
        <textarea
          name="problemDescription"
          value={form.problemDescription}
          onChange={handle}
          required
          rows={4}
          placeholder="Опишите проблему с автомобилем..."
          className="input-glass resize-none"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Отмена</button>
        <button type="submit" disabled={loading || cars.length === 0} className="btn-primary flex-1">
          {loading ? 'Создание...' : 'Создать заявку'}
        </button>
      </div>
    </form>
  )
}
