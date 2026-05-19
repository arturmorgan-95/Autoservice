import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart2, Download, FileText, Users, Wrench, CreditCard } from 'lucide-react'
import { paymentsApi } from '../../api/payments'
import { applicationsApi } from '../../api/applications'
import { applicationServicesApi } from '../../api/applicationServices'
import { usersApi } from '../../api/users'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatMoney, formatMonthYear, formatDate } from '../../utils/formatters'
import { ROLE_NAMES } from '../../utils/roleConstants'

type Tab = 'months' | 'applications' | 'clients' | 'services'

function statusStyle(s?: string) {
  if (!s) return 'bg-white/10 text-white/50'
  if (s === 'Завершена') return 'bg-emerald-accent/20 text-emerald-400'
  if (s === 'Отменена') return 'bg-rose-accent/20 text-rose-400'
  return 'bg-amber-accent/20 text-amber-400'
}

export function AccountingReportPage() {
  const [tab, setTab] = useState<Tab>('months')

  const { data: payments, isLoading: lPay } = useQuery({ queryKey: ['payments'], queryFn: () => paymentsApi.getAll().then(r => r.data) })
  const { data: applications, isLoading: lApp } = useQuery({ queryKey: ['applications'], queryFn: () => applicationsApi.getAll().then(r => r.data) })
  const { data: appServices, isLoading: lSvc } = useQuery({ queryKey: ['applicationservices'], queryFn: () => applicationServicesApi.getAll().then(r => r.data) })
  const { data: users, isLoading: lUsr } = useQuery({ queryKey: ['users'], queryFn: () => usersApi.getAll().then(r => r.data) })

  if (lPay || lApp || lSvc || lUsr) return <PageSpinner />

  const allPayments = payments ?? []
  const allApps = applications ?? []
  const allSvc = appServices ?? []
  const allUsers = users ?? []

  // ── Вкладка 1: По месяцам ──────────────────────────────────────────
  const paid = allPayments.filter(p => p.paymentStatus === 'Оплачено')
  const byMonth: Record<string, { count: number; total: number; cash: number; card: number; transfer: number }> = {}
  paid.forEach(p => {
    const key = p.paymentDate.slice(0, 7)
    if (!byMonth[key]) byMonth[key] = { count: 0, total: 0, cash: 0, card: 0, transfer: 0 }
    byMonth[key].count++
    byMonth[key].total += p.amount
    if (p.paymentMethod === 'Наличные') byMonth[key].cash += p.amount
    else if (p.paymentMethod === 'Карта') byMonth[key].card += p.amount
    else byMonth[key].transfer += p.amount
  })
  const months = Object.entries(byMonth).sort((a, b) => b[0].localeCompare(a[0]))

  // ── Вкладка 2: Заявки ─────────────────────────────────────────────
  const appRows = allApps.map(app => {
    const svcTotal = allSvc.filter(s => s.applicationId === app.id).reduce((s, x) => s + x.price, 0)
    const paidTotal = allPayments.filter(p => p.applicationId === app.id && p.paymentStatus === 'Оплачено').reduce((s, p) => s + p.amount, 0)
    return { app, svcTotal, paidTotal, balance: svcTotal - paidTotal }
  }).sort((a, b) => b.app.id - a.app.id)

  // ── Вкладка 3: Клиенты ────────────────────────────────────────────
  const clients = allUsers.filter(u => u.role?.roleName === ROLE_NAMES.CLIENT)
  const clientRows = clients.map(c => {
    const apps = allApps.filter(a => a.clientId === c.id)
    const svcTotal = apps.reduce((sum, app) => {
      return sum + allSvc.filter(s => s.applicationId === app.id).reduce((s, x) => s + x.price, 0)
    }, 0)
    const paidTotal = allPayments.filter(p => {
      const app = allApps.find(a => a.id === p.applicationId)
      return app?.clientId === c.id && p.paymentStatus === 'Оплачено'
    }).reduce((s, p) => s + p.amount, 0)
    return { client: c, appCount: apps.length, svcTotal, paidTotal, debt: svcTotal - paidTotal }
  }).filter(r => r.appCount > 0).sort((a, b) => b.debt - a.debt)

  // ── Вкладка 4: Услуги ─────────────────────────────────────────────
  const svcMap: Record<string, { count: number; revenue: number }> = {}
  allSvc.forEach(s => {
    const name = s.service?.serviceName ?? `Услуга #${s.serviceId}`
    if (!svcMap[name]) svcMap[name] = { count: 0, revenue: 0 }
    svcMap[name].count++
    svcMap[name].revenue += s.price
  })
  const svcRows = Object.entries(svcMap).sort((a, b) => b[1].revenue - a[1].revenue)

  // ── CSV экспорт ───────────────────────────────────────────────────
  const exportCsv = () => {
    const rows: (string | number)[][] = [['Период', 'Платежей', 'Итого', 'Наличные', 'Карта', 'Перевод']]
    months.forEach(([k, v]) => rows.push([formatMonthYear(k + '-01'), v.count, v.total, v.cash, v.card, v.transfer]))
    rows.push([])
    rows.push(['Заявка', 'Клиент', 'Автомобиль', 'Статус', 'Стоимость услуг', 'Оплачено', 'Долг'])
    appRows.forEach(({ app, svcTotal, paidTotal, balance }) =>
      rows.push([`#${app.id}`, app.client?.fullName ?? '—', app.car ? `${app.car.brand} ${app.car.model}` : '—', app.status?.statusName ?? '—', svcTotal, paidTotal, balance])
    )
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'accounting-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'months',       label: 'По месяцам',  icon: BarChart2  },
    { id: 'applications', label: 'Заявки',       icon: FileText   },
    { id: 'clients',      label: 'Клиенты',      icon: Users      },
    { id: 'services',     label: 'Услуги',        icon: Wrench     },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Полная отчётность</h1>
          <p className="text-white/40 text-sm mt-1">Финансы, заявки, клиенты, услуги</p>
        </div>
        <button onClick={exportCsv} className="btn-secondary flex items-center gap-2">
          <Download size={16} /> Экспорт CSV
        </button>
      </div>

      {/* Вкладки */}
      <div className="flex rounded-xl bg-white/5 p-1 gap-1 w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-gradient-violet text-white shadow-neon-sm' : 'text-white/40 hover:text-white/70'}`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* По месяцам */}
      {tab === 'months' && (
        months.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <BarChart2 size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Нет данных для отчёта</p>
          </div>
        ) : (
          <div className="space-y-3">
            {months.map(([key, val]) => {
              const maxBar = Math.max(...months.map(m => m[1].total)) || 1
              const pct = (val.total / maxBar) * 100
              return (
                <div key={key} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-white capitalize">{formatMonthYear(key + '-01')}</h3>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">{formatMoney(val.total)}</p>
                      <p className="text-xs text-white/40">{val.count} платеж(ей)</p>
                    </div>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
                    <div className="h-full bg-gradient-violet rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-xs text-center">
                    <div className="bg-white/5 rounded p-2"><p className="text-white/40">Наличные</p><p className="font-medium">{formatMoney(val.cash)}</p></div>
                    <div className="bg-white/5 rounded p-2"><p className="text-white/40">Карта</p><p className="font-medium">{formatMoney(val.card)}</p></div>
                    <div className="bg-white/5 rounded p-2"><p className="text-white/40">Перевод</p><p className="font-medium">{formatMoney(val.transfer)}</p></div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      )}

      {/* Заявки */}
      {tab === 'applications' && (
        <div className="glass-card overflow-hidden">
          <table className="table-glass">
            <thead>
              <tr>
                <th>Заявка</th>
                <th>Клиент</th>
                <th>Автомобиль</th>
                <th>Дата</th>
                <th>Статус</th>
                <th>Стоимость услуг</th>
                <th>Оплачено</th>
                <th>Долг</th>
              </tr>
            </thead>
            <tbody>
              {appRows.map(({ app, svcTotal, paidTotal, balance }) => (
                <tr key={app.id}>
                  <td className="text-violet-light font-medium">#{app.id}</td>
                  <td>{app.client?.fullName ?? '—'}</td>
                  <td className="text-white/60">{app.car ? `${app.car.brand} ${app.car.model}` : '—'}</td>
                  <td className="text-white/40 whitespace-nowrap">{formatDate(app.createdAt)}</td>
                  <td>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusStyle(app.status?.statusName)}`}>
                      {app.status?.statusName ?? '—'}
                    </span>
                  </td>
                  <td className="font-medium">{svcTotal > 0 ? formatMoney(svcTotal) : '—'}</td>
                  <td className="text-emerald-400">{paidTotal > 0 ? formatMoney(paidTotal) : '—'}</td>
                  <td>
                    {svcTotal === 0 ? <span className="text-white/30">—</span>
                      : balance > 0
                        ? <span className="text-rose-400 font-semibold">{formatMoney(balance)}</span>
                        : <span className="text-emerald-400 font-semibold">Оплачено</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Клиенты */}
      {tab === 'clients' && (
        clientRows.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Users size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Нет данных о клиентах</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Клиент</th>
                  <th>Email</th>
                  <th>Телефон</th>
                  <th>Заявок</th>
                  <th>Стоимость услуг</th>
                  <th>Оплачено</th>
                  <th>Задолженность</th>
                </tr>
              </thead>
              <tbody>
                {clientRows.map(({ client, appCount, svcTotal, paidTotal, debt }) => (
                  <tr key={client.id}>
                    <td className="font-medium">{client.fullName}</td>
                    <td className="text-white/50">{client.email || '—'}</td>
                    <td className="text-white/50">{client.phoneNumber || '—'}</td>
                    <td className="text-violet-light">{appCount}</td>
                    <td className="font-medium">{formatMoney(svcTotal)}</td>
                    <td className="text-emerald-400">{formatMoney(paidTotal)}</td>
                    <td>
                      {debt > 0
                        ? <span className="text-rose-400 font-semibold">{formatMoney(debt)}</span>
                        : <span className="text-emerald-400 font-semibold">Нет долга</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Услуги */}
      {tab === 'services' && (
        svcRows.length === 0 ? (
          <div className="glass-card p-8 text-center">
            <Wrench size={40} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Нет данных об услугах</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="table-glass">
              <thead>
                <tr>
                  <th>Услуга</th>
                  <th>Выполнено раз</th>
                  <th>Выручка</th>
                  <th>Доля</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const totalRevenue = svcRows.reduce((s, [, v]) => s + v.revenue, 0)
                  return svcRows.map(([name, val]) => {
                    const pct = totalRevenue > 0 ? ((val.revenue / totalRevenue) * 100).toFixed(1) : '0'
                    return (
                      <tr key={name}>
                        <td className="font-medium">{name}</td>
                        <td className="text-violet-light">{val.count}</td>
                        <td className="text-emerald-400 font-semibold">{formatMoney(val.revenue)}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-violet rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs text-white/40 w-10 text-right">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                })()}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Итоговая строка платежей */}
      {tab === 'applications' && appRows.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-white/40">Всего заявок</p>
              <p className="font-bold text-white text-lg">{appRows.length}</p>
            </div>
            <div>
              <p className="text-white/40">Стоимость услуг (итого)</p>
              <p className="font-bold text-white text-lg">{formatMoney(appRows.reduce((s, r) => s + r.svcTotal, 0))}</p>
            </div>
            <div>
              <p className="text-white/40">Оплачено (итого)</p>
              <p className="font-bold text-emerald-400 text-lg">{formatMoney(appRows.reduce((s, r) => s + r.paidTotal, 0))}</p>
            </div>
            <div>
              <p className="text-white/40">Общий долг</p>
              <p className="font-bold text-rose-400 text-lg">{formatMoney(appRows.filter(r => r.balance > 0).reduce((s, r) => s + r.balance, 0))}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'clients' && clientRows.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-white/40">Клиентов с заявками</p>
              <p className="font-bold text-white text-lg">{clientRows.length}</p>
            </div>
            <div>
              <p className="text-white/40">Оплачено (итого)</p>
              <p className="font-bold text-emerald-400 text-lg">{formatMoney(clientRows.reduce((s, r) => s + r.paidTotal, 0))}</p>
            </div>
            <div>
              <p className="text-white/40">Общий долг клиентов</p>
              <p className="font-bold text-rose-400 text-lg">{formatMoney(clientRows.filter(r => r.debt > 0).reduce((s, r) => s + r.debt, 0))}</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'services' && svcRows.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex gap-8 text-sm">
            <div>
              <p className="text-white/40">Видов услуг</p>
              <p className="font-bold text-white text-lg">{svcRows.length}</p>
            </div>
            <div>
              <p className="text-white/40">Услуг выполнено</p>
              <p className="font-bold text-white text-lg">{svcRows.reduce((s, [, v]) => s + v.count, 0)}</p>
            </div>
            <div>
              <p className="text-white/40">Выручка от услуг</p>
              <p className="font-bold text-emerald-400 text-lg">{formatMoney(svcRows.reduce((s, [, v]) => s + v.revenue, 0))}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
