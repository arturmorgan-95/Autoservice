import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Search, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../../api/users'
import { applicationsApi } from '../../api/applications'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { ROLE_NAMES } from '../../utils/roleConstants'
import toast from 'react-hot-toast'
import type { User } from '../../types'

export function ClientsPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<User | null>(null)
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '' })

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) })
  const { data: applications } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.getAll().then(r => r.data) })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof form }) =>
      usersApi.update(id, { ...editing!, ...data, id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setEditing(null); toast.success('Данные клиента обновлены') },
    onError: () => toast.error('Ошибка обновления'),
  })

  if (isLoading) return <PageSpinner />

  const clients = (users ?? []).filter(u => u.role?.roleName === ROLE_NAMES.CLIENT)
  const filtered = clients.filter(c =>
    !search ||
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber.includes(search)
  )

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const openEdit = (c: User) => {
    setEditing(c)
    setForm({ fullName: c.fullName, email: c.email, phoneNumber: c.phoneNumber })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Клиенты</h1>
        <p className="text-white/40 text-sm mt-1">Всего: {clients.length}</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск клиента..." className="input-glass pl-8 text-sm" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Клиентов не найдено" />
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="table-glass">
            <thead><tr><th>Имя</th><th>Email</th><th>Телефон</th><th>Заявок</th><th></th></tr></thead>
            <tbody>
              {filtered.map(c => {
                const count = (applications ?? []).filter(a => a.clientId === c.id).length
                return (
                  <tr key={c.id}>
                    <td className="font-medium cursor-pointer hover:text-violet-light transition-colors" onClick={() => navigate(`/admin/clients/${c.id}`)}>
                      {c.fullName}
                    </td>
                    <td className="text-white/50">{c.email}</td>
                    <td className="text-white/50">{c.phoneNumber}</td>
                    <td className="text-violet-light">{count}</td>
                    <td>
                      <button onClick={() => openEdit(c)} className="text-white/30 hover:text-violet-light transition-colors">
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Редактировать клиента">
        {editing && (
          <form onSubmit={e => { e.preventDefault(); updateMutation.mutate({ id: editing.id, data: form }) }} className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">ФИО</label>
              <input name="fullName" value={form.fullName} onChange={handle} required className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Email</label>
              <input name="email" value={form.email} onChange={handle} type="email" className="input-glass" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Телефон</label>
              <input name="phoneNumber" value={form.phoneNumber} onChange={handle} className="input-glass" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-secondary flex-1">Отмена</button>
              <button type="submit" disabled={updateMutation.isPending} className="btn-primary flex-1">
                {updateMutation.isPending ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
