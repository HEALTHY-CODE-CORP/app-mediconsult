export type CustomerType = "CUSTOMER" | "PATIENT"

export interface CustomerSearchResultResponse {
  id: string
  type: CustomerType
  customerId?: string
  patientId?: string
  idNumber?: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string
  email?: string
}

export interface CustomerResponse {
  id: string
  organizationId: string
  patientId?: string
  idType?: string
  idNumber?: string
  firstName: string
  lastName: string
  fullName: string
  phone?: string
  email?: string
  address?: string
  notes?: string
  isPatient: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCustomerRequest {
  firstName: string
  lastName: string
  idType?: string
  idNumber?: string
  phone?: string
  email?: string
  address?: string
  notes?: string
}
