import { useQuery } from '@tanstack/react-query'
import { FileText, Users, Wrench, AlertCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { applicationsApi } from '../../api/applications'
import { usersApi } from '../../api/users'
import { StatCard } from '../../components/shared/StatCard'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatDate } from '../../utils/formatters'
import { ROLE_NAMES } from '../../utils/roleConstants'

export function AdminDashboard() {
  const navigate = useNavigate()

  const { data: applications, isLoading } = useQuery({
    queryKey: ['applications'],
    queryFn: () => applicationsApi.getAll().then(r => r.data),
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll().then(r => r.data),
  })

  if (isLoading) return <PageSpinner />

  const apps = applications ?? []
  const allUsers = users ?? []

  const newApps     = apps.filter(a => a.status?.statusName === 'Новая')
  const inWork      = apps.filter(a => a.status?.statusName === 'В работе')
  const clients     = allUsers.filter(u => u.role?.roleName === ROLE_NAMES.CLIENT)
  const masters     = allUsers.filter(u => u.role?.roleName === ROLE_NAMES.MASTER)

  const needAttention = [...newApps].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 8)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Панель администратора</h1>
        <p className="text-white/40 text-sm mt-1">Управление заявками и ресурсами</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Новых заявок"  value={newApps.length}  icon={AlertCircle} iconColor="text-amber-accent"   iconBg="bg-amber-accent/10" />
        <StatCard title="В работе"      value={inWork.length}   icon={Wrench}      iconColor="text-blue-accent"    iconBg="bg-blue-accent/10" />
        <StatCard title="Клиентов"      value={clients.length}  icon={Users}       iconColor="text-violet-neon"   iconBg="bg-violet-neon/10" />
        <StatCard title="Мастеров"      value={masters.length}  icon={FileText}    iconColor="text-emerald-accent" iconBg="bg-emerald-accent/10" />
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-accent" /> Новые заявки
          </h2>
          <button onClick={() => navigate('/admin/applications')} className="text-xs text-violet-light hover:text-violet-neon transition-colors">
            Все заявки →
          </button>
        </div>

        {needAttention.length === 0 ? (
          <p className="text-white/40 text-sm py-4 text-center">Новых заявок нет</p>
        ) : (
          <table className="table-glass">
            <thead><tr><th>№</th><th>Клиент</th><th>Автомобиль</th><th>Проблема</th><th>Дата</th><th>Статус</th></tr></thead>
            <tbody>
              {needAttention.map(app => (
                <tr key={app.id} className="cursor-pointer" onClick={() => navigate(`/admin/applications/${app.id}`)}>
                  <td className="text-violet-light font-medium">#{app.id}</td>
                  <td>{app.client?.fullName ?? '—'}</td>
                  <td>{app.car ? `${app.car.brand} ${app.car.model}` : '—'}</td>
                  <td className="max-w-48 truncate">{app.problemDescription}</td>
                  <td className="text-white/40">{formatDate(app.createdAt)}</td>
                  <td><StatusBadge statusName={app.status?.statusName} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
