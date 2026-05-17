import api from './axios'
import type { LoginRequest, User } from '../types'

export const authApi = {
  login: (data: LoginRequest) => api.post<User>('/api/auth/login', data),
}
