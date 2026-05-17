import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Wrench, Plus, Pencil, Trash2 } from 'lucide-react'
import { servicesApi } from '../../api/services'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { ServiceForm } from '../../components/forms/ServiceForm'
import { formatMoney } from '../../utils/formatters'
import toast from 'react-hot-toast'
import type { Service, CreateServiceRequest } from '../../types'

export function ServicesPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)

  const { data: services, isLoading } = useQuery({ queryKey: ['services'], queryFn: () => servicesApi.getAll().then(r => r.data) })

  const createMutation = useMutation({
    mutationFn: (data: CreateServiceRequest) => servicesApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setShowAdd(false); toast.success('Услуга добавлена') },
    onError: () => toast.error('Ошибка'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Service> }) => servicesApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setEditing(null); toast.success('Услуга обновлена') },
    onError: () => toast.error('Ошибка'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => servicesApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); toast.success('Услуга удалена') },
    onError: () => toast.error('Ошибка удаления'),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Справочник услуг</h1>
          <p className="text-white/40 text-sm mt-1">Всего: {(services ?? []).length}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Добавить</button>
      </div>

      {(services ?? []).length === 0 ? (
        <EmptyState icon={Wrench} title="Услуг нет" action={{ label: 'Добавить услугу', onClick: () => setShowAdd(true) }} />
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="table-glass">
            <thead><tr><th>Услуга</th><th>Базовая цена</th><th>Длительность</th><th></th></tr></thead>
            <tbody>
              {(services ?? []).map(s => (
                <tr key={s.id}>
                  <td className="font-medium">{s.serviceName}</td>
                  <td className="text-violet-light">{formatMoney(s.basePrice)}</td>
                  <td className="text-white/50">{s.durationHours} ч.</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(s)} className="text-white/30 hover:text-violet-light transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteMutation.mutate(s.id)} className="text-white/30 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Новая услуга">
        <ServiceForm onSubmit={(d) => createMutation.mutate(d)} loading={createMutation.isPending} onCancel={() => setShowAdd(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Редактировать услугу">
        {editing && (
          <ServiceForm
            initial={editing}
            onSubmit={(d) => updateMutation.mutate({ id: editing.id, data: d })}
            loading={updateMutation.isPending}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  )
}
