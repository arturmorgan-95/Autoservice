import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { applicationServicesApi } from '../../api/applicationServices'
import { statusesApi } from '../../api/statuses'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatMoney } from '../../utils/formatters'
import toast from 'react-hot-toast'

export function MasterTasksPage() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const { data: allServices, isLoading } = useQuery({
    queryKey: ['applicationservices'],
    queryFn: () => applicationServicesApi.getAll().then(r => r.data),
  })

  const { data: statuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: () => statusesApi.getAll().then(r => r.data),
  })

  const changeStatusMutation = useMutation({
    mutationFn: ({ id, statusId }: { id: number; statusId: number }) =>
      applicationServicesApi.changeStatus(id, statusId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['applicationservices'] })
      qc.invalidateQueries({ queryKey: ['applications'] })
      qc.invalidateQueries({ queryKey: ['application'] })
      toast.success('Статус обновлён')
    },
    onError: () => toast.error('Ошибка'),
  })

  if (isLoading) return <PageSpinner />

  const myServices = (allServices ?? []).filter(s => s.masterId === user?.id)
  const sorted = [...myServices].sort((a, b) => a.statusId - b.statusId)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Мои задачи</h1>
        <p className="text-white/40 text-sm mt-1">Всего: {myServices.length}</p>
      </div>

      {sorted.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Задач нет" description="Вам пока не назначены задачи" />
      ) : (
        <div className="space-y-3">
          {sorted.map(s => (
            <div key={s.id} className="glass-card-hover p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white">{s.service?.serviceName ?? '—'}</h3>
                    <StatusBadge statusName={s.status?.statusName} />
                  </div>
                  <p className="text-sm text-white/40">Заявка #{s.applicationId} · Стоимость: {formatMoney(s.price)}</p>
                </div>
                <div>
                  <label className="block text-xs text-white/40 mb-1">Изменить статус</label>
                  <select
                    className="select-glass text-sm w-40"
                    value={s.statusId}
                    onChange={e => changeStatusMutation.mutate({ id: s.id, statusId: Number(e.target.value) })}
                  >
                    {(statuses ?? [])
                      .filter(st => ['В очереди', 'Назначена', 'В работе', 'Выполнена'].includes(st.statusName))
                      .map(st => <option key={st.id} value={st.id}>{st.statusName}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
