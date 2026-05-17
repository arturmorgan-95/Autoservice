import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Car, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { carsApi } from '../../api/cars'
import { Modal } from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/EmptyState'
import { PageSpinner } from '../../components/ui/Spinner'
import { CarForm } from '../../components/forms/CarForm'
import toast from 'react-hot-toast'
import type { CreateCarRequest } from '../../types'

export function MyCarsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)

  const { data: cars, isLoading } = useQuery({
    queryKey: ['cars'],
    queryFn: () => carsApi.getAll().then(r => r.data),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => carsApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cars'] }); toast.success('Автомобиль удалён') },
    onError: () => toast.error('Ошибка удаления'),
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateCarRequest) => carsApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['cars'] }); setShowAdd(false); toast.success('Автомобиль добавлен') },
    onError: () => toast.error('Ошибка добавления'),
  })

  if (isLoading) return <PageSpinner />

  const myCars = (cars ?? []).filter(c => c.clientId === user?.id)

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Мои автомобили</h1>
          <p className="text-white/40 text-sm mt-1">Управление вашими транспортными средствами</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Добавить
        </button>
      </div>

      {myCars.length === 0 ? (
        <EmptyState
          icon={Car}
          title="Нет автомобилей"
          description="Добавьте свой первый автомобиль для создания заявок"
          action={{ label: 'Добавить автомобиль', onClick: () => setShowAdd(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myCars.map(car => (
            <div key={car.id} className="glass-card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-violet-neon/10 flex items-center justify-center">
                  <Car size={20} className="text-violet-neon" />
                </div>
                <button
                  onClick={() => deleteMutation.mutate(car.id)}
                  className="text-white/20 hover:text-rose-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              <h3 className="font-semibold text-white">{car.brand} {car.model}</h3>
              <p className="text-sm text-white/40 mt-0.5">{car.year} год</p>
              <div className="mt-3 pt-3 border-t border-white/5">
                <span className="text-xs font-mono bg-violet-neon/10 text-violet-light px-2 py-1 rounded">
                  {car.licensePlate}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Добавить автомобиль">
        <CarForm
          clientId={user!.id}
          onSubmit={(data) => createMutation.mutate(data)}
          loading={createMutation.isPending}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>
    </div>
  )
}
