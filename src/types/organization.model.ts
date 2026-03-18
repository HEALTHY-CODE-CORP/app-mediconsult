import type { PlanResponse } from "@/types/plan.model"

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
  consultationPrice?: number
}

export interface PharmacyResponse {
  id: string
  organizationId: string
  name: string
  address?: string
  phone?: string
  email?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePharmacyRequest {
  name: string
  address?: string
  phone?: string
  email?: string
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
