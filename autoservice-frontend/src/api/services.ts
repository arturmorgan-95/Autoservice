import api from './axios'
import type { Service, CreateServiceRequest } from '../types'

export const servicesApi = {
  getAll: () => api.get<Service[]>('/api/services'),
  getById: (id: number) => api.get<Service>(`/api/services/${id}`),
  create: (data: CreateServiceRequest) => api.post<Service>('/api/services', data),
  update: (id: number, data: Partial<Service>) => api.put<Service>(`/api/services/${id}`, data),
  delete: (id: number) => api.delete(`/api/services/${id}`),
}
