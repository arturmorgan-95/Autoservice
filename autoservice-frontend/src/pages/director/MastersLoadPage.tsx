import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { usersApi } from '../../api/users'
import { applicationServicesApi } from '../../api/applicationServices'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { ROLE_NAMES } from '../../utils/roleConstants'

export function MastersLoadPage() {
  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) })
  const { data: services } = useQuery({ queryKey: ['applicationservices'], queryFn: () => applicationServicesApi.getAll().then(r => r.data) })

  if (isLoading) return <PageSpinner />

  const masters = (users ?? []).filter(u => u.role?.roleName === ROLE_NAMES.MASTER)
  const allServices = services ?? []

  const mastersData = masters.map(m => {
    const myServices = allServices.filter(s => s.masterId === m.id)
    const active = myServices.filter(s => s.status?.statusName !== 'Завершена' && s.status?.statusName !== 'Выполнена')
    const done   = myServices.filter(s => s.status?.statusName === 'Завершена' || s.status?.statusName === 'Выполнена')
    return { ...m, total: myServices.length, active: active.length, done: done.length }
  }).sort((a, b) => b.active - a.active)

  const maxLoad = Math.max(...mastersData.map(m => m.active), 1)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Загрузка мастеров</h1>
        <p className="text-white/40 text-sm mt-1">Активные задачи по мастерам</p>
      </div>

      {mastersData.length === 0 ? (
        <EmptyState icon={Users} title="Мастеров нет" />
      ) : (
        <div className="space-y-4">
          {mastersData.map(m => (
            <div key={m.id} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-white">{m.fullName}</p>
                  <p className="text-xs text-white/40">{m.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-violet-light">{m.active}</p>
                  <p className="text-xs text-white/40">активных</p>
                </div>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(m.active / maxLoad) * 100}%`,
                    background: m.active > 5 ? 'linear-gradient(90deg, #f43f5e, #f59e0b)' : 'linear-gradient(90deg, #6d28d9, #8b5cf6)',
                  }}
                />
              </div>
              <div className="flex gap-4 mt-3 text-xs text-white/40">
                <span>Всего задач: <span className="text-white/70">{m.total}</span></span>
                <span>Завершено: <span className="text-emerald-400">{m.done}</span></span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
