import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FileText, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { applicationsApi } from '../../api/applications'
import { carsApi } from '../../api/cars'
import { usersApi } from '../../api/users'
import { statusesApi } from '../../api/statuses'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageSpinner } from '../../components/ui/Spinner'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { ApplicationForm } from '../../components/forms/ApplicationForm'
import { formatDate } from '../../utils/formatters'
import { ROLE_NAMES } from '../../utils/roleConstants'
import toast from 'react-hot-toast'
import type { CreateApplicationRequest } from '../../types'

export function AllApplicationsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.getAll().then(r => r.data),
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
  const { data: cars }     = useQuery({ queryKey: ['cars'],     queryFn: () => carsApi.getAll().then(r => r.data) })
  const { data: users }    = useQuery({ queryKey: ['users'],    queryFn: () => usersApi.getAll().then(r => r.data) })
  const { data: statuses } = useQuery({ queryKey: ['statuses'], queryFn: () => statusesApi.getAll().then(r => r.data) })

  const createMutation = useMutation({
    mutationFn: (data: CreateApplicationRequest) => applicationsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['applications'] }); setShowAdd(false); toast.success('Заявка создана') },
    onError: () => toast.error('Ошибка создания'),
  })

  if (isLoading) return <PageSpinner />

  const apps = applications ?? []
  const allCars = cars ?? []

  const filtered = apps.filter(a => {
    const matchStatus = !filterStatus || a.status?.statusName === filterStatus
    const matchSearch = !search ||
      a.problemDescription.toLowerCase().includes(search.toLowerCase()) ||
      a.client?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      a.car?.licensePlate?.toLowerCase().includes(search.toLowerCase()) ||
      String(a.id).includes(search)
    return matchStatus && matchSearch
  })

  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  const uniqueStatuses = [...new Set(apps.map(a => a.status?.statusName).filter(Boolean))]

  const clients = (users ?? []).filter(u => u.role?.roleName === ROLE_NAMES.CLIENT)
  const allClientCars = allCars

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Все заявки</h1>
          <p className="text-white/40 text-sm mt-1">Найдено: {sorted.length} из {apps.length}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Новая заявка
        </button>
      </div>

      {/* Поиск и фильтры */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по клиенту, авто, описанию..."
            className="input-glass pl-8 text-sm"
          />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="select-glass text-sm w-40">
          <option value="">Все статусы</option>
          {uniqueStatuses.map(s => <option key={s} value={s!}>{s}</option>)}
        </select>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={FileText} title="Заявок не найдено" />
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="table-glass">
            <thead><tr><th>№</th><th>Клиент</th><th>Автомобиль</th><th>Проблема</th><th>Дата</th><th>Статус</th></tr></thead>
            <tbody>
              {sorted.map(app => (
                <tr key={app.id} className="cursor-pointer" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                  <td className="text-violet-light font-medium">#{app.id}</td>
                  <td>{app.client?.fullName ?? '—'}</td>
                  <td>{app.car ? `${app.car.brand} ${app.car.model}` : '—'}</td>
                  <td className="max-w-52 truncate">{app.problemDescription}</td>
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
          clientId={clients[0]?.id ?? 0}
          cars={allClientCars}
          statuses={statuses ?? []}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}
