import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Plus, Trash2, Search, Pencil } from 'lucide-react'
import { usersApi } from '../../api/users'
import { rolesApi } from '../../api/roles'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import toast from 'react-hot-toast'
import type { Role, User, CreateUserRequest } from '../../types'

interface UserFormProps {
  form: CreateUserRequest
  roles: Role[]
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSubmit: () => void
  onCancel: () => void
  loading: boolean
  isEdit?: boolean
}

function UserForm({ form, roles, onChange, onSubmit, onCancel, loading, isEdit }: UserFormProps) {
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit() }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/60 mb-1">ФИО</label>
          <input name="fullName" value={form.fullName} onChange={onChange} required className="input-glass" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Email</label>
          <input name="email" value={form.email} onChange={onChange} type="email" className="input-glass" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/60 mb-1">Телефон</label>
          <input name="phoneNumber" value={form.phoneNumber} onChange={onChange} className="input-glass" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">Роль</label>
          <select name="roleId" value={form.roleId} onChange={onChange} className="select-glass">
            {roles.map(r => <option key={r.id} value={r.id}>{r.roleName}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-white/60 mb-1">Логин</label>
          <input name="login" value={form.login} onChange={onChange} required className="input-glass" />
        </div>
        <div>
          <label className="block text-sm text-white/60 mb-1">
            Пароль {isEdit && <span className="text-white/30 text-xs">(пусто — не менять)</span>}
          </label>
          <input name="passwordHash" value={form.passwordHash} onChange={onChange} required={!isEdit} type="password" className="input-glass" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Отмена</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать'}
        </button>
      </div>
    </form>
  )
}

const emptyForm = (): CreateUserRequest => ({
  roleId: 5, fullName: '', email: '', phoneNumber: '', login: '', passwordHash: '',
})

export function UsersPage() {
  const qc = useQueryClient()
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<CreateUserRequest>(emptyForm())

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) })
  const { data: roles } = useQuery({ queryKey: ['roles'], queryFn: () => rolesApi.getAll().then(r => r.data) })

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => usersApi.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowAdd(false); setForm(emptyForm()); toast.success('Пользователь создан') },
    onError: () => toast.error('Ошибка создания'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CreateUserRequest }) =>
      usersApi.update(id, { ...data, id }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setEditing(null); toast.success('Данные обновлены') },
    onError: () => toast.error('Ошибка обновления'),
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.name === 'roleId' ? Number(e.target.value) : e.target.value }))

  const openEdit = (u: User) => {
    setEditing(u)
    setForm({ roleId: u.roleId, fullName: u.fullName, email: u.email, phoneNumber: u.phoneNumber, login: u.login, passwordHash: '' })
  }

  const handleUpdate = () => {
    if (!editing) return
    const data = { ...form }
    if (!data.passwordHash) data.passwordHash = editing.passwordHash
    updateMutation.mutate({ id: editing.id, data })
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Сотрудники</h1>
          <p className="text-white/40 text-sm mt-1">Всего: {(users ?? []).length}</p>
        </div>
        <button onClick={() => { setForm(emptyForm()); setShowAdd(true) }} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Добавить
        </button>
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
            <thead><tr><th>Имя</th><th>Логин</th><th>Email</th><th>Телефон</th><th>Роль</th><th></th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td className="font-medium">{u.fullName}</td>
                  <td className="text-white/50 font-mono text-xs">{u.login}</td>
                  <td className="text-white/50">{u.email}</td>
                  <td className="text-white/50">{u.phoneNumber}</td>
                  <td><Badge label={u.role?.roleName ?? '—'} variant="violet" /></td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(u)} className="text-white/30 hover:text-violet-light transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => deleteMutation.mutate(u.id)} className="text-white/30 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Новый пользователь" size="md">
        <UserForm
          form={form}
          roles={roles ?? []}
          onChange={handleChange}
          onSubmit={() => createMutation.mutate(form)}
          onCancel={() => setShowAdd(false)}
          loading={createMutation.isPending}
        />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="Редактировать пользователя" size="md">
        <UserForm
          isEdit
          form={form}
          roles={roles ?? []}
          onChange={handleChange}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
          loading={updateMutation.isPending}
        />
      </Modal>
    </div>
  )
}
