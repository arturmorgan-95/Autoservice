import { useQuery } from '@tanstack/react-query'
import { Users, Search } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usersApi } from '../../api/users'
import { applicationsApi } from '../../api/applications'
import { PageSpinner } from '../../components/ui/Spinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { ROLE_NAMES } from '../../utils/roleConstants'

export function ClientsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const { data: users, isLoading } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) })
  const { data: applications } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.getAll().then(r => r.data) })

  if (isLoading) return <PageSpinner />

  const clients = (users ?? []).filter(u => u.role?.roleName === ROLE_NAMES.CLIENT)
  const filtered = clients.filter(c =>
    !search ||
    c.fullName.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber.includes(search)
  )

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
            <thead><tr><th>Имя</th><th>Email</th><th>Телефон</th><th>Заявок</th></tr></thead>
            <tbody>
              {filtered.map(c => {
                const count = (applications ?? []).filter(a => a.clientId === c.id).length
                return (
                  <tr key={c.id} className="cursor-pointer" onClick={() => navigate(`/admin/clients/${c.id}`)}>
                    <td className="font-medium">{c.fullName}</td>
                    <td className="text-white/50">{c.email}</td>
                    <td className="text-white/50">{c.phoneNumber}</td>
                    <td className="text-violet-light">{count}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
