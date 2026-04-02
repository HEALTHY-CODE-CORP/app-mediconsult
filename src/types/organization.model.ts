import type { PlanResponse } from "@/types/plan.model"
import type { UserResponse } from "@/types/auth.model"

export interface CreateOrganizationRequest {
  name: string
  ruc: string
  address?: string
  phone?: string
  email?: string
  logoUrl?: string
  planId?: string
}

export interface UpdateOrganizationRequest {
  name?: string
  address?: string
  phone?: string
  email?: string
  logoUrl?: string
  planId?: string
  billingCycle?: string
}

export interface OrganizationResponse {
  id: string
  name: string
  ruc: string
  address?: string
  phone?: string
  email?: string
  logoUrl?: string
  plan: PlanResponse | null
  planStartedAt: string | null
  planExpiresAt: string | null
  billingCycle: string
  consultationFeeOverride?: number
  effectiveConsultationFee: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ClinicResponse {
  id: string
  organizationId: string
  name: string
  address?: string
  phone?: string
  email?: string
  billingLegalName?: string
  billingCommercialName?: string
  billingRuc?: string
  billingEstablishmentCode?: string
  billingEmissionPointCode?: string
  billingMatrixAddress?: string
  billingSpecialTaxpayerCode?: string
  billingAccountingRequired: boolean
  consultationPrice: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateClinicRequest {
  name: string
  address?: string
  phone?: string
  email?: string
  billingLegalName?: string
  billingCommercialName?: string
  billingRuc?: string
  billingEstablishmentCode?: string
  billingEmissionPointCode?: string
  billingMatrixAddress?: string
  billingSpecialTaxpayerCode?: string
  billingAccountingRequired?: boolean
  consultationPrice?: number
}

export interface PharmacyResponse {
  id: string
  organizationId: string
  name: string
  address?: string
  phone?: string
  email?: string
  billingLegalName?: string
  billingCommercialName?: string
  billingRuc?: string
  billingEstablishmentCode?: string
  billingEmissionPointCode?: string
  billingMatrixAddress?: string
  billingSpecialTaxpayerCode?: string
  billingAccountingRequired: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePharmacyRequest {
  name: string
  address?: string
  phone?: string
  email?: string
  billingLegalName?: string
  billingCommercialName?: string
  billingRuc?: string
  billingEstablishmentCode?: string
  billingEmissionPointCode?: string
  billingMatrixAddress?: string
  billingSpecialTaxpayerCode?: string
  billingAccountingRequired?: boolean
}

export interface ClinicPharmacyResponse {
  id: string
  clinicId: string
  pharmacy: PharmacyResponse
  isPrimary: boolean
  canPrescribe: boolean
  isActive: boolean
  linkedAt: string
}

export interface ClinicStaffResponse {
  id: string
  clinicId: string
  user: UserResponse
  consultationPrice: number | null
  consultationPercentage: number | null
  effectiveConsultationPrice: number
  isPrimary: boolean
  isActive: boolean
  assignedAt: string
}

export interface AssignStaffRequest {
  userId: string
  consultationPrice?: number
  consultationPercentage?: number
  isPrimary?: boolean
}

export interface UpdateStaffRequest {
  consultationPrice?: number
  consultationPercentage?: number
}
