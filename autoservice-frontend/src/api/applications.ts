import api from './axios'
import type { Application, CreateApplicationRequest } from '../types'

export const applicationsApi = {
  getAll: () => api.get<Application[]>('/api/applications'),
  getById: (id: number) => api.get<Application>(`/api/applications/${id}`),
  create: (data: CreateApplicationRequest) => api.post<Application>('/api/applications', data),
  update: (id: number, data: Partial<Application>) => api.put<Application>(`/api/applications/${id}`, data),
  delete: (id: number) => api.delete(`/api/applications/${id}`),
  changeStatus: (id: number, statusId: number) =>
    api.put<Application>(`/api/applications/${id}/status`, null, { params: { statusId } }),
}
