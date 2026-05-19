import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { ROLE_NAMES } from '../utils/roleConstants'
import { ROLE_ROUTES } from '../utils/roleConstants'
import { ProtectedRoute } from './ProtectedRoute'
import { Layout } from '../components/layout/Layout'

import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'
import { NotFoundPage } from '../pages/shared/NotFoundPage'
import { UnauthorizedPage } from '../pages/shared/UnauthorizedPage'

import { ClientDashboard }      from '../pages/client/ClientDashboard'
import { MyCarsPage }           from '../pages/client/MyCarsPage'
import { MyApplicationsPage }   from '../pages/client/MyApplicationsPage'
import { ApplicationDetailPage } from '../pages/client/ApplicationDetailPage'
import { MyPaymentsPage }       from '../pages/client/MyPaymentsPage'

import { AdminDashboard }          from '../pages/admin/AdminDashboard'
import { AllApplicationsPage }     from '../pages/admin/AllApplicationsPage'
import { ApplicationManagePage }   from '../pages/admin/ApplicationManagePage'
import { ClientsPage }             from '../pages/admin/ClientsPage'
import { ClientDetailPage }        from '../pages/admin/ClientDetailPage'
import { ServicesPage }            from '../pages/admin/ServicesPage'
import { UsersPage }               from '../pages/admin/UsersPage'

import { MasterDashboard } from '../pages/master/MasterDashboard'
import { MasterTasksPage } from '../pages/master/MasterTasksPage'

import { AccountingDashboard }    from '../pages/accounting/AccountingDashboard'
import { PaymentsPage }           from '../pages/accounting/PaymentsPage'
import { PaymentReportPage }      from '../pages/accounting/PaymentReportPage'
import { AccountingReportPage }   from '../pages/accounting/AccountingReportPage'


import { DirectorDashboard }  from '../pages/director/DirectorDashboard'
import { MastersLoadPage }    from '../pages/director/MastersLoadPage'
import { StatsPage }          from '../pages/director/StatsPage'

function RootRedirect() {
  const { isAuthenticated, roleName } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const route = (roleName && ROLE_ROUTES[roleName]) ?? '/login'
  return <Navigate to={route} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/" element={<RootRedirect />} />

      {/* Клиент */}
      <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.CLIENT]} />}>
        <Route element={<Layout />}>
          <Route path="/client/dashboard"         element={<ClientDashboard />} />
          <Route path="/client/cars"              element={<MyCarsPage />} />
          <Route path="/client/applications"      element={<MyApplicationsPage />} />
          <Route path="/client/applications/:id"  element={<ApplicationDetailPage />} />
          <Route path="/client/payments"          element={<MyPaymentsPage />} />
        </Route>
      </Route>

      {/* Администратор */}
      <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.ADMIN]} />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard"          element={<AdminDashboard />} />
          <Route path="/admin/applications"       element={<AllApplicationsPage />} />
          <Route path="/admin/applications/:id"   element={<ApplicationManagePage />} />
          <Route path="/admin/clients"            element={<ClientsPage />} />
          <Route path="/admin/clients/:id"        element={<ClientDetailPage />} />
          <Route path="/admin/services"           element={<ServicesPage />} />
          <Route path="/admin/users"              element={<UsersPage />} />
          <Route path="/admin/payments"           element={<PaymentsPage />} />
          <Route path="/admin/reports"            element={<PaymentReportPage />} />
        </Route>
      </Route>

      {/* Мастер */}
      <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.MASTER]} />}>
        <Route element={<Layout />}>
          <Route path="/master/dashboard" element={<MasterDashboard />} />
          <Route path="/master/tasks"     element={<MasterTasksPage />} />
        </Route>
      </Route>

      {/* Бухгалтерия */}
      <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.ACCOUNTING]} />}>
        <Route element={<Layout />}>
          <Route path="/accounting/dashboard" element={<AccountingDashboard />} />
          <Route path="/accounting/reports"   element={<AccountingReportPage />} />
        </Route>
      </Route>

      {/* Директор */}
      <Route element={<ProtectedRoute allowedRoles={[ROLE_NAMES.DIRECTOR]} />}>
        <Route element={<Layout />}>
          <Route path="/director/dashboard" element={<DirectorDashboard />} />
          <Route path="/director/masters"   element={<MastersLoadPage />} />
          <Route path="/director/stats"     element={<StatsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
