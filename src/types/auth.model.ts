export interface LoginRequest {
  organizationId?: string
  email: string
  password: string
}

export interface RegisterRequest {
  organizationId: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  roles: string[]
}

export interface AuthResponse {
  token: string
  tokenType: string
  expiresIn: number
  user: UserResponse
}

export interface UserResponse {
  id: string
  organizationId: string | null
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string
  roles: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Role = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "NURSE" | "PHARMACIST" | "CASHIER"
