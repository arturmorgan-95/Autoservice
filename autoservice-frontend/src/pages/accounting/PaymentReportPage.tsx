import { useQuery } from '@tanstack/react-query'
import { BarChart2, Download } from 'lucide-react'
import { paymentsApi } from '../../api/payments'
import { PageSpinner } from '../../components/ui/Spinner'
import { formatMoney, formatMonthYear } from '../../utils/formatters'

export function PaymentReportPage() {
  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: () => paymentsApi.getAll().then(r => r.data),
  })

  if (isLoading) return <PageSpinner />

  const paid = (payments ?? []).filter(p => p.paymentStatus === 'Оплачено')

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

  const exportCsv = () => {
    const rows = [
      ['Период', 'Платежей', 'Итого', 'Наличные', 'Карта', 'Перевод'],
      ...months.map(([k, v]) => [formatMonthYear(k + '-01'), v.count, v.total, v.cash, v.card, v.transfer]),
    ]
    const csv = rows.map(r => r.join(';')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Отчёты по платежам</h1>
          <p className="text-white/40 text-sm mt-1">Разбивка по месяцам</p>
        </div>
        <button onClick={exportCsv} className="btn-secondary flex items-center gap-2"><Download size={16} /> Экспорт CSV</button>
      </div>

      {months.length === 0 ? (
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
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-white/40">Наличные</p>
                    <p className="font-medium">{formatMoney(val.cash)}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-white/40">Карта</p>
                    <p className="font-medium">{formatMoney(val.card)}</p>
                  </div>
                  <div className="bg-white/5 rounded p-2">
                    <p className="text-white/40">Перевод</p>
                    <p className="font-medium">{formatMoney(val.transfer)}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
