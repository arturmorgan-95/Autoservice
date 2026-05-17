import { type LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-neon/10 border border-violet-neon/20 flex items-center justify-center mb-4">
        <Icon size={28} className="text-violet-neon/60" />
      </div>
      <h3 className="text-lg font-medium text-white/80 mb-1">{title}</h3>
      {description && <p className="text-sm text-white/40 mb-4 max-w-xs">{description}</p>}
      {action && (
        <button onClick={action.onClick} className="btn-primary text-sm">
          {action.label}
        </button>
      )}
    </div>
  )
}
