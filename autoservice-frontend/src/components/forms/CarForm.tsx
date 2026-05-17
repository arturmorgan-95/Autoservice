import { useState } from 'react'
import type { CreateCarRequest } from '../../types'

interface CarFormProps {
  clientId: number
  onSubmit: (data: CreateCarRequest) => void
  loading: boolean
  onCancel: () => void
}

export function CarForm({ clientId, onSubmit, loading, onCancel }: CarFormProps) {
  const [form, setForm] = useState({ brand: '', model: '', year: new Date().getFullYear(), licensePlate: '' })

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.name === 'year' ? Number(e.target.value) : e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, clientId })
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/60 mb-1">Марка</label>
          <input name="brand" value={form.brand} onChange={handle} required placeholder="Toyota" className="input-glass" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Модель</label>
          <input name="model" value={form.model} onChange={handle} required placeholder="Camry" className="input-glass" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/60 mb-1">Год выпуска</label>
          <input name="year" type="number" value={form.year} onChange={handle} required min="1900" max="2030" className="input-glass" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Гос. номер</label>
          <input name="licensePlate" value={form.licensePlate} onChange={handle} required placeholder="А123ВС77" className="input-glass" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Отмена</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Сохранение...' : 'Добавить'}
        </button>
      </div>
    </form>
  )
}
