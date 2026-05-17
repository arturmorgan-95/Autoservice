export const ROUTES = {
  LOGIN: '/login',

  CLIENT_DASHBOARD: '/client/dashboard',
  CLIENT_CARS: '/client/cars',
  CLIENT_APPLICATIONS: '/client/applications',
  CLIENT_APPLICATION_DETAIL: '/client/applications/:id',
  CLIENT_PAYMENTS: '/client/payments',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_APPLICATIONS: '/admin/applications',
  ADMIN_APPLICATION_MANAGE: '/admin/applications/:id',
  ADMIN_CLIENTS: '/admin/clients',
  ADMIN_CLIENT_DETAIL: '/admin/clients/:id',
  ADMIN_SERVICES: '/admin/services',
  ADMIN_USERS: '/admin/users',

  MASTER_DASHBOARD: '/master/dashboard',
  MASTER_TASKS: '/master/tasks',

  ACCOUNTING_DASHBOARD: '/accounting/dashboard',
  ACCOUNTING_PAYMENTS: '/accounting/payments',
  ACCOUNTING_REPORTS: '/accounting/reports',

  DIRECTOR_DASHBOARD: '/director/dashboard',
  DIRECTOR_MASTERS: '/director/masters',
  DIRECTOR_STATS: '/director/stats',

  UNAUTHORIZED: '/unauthorized',
} as const
