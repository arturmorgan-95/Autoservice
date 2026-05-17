import api from './axios'
import type { Car, CreateCarRequest } from '../types'

export const carsApi = {
  getAll: () => api.get<Car[]>('/api/cars'),
  getById: (id: number) => api.get<Car>(`/api/cars/${id}`),
  create: (data: CreateCarRequest) => api.post<Car>('/api/cars', data),
  update: (id: number, data: Partial<Car>) => api.put<Car>(`/api/cars/${id}`, data),
  delete: (id: number) => api.delete(`/api/cars/${id}`),
}
