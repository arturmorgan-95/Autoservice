export interface Role {
  id: number
  roleName: string
}

export interface User {
  id: number
  roleId: number
  fullName: string
  email: string
  phoneNumber: string
  login: string
  passwordHash: string
  role?: Role
  cars?: Car[]
  clientApplications?: Application[]
  adminApplications?: Application[]
  masterServices?: ApplicationService[]
}

export interface Car {
  id: number
  clientId: number
  brand: string
  model: string
  year: number
  licensePlate: string
  client?: User
  applications?: Application[]
}

export interface Status {
  id: number
  statusName: string
}

export interface Service {
  id: number
  serviceName: string
  basePrice: number
  durationHours: number
}

export interface ApplicationService {
  id: number
  applicationId: number
  serviceId: number
  masterId: number
  statusId: number
  price: number
  application?: Application
  service?: Service
  master?: User
  status?: Status
}

export interface Payment {
  id: number
  applicationId: number
  amount: number
  paymentDate: string
  paymentStatus: string
  paymentMethod: string
  application?: Application
}

export interface Application {
  id: number
  clientId: number
  carId: number
  adminId?: number | null
  statusId: number
  problemDescription: string
  createdAt: string
  client?: User
  car?: Car
  admin?: User
  status?: Status
  applicationServices?: ApplicationService[]
  payments?: Payment[]
}

export interface LoginRequest {
  login: string
  passwordHash: string
}

export type CreateCarRequest = Omit<Car, 'id' | 'client' | 'applications'>
export type CreateApplicationRequest = Omit<Application, 'id' | 'client' | 'car' | 'admin' | 'status' | 'applicationServices' | 'payments' | 'createdAt'>
export type CreatePaymentRequest = Omit<Payment, 'id' | 'application'>
export type CreateServiceRequest = Omit<Service, 'id'>
export type CreateUserRequest = Omit<User, 'id' | 'role' | 'cars' | 'clientApplications' | 'adminApplications' | 'masterServices'>
