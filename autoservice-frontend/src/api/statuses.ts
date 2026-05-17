import api from './axios'
import type { Status } from '../types'

export const statusesApi = {
  getAll: () => api.get<Status[]>('/api/statuses'),
  getById: (id: number) => api.get<Status>(`/api/statuses/${id}`),
  create: (data: Omit<Status, 'id'>) => api.post<Status>('/api/statuses', data),
  update: (id: number, data: Partial<Status>) => api.put<Status>(`/api/statuses/${id}`, data),
  delete: (id: number) => api.delete(`/api/statuses/${id}`),
}
