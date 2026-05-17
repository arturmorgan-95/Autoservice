import api from './axios'
import type { ApplicationService } from '../types'

export const applicationServicesApi = {
  getAll: () => api.get<ApplicationService[]>('/api/applicationservices'),
  getById: (id: number) => api.get<ApplicationService>(`/api/applicationservices/${id}`),
  create: (data: Omit<ApplicationService, 'id' | 'application' | 'service' | 'master' | 'status'>) =>
    api.post<ApplicationService>('/api/applicationservices', data),
  update: (id: number, data: Partial<ApplicationService>) =>
    api.put<ApplicationService>(`/api/applicationservices/${id}`, data),
  delete: (id: number) => api.delete(`/api/applicationservices/${id}`),
  changeStatus: (id: number, statusId: number) =>
    api.put<ApplicationService>(`/api/applicationservices/${id}/status`, null, { params: { statusId } }),
}
