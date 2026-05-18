import api from './axios'
import type { Payment, CreatePaymentRequest } from '../types'

export const paymentsApi = {
  getAll: () => api.get<Payment[]>('/api/payments'),
  getById: (id: number) => api.get<Payment>(`/api/payments/${id}`),
  create: (data: CreatePaymentRequest) => api.post<Payment>('/api/payments', data),
  update: (id: number, data: Partial<Payment>) => api.put<Payment>(`/api/payments/${id}`, data),
  delete: (id: number) => api.delete(`/api/payments/${id}`),
  changeStatus: (id: number, status: string) => api.put(`/api/payments/${id}/status`, null, { params: { status } }),
}
