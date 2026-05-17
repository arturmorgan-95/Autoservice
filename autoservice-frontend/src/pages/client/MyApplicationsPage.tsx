import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { applicationsApi } from '../../api/applications'
import { carsApi } from '../../api/cars'
import { statusesApi } from '../../api/statuses'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageSpinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { ApplicationForm } from '../../components/forms/ApplicationForm'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'
import type { CreateApplicationRequest } from '../../types'

export function MyApplicationsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [showAdd, setShowAdd] = useState(false)
  const [filterStatus, setFilterStatus] = useState('')

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.getAll().then(r => r.data),
  })

  const { data: cars } = useQuery({
    queryKey: ['cars'],
    queryFn: () => carsApi.getAll().then(r => r.data),
  })

  const { data: statuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: () => statusesApi.getAll().then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateApplicationRequest) => applicationsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); setShowAdd(false); toast.success('Заявка создана') },
    onError: () => toast.error('Ошибка создания заявки'),
  })

  if (isLoading) return <PageSpinner />

  const myApps = (applications ?? []).filter(a => a.clientId === user?.id)
  const myCars = (cars ?? []).filter(c => c.clientId === user?.id)
  const filtered = filterStatus ? myApps.filter(a => a.status?.statusName === filterStatus) : myApps
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const uniqueStatuses = [...new Set(myApps.map(a => a.status?.statusName).filter(Boolean))]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Мои заявки</h1>
          <p className="text-white/40 text-sm mt-1">История обращений в сервис</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2" disabled={myCars.length === 0}>
          <Plus size={16} /> Новая заявка
        </button>
      </div>

      {/* Фильтр */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilterStatus('')} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!filterStatus ? 'bg-violet-neon/20 border-violet-neon text-violet-light' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
          Все ({myApps.length})
        </button>
        {uniqueStatuses.map(s => (
          <button key={s} onClick={() => setFilterStatus(s!)} className={`text-xs px-3 py-1.5 rounded-full border transition-all ${filterStatus === s ? 'bg-violet-neon/20 border-violet-neon text-violet-light' : 'border-white/10 text-white/40 hover:border-white/30'}`}>
            {s}
          </button>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Заявок нет"
          description={myCars.length === 0 ? 'Сначала добавьте автомобиль' : 'Создайте первую заявку на ремонт'}
          action={myCars.length > 0 ? { label: 'Создать заявку', onClick: () => setShowAdd(true) } : undefined}
        />
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="table-glass">
            <thead>
              <tr>
                <th>№</th><th>Автомобиль</th><th>Проблема</th><th>Дата</th><th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(app => (
                <tr key={app.id} className="cursor-pointer" onClick={() => navigate(`/client/applications/${app.id}`)}>
                  <td className="font-medium text-violet-light">#{app.id}</td>
                  <td>{app.car ? `${app.car.brand} ${app.car.model}` : '—'}</td>
                  <td className="max-w-60 truncate">{app.problemDescription}</td>
                  <td className="text-white/40">{formatDate(app.createdAt)}</td>
                  <td><StatusBadge statusName={app.status?.statusName} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Новая заявка" size="lg">
        <ApplicationForm
          clientId={user!.id}
          cars={myCars}
          statuses={statuses ?? []}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}
