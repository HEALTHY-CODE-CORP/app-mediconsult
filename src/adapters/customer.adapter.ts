import type {
  CustomerSearchResultResponse,
  CustomerResponse,
  CustomerType,
} from "@/types/customer.model"

// ─── Domain types ────────────────────────────────────────────────────

export interface CustomerSearchResult {
  id: string
  type: CustomerType
  customerId: string | null
  patientId: string | null
  idNumber: string | null
  firstName: string
  lastName: string
  fullName: string
  phone: string | null
  email: string | null
}

export interface Customer {
  id: string
  organizationId: string
  patientId: string | null
  idType: string | null
  idNumber: string | null
  firstName: string
  lastName: string
  fullName: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  isPatient: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Transform functions ────────────────────────────────────────────

export function toCustomerSearchResult(raw: CustomerSearchResultResponse): CustomerSearchResult {
  return {
    id: raw.id,
    type: raw.type,
    customerId: raw.customerId ?? null,
    patientId: raw.patientId ?? null,
    idNumber: raw.idNumber ?? null,
    firstName: raw.firstName,
    lastName: raw.lastName,
    fullName: raw.fullName,
    phone: raw.phone ?? null,
    email: raw.email ?? null,
  }
}

export function toCustomerSearchResultList(raw: CustomerSearchResultResponse[]): CustomerSearchResult[] {
  return raw.map(toCustomerSearchResult)
}

export function toCustomer(raw: CustomerResponse): Customer {
  return {
    id: raw.id,
    organizationId: raw.organizationId,
    patientId: raw.patientId ?? null,
    idType: raw.idType ?? null,
    idNumber: raw.idNumber ?? null,
    firstName: raw.firstName,
    lastName: raw.lastName,
    fullName: raw.fullName,
    phone: raw.phone ?? null,
    email: raw.email ?? null,
    address: raw.address ?? null,
    notes: raw.notes ?? null,
    isPatient: raw.isPatient,
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export function toCustomerList(raw: CustomerResponse[]): Customer[] {
  return raw.map(toCustomer)
}
