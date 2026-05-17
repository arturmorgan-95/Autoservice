import { Badge } from '../ui/Badge'

const STATUS_VARIANTS: Record<string, 'blue' | 'yellow' | 'green' | 'red' | 'gray'> = {
  'Новая':      'blue',
  'Принята':    'violet' as 'blue',
  'В работе':   'yellow',
  'Завершена':  'green',
  'Отменена':   'red',
  'Ожидает':    'yellow',
  'Выполнена':  'green',
}

interface StatusBadgeProps {
  statusName?: string
}

export function StatusBadge({ statusName }: StatusBadgeProps) {
  if (!statusName) return <Badge label="—" variant="gray" />
  const variant = STATUS_VARIANTS[statusName] ?? 'gray'
  return <Badge label={statusName} variant={variant} />
}
