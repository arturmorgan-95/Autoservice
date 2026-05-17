import { useQuery } from '@tanstack/react-query'
import { ClipboardList, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { applicationServicesApi } from '../../api/applicationServices'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { useNavigate } from 'react-router-dom'

export function MasterDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: allServices, isLoading } = useQuery({
    queryKey: ['applicationservices'],
    queryFn: () => applicationServicesApi.getAll().then(r => r.data),
  })

  if (isLoading) return <PageSpinner />

  const myServices = (allServices ?? []).filter(s => s.masterId === user?.id)
  const active    = myServices.filter(s => s.status?.statusName !== 'Завершена' && s.status?.statusName !== 'Выполнена')
  const done      = myServices.filter(s => s.status?.statusName === 'Завершена' || s.status?.statusName === 'Выполнена')

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Мои задачи</h1>
        <p className="text-white/40 text-sm mt-1">Привет, {user?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Всего задач"    value={myServices.length} icon={ClipboardList} iconColor="text-violet-neon"    iconBg="bg-violet-neon/10" />
        <StatCard title="Активных"       value={active.length}     icon={Clock}         iconColor="text-amber-accent"   iconBg="bg-amber-accent/10" />
        <StatCard title="Завершено"      value={done.length}       icon={CheckCircle}   iconColor="text-emerald-accent" iconBg="bg-emerald-accent/10" />
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white">Активные задачи</h2>
          <button onClick={() => navigate('/master/tasks')} className="text-xs text-violet-light hover:text-violet-neon transition-colors">Все задачи →</button>
        </div>
        {active.length === 0 ? (
          <p className="text-white/40 text-sm py-4 text-center">Нет активных задач</p>
        ) : (
          <div className="space-y-3">
            {active.slice(0, 5).map(s => (
              <div key={s.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <div>
                  <p className="font-medium text-sm">{s.service?.serviceName ?? '—'}</p>
                  <p className="text-xs text-white/40">Заявка #{s.applicationId}</p>
                </div>
                <StatusBadge statusName={s.status?.statusName} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
