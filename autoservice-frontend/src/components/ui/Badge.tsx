interface BadgeProps {
  label: string
  variant?: 'violet' | 'blue' | 'green' | 'yellow' | 'red' | 'gray'
}

const variants = {
  violet: 'bg-violet-neon/20 text-violet-light border-violet-neon/30',
  blue:   'bg-blue-accent/20 text-blue-light border-blue-accent/30',
  green:  'bg-emerald-accent/20 text-emerald-400 border-emerald-accent/30',
  yellow: 'bg-amber-accent/20 text-amber-400 border-amber-accent/30',
  red:    'bg-rose-accent/20 text-rose-400 border-rose-accent/30',
  gray:   'bg-white/10 text-white/60 border-white/20',
}

export function Badge({ label, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}>
      {label}
    </span>
  )
}
