import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  iconColor?: string
  iconBg?: string
  trend?: string
}

export function StatCard({ title, value, icon: Icon, iconColor = 'text-violet-neon', iconBg = 'bg-violet-neon/10', trend }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${iconBg} border border-current/10`}>
        <Icon size={22} className={iconColor} />
      </div>
      <div>
        <p className="text-xs text-white/50 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-0.5">{value}</p>
        {trend && <p className="text-xs text-emerald-400 mt-0.5">{trend}</p>}
      </div>
    </div>
  )
}
