import api from './axios'
import type { Role } from '../types'

export const rolesApi = {
  getAll: () => api.get<Role[]>('/api/roles'),
  getById: (id: number) => api.get<Role>(`/api/roles/${id}`),
  create: (data: Omit<Role, 'id'>) => api.post<Role>('/api/roles', data),
  update: (id: number, data: Partial<Role>) => api.put<Role>(`/api/roles/${id}`, data),
  delete: (id: number) => api.delete(`/api/roles/${id}`),
}
