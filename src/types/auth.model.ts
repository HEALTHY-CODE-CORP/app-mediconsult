export interface LoginRequest {
  organizationId?: string
  email: string
  password: string
}

export interface RegisterRequest {
  organizationId: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  roles: string[]
}

export interface UpdateUserRequest {
  email: string
  firstName: string
  lastName: string
  phone?: string
  billingLegalName?: string
  billingCommercialName?: string
  billingRuc?: string
  billingEstablishmentCode?: string
  billingEmissionPointCode?: string
  billingMatrixAddress?: string
  billingSpecialTaxpayerCode?: string
  billingAccountingRequired?: boolean
  sriEnvironment?: "1" | "2"
  consultationPrice?: number
  roles: string[]
}

export interface UpdateMyBillingProfileRequest {
  billingLegalName?: string
  billingCommercialName?: string
  billingRuc?: string
  billingEstablishmentCode?: string
  billingEmissionPointCode?: string
  billingMatrixAddress?: string
  billingSpecialTaxpayerCode?: string
  billingAccountingRequired?: boolean
  sriEnvironment?: "1" | "2"
  consultationPrice?: number
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
  billingLegalName?: string
  billingCommercialName?: string
  billingRuc?: string
  billingEstablishmentCode?: string
  billingEmissionPointCode?: string
  billingMatrixAddress?: string
  billingSpecialTaxpayerCode?: string
  billingAccountingRequired: boolean
  sriEnvironment: "1" | "2"
  consultationPrice?: number
  roles: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type Role = "SUPER_ADMIN" | "ADMIN" | "DOCTOR" | "NURSE" | "PHARMACIST" | "CASHIER"
