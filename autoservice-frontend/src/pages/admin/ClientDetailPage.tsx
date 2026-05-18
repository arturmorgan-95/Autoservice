import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Car, FileText, Trash2 } from 'lucide-react'
import { usersApi } from '../../api/users'
import { applicationsApi } from '../../api/applications'
import { carsApi } from '../../api/cars'
import { StatusBadge } from '../../components/shared/StatusBadge'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatDate } from '../../utils/formatters'
import toast from 'react-hot-toast'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const clientId = Number(id)

  const { data: user, isLoading } = useQuery({ queryKey: ['user', clientId], queryFn: () => usersApi.getById(clientId).then(r => r.data) })
  const { data: applications } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.getAll().then(r => r.data) })
  const { data: cars } = useQuery({ queryKey: ['cars'], queryFn: () => carsApi.getAll().then(r => r.data) })

  const deleteCarMutation = useMutation({
    mutationFn: (carId: number) => carsApi.delete(carId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cars'] }); toast.success('Автомобиль удалён') },
    onError: (err: any) => toast.error(err?.response?.data?.message ?? 'Ошибка удаления'),
  })

  if (isLoading) return <PageSpinner />
  if (!user) return <p className="text-white/40">Клиент не найден</p>

  const clientApps = (applications ?? []).filter(a => a.clientId === clientId)
  const clientCars = (cars ?? []).filter(c => c.clientId === clientId)

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center border border-white/10"><ArrowLeft size={16} /></button>
        <div>
          <h1 className="text-xl font-bold text-white">{user.fullName}</h1>
          <p className="text-white/40 text-sm">{user.email} · {user.phoneNumber}</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h3 className="font-medium text-white flex items-center gap-2 mb-4"><Car size={16} className="text-violet-neon" /> Автомобили ({clientCars.length})</h3>
        {clientCars.length === 0 ? <p className="text-white/40 text-sm">Нет автомобилей</p> : (
          <div className="grid grid-cols-2 gap-3">
            {clientCars.map(c => (
              <div key={c.id} className="bg-white/5 rounded-lg p-3 flex items-start justify-between">
                <div>
                  <p className="font-medium">{c.brand} {c.model} ({c.year})</p>
                  <p className="text-xs text-violet-light font-mono mt-1">{c.licensePlate}</p>
                </div>
                <button
                  onClick={() => deleteCarMutation.mutate(c.id)}
                  className="text-white/20 hover:text-rose-400 transition-colors ml-2 mt-0.5"
                  title="Удалить автомобиль"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card p-5">
        <h3 className="font-medium text-white flex items-center gap-2 mb-4"><FileText size={16} className="text-blue-accent" /> Заявки ({clientApps.length})</h3>
        {clientApps.length === 0 ? <p className="text-white/40 text-sm">Нет заявок</p> : (
          <table className="table-glass">
            <thead><tr><th>№</th><th>Автомобиль</th><th>Описание</th><th>Дата</th><th>Статус</th></tr></thead>
            <tbody>
              {clientApps.map(a => (
                <tr key={a.id} className="cursor-pointer" onClick={() => navigate(`/admin/applications/${a.id}`)}>
                  <td className="text-violet-light">#{a.id}</td>
                  <td>{a.car ? `${a.car.brand} ${a.car.model}` : '—'}</td>
                  <td className="max-w-40 truncate">{a.problemDescription}</td>
                  <td className="text-white/40">{formatDate(a.createdAt)}</td>
                  <td><StatusBadge statusName={a.status?.statusName} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
