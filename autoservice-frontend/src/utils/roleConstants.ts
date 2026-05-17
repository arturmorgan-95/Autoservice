export const ROLE_NAMES = {
  CLIENT: 'Клиент',
  ADMIN: 'Администратор',
  MASTER: 'Мастер',
  ACCOUNTING: 'Бухгалтер',
  DIRECTOR: 'Директор',
} as const

export type RoleName = typeof ROLE_NAMES[keyof typeof ROLE_NAMES]

export const ROLE_ROUTES: Record<string, string> = {
  [ROLE_NAMES.CLIENT]: '/client/dashboard',
  [ROLE_NAMES.ADMIN]: '/admin/dashboard',
  [ROLE_NAMES.MASTER]: '/master/dashboard',
  [ROLE_NAMES.ACCOUNTING]: '/accounting/dashboard',
  [ROLE_NAMES.DIRECTOR]: '/director/dashboard',
}
