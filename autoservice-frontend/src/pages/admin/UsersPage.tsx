import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Plus, Trash2, Search } from 'lucide-react'
import { usersApi } from '../../api/users'
import { rolesApi } from '../../api/roles'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import type { CreateUserRequest } from '../../types'

export function UsersPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<CreateUserRequest>({ roleId: 1, fullName: '', email: '', phoneNumber: '', login: '', passwordHash: '' })

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) })
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: () => rolesApi.getAll().then(r => r.data) })

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowAdd(false); toast.success('Пользователь создан') },
    onError: () => toast.error('Ошибка создания'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('Удалено') },
    onError: () => toast.error('Ошибка удаления'),
  })

  if (isLoading) return <PageSpinner />

  const filtered = (users ?? []).filter(u =>
    !search || u.fullName.toLowerCase().includes(search.toLowerCase()) || u.login.toLowerCase().includes(search.toLowerCase())
  )

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.name === 'roleId' ? Number(e.target.value) : e.target.value }))

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Сотрудники</h1>
          <p className="text-white/40 text-sm mt-1">Всего: {(users ?? []).length}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-2"><Plus size={16} /> Добавить</button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск..." className="input-glass pl-8 text-sm" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="Пользователей не найдено" />
      ) : (
        <div className="glass-card overflow-hidden">
          <table className="table-glass">
            <thead><tr><th>Имя</th><th>Логин</th><th>Email</th><th>Роль</th><th></th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.fullName}</td>
                  <td className="text-white/50 font-mono text-xs">{u.login}</td>
                  <td className="text-white/50">{u.email}</td>
                  <td><Badge label={u.role?.roleName ?? '—'} variant="violet" /></td>
                  <td>
                    <button onClick={() => deleteMutation.mutate(u.id)} className="text-white/20 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Новый пользователь" size="md">
        <form onSubmit={e => { e.preventDefault(); createMutation.mutate(form) }} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-white/60 mb-1">ФИО</label><input name="fullName" value={form.fullName} onChange={handle} required className="input-glass" /></div>
            <div><label className="block text-sm text-white/60 mb-1">Email</label><input name="email" value={form.email} onChange={handle} type="email" required className="input-glass" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-white/60 mb-1">Телефон</label><input name="phoneNumber" value={form.phoneNumber} onChange={handle} className="input-glass" /></div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Роль</label>
              <select name="roleId" value={form.roleId} onChange={handle} className="select-glass">
                {(roles ?? []).map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm text-white/60 mb-1">Логин</label><input name="login" value={form.login} onChange={handle} required className="input-glass" /></div>
            <div><label className="block text-sm text-white/60 mb-1">Пароль</label><input name="passwordHash" value={form.passwordHash} onChange={handle} required type="password" className="input-glass" /></div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowAdd(false)} className="btn-secondary flex-1">Отмена</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">{createMutation.isPending ? 'Создание...' : 'Создать'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
