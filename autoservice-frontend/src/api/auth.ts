import api from './axios'
import type { LoginRequest, User, CreateUserRequest } from '../types'

export const authApi = {
  login: (data: LoginRequest) => api.post<User>('/api/auth/login', data),
  register: (data: CreateUserRequest) => api.post<User>('/api/users', data),
}
