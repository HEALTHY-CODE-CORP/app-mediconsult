import type {
  OrganizationResponse,
  ClinicResponse,
  PharmacyResponse,
  ClinicPharmacyResponse,
  ClinicStaffResponse,
} from "@/types/organization.model"
import { toPlan, type Plan } from "@/adapters/plan.adapter"
import { toUser, type User } from "@/adapters/user.adapter"

// ─── Domain Types ────────────────────────────────────────────────────

export interface Organization {
  id: string
  name: string
  ruc: string
  address: string | null
  phone: string | null
  email: string | null
  logoUrl: string | null
  plan: Plan | null
  planName: string
  planStartedAt: string | null
  planExpiresAt: string | null
  billingCycle: string
  billingCycleLabel: string
  consultationFeeOverride: number | null
  effectiveConsultationFee: number
  effectiveConsultationFeeFormatted: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Clinic {
  id: string
  organizationId: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  billingLegalName: string | null
  billingCommercialName: string | null
  billingRuc: string | null
  billingEstablishmentCode: string | null
  billingEmissionPointCode: string | null
  billingMatrixAddress: string | null
  billingSpecialTaxpayerCode: string | null
  billingAccountingRequired: boolean
  sriEnvironment: "1" | "2"
  sriEnvironmentLabel: string
  consultationPrice: number
  consultationPriceFormatted: string
  hasLogo: boolean
  logoUploadedAt: string | null
  logoUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Pharmacy {
  id: string
  organizationId: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  billingLegalName: string | null
  billingCommercialName: string | null
  billingRuc: string | null
  billingEstablishmentCode: string | null
  billingEmissionPointCode: string | null
  billingMatrixAddress: string | null
  billingSpecialTaxpayerCode: string | null
  billingAccountingRequired: boolean
  sriEnvironment: "1" | "2"
  sriEnvironmentLabel: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ClinicPharmacy {
  id: string
  clinicId: string
  pharmacy: Pharmacy
  isPrimary: boolean
  canPrescribe: boolean
  isActive: boolean
  linkedAt: string
}

// ─── Label Maps ─────────────────────────────────────────────────────

export const BILLING_CYCLE_LABELS: Record<string, string> = {
  MONTHLY: "Mensual",
  ANNUAL: "Anual",
}

export const SRI_ENVIRONMENT_LABELS: Record<"1" | "2", string> = {
  "1": "Pruebas",
  "2": "Producción",
}

// ─── Transform Functions ─────────────────────────────────────────────

export function toOrganization(r: OrganizationResponse): Organization {
  return {
    id: r.id,
    name: r.name,
    ruc: r.ruc,
    address: r.address ?? null,
    phone: r.phone ?? null,
    email: r.email ?? null,
    logoUrl: r.logoUrl ?? null,
    plan: r.plan ? toPlan(r.plan) : null,
    planName: r.plan?.name ?? "Sin plan",
    planStartedAt: r.planStartedAt ?? null,
    planExpiresAt: r.planExpiresAt ?? null,
    billingCycle: r.billingCycle,
    billingCycleLabel: BILLING_CYCLE_LABELS[r.billingCycle] ?? r.billingCycle,
    consultationFeeOverride: r.consultationFeeOverride ?? null,
    effectiveConsultationFee: r.effectiveConsultationFee,
    effectiveConsultationFeeFormatted: `$${r.effectiveConsultationFee.toFixed(2)}`,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

export function toOrganizationList(rs: OrganizationResponse[]): Organization[] {
  return rs.map(toOrganization)
}

export function toClinic(r: ClinicResponse): Clinic {
  const sriEnvironment = (r.sriEnvironment === "2" ? "2" : "1") as "1" | "2"
  return {
    id: r.id,
    organizationId: r.organizationId,
    name: r.name,
    address: r.address ?? null,
    phone: r.phone ?? null,
    email: r.email ?? null,
    billingLegalName: r.billingLegalName ?? null,
    billingCommercialName: r.billingCommercialName ?? null,
    billingRuc: r.billingRuc ?? null,
    billingEstablishmentCode: r.billingEstablishmentCode ?? null,
    billingEmissionPointCode: r.billingEmissionPointCode ?? null,
    billingMatrixAddress: r.billingMatrixAddress ?? null,
    billingSpecialTaxpayerCode: r.billingSpecialTaxpayerCode ?? null,
    billingAccountingRequired: r.billingAccountingRequired ?? false,
    sriEnvironment,
    sriEnvironmentLabel: SRI_ENVIRONMENT_LABELS[sriEnvironment],
    consultationPrice: r.consultationPrice,
    consultationPriceFormatted: `$${r.consultationPrice.toFixed(2)}`,
    hasLogo: r.hasLogo ?? false,
    logoUploadedAt: r.logoUploadedAt ?? null,
    logoUrl: r.hasLogo ? `/api/bff/v1/clinics/${r.id}/logo` : null,
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

export function toClinicList(rs: ClinicResponse[]): Clinic[] {
  return rs.map(toClinic)
}

export function toPharmacy(r: PharmacyResponse): Pharmacy {
  const sriEnvironment = (r.sriEnvironment === "2" ? "2" : "1") as "1" | "2"
  return {
    id: r.id,
    organizationId: r.organizationId,
    name: r.name,
    address: r.address ?? null,
    phone: r.phone ?? null,
    email: r.email ?? null,
    billingLegalName: r.billingLegalName ?? null,
    billingCommercialName: r.billingCommercialName ?? null,
    billingRuc: r.billingRuc ?? null,
    billingEstablishmentCode: r.billingEstablishmentCode ?? null,
    billingEmissionPointCode: r.billingEmissionPointCode ?? null,
    billingMatrixAddress: r.billingMatrixAddress ?? null,
    billingSpecialTaxpayerCode: r.billingSpecialTaxpayerCode ?? null,
    billingAccountingRequired: r.billingAccountingRequired ?? false,
    sriEnvironment,
    sriEnvironmentLabel: SRI_ENVIRONMENT_LABELS[sriEnvironment],
    isActive: r.isActive,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

export function toPharmacyList(rs: PharmacyResponse[]): Pharmacy[] {
  return rs.map(toPharmacy)
}

export function toClinicPharmacy(r: ClinicPharmacyResponse): ClinicPharmacy {
  return {
    id: r.id,
    clinicId: r.clinicId,
    pharmacy: toPharmacy(r.pharmacy),
    isPrimary: r.isPrimary,
    canPrescribe: r.canPrescribe,
    isActive: r.isActive,
    linkedAt: r.linkedAt,
  }
}

export function toClinicPharmacyList(rs: ClinicPharmacyResponse[]): ClinicPharmacy[] {
  return rs.map(toClinicPharmacy)
}

// ─── Clinic Staff ───────────────────────────────────────────────────

export interface ClinicStaff {
  id: string
  clinicId: string
  user: User
  consultationPrice: number | null
  consultationPercentage: number | null
  effectiveConsultationPrice: number
  effectiveConsultationPriceFormatted: string
  isPrimary: boolean
  isActive: boolean
  assignedAt: string
}

export function toClinicStaff(r: ClinicStaffResponse): ClinicStaff {
  return {
    id: r.id,
    clinicId: r.clinicId,
    user: toUser(r.user),
    consultationPrice: r.consultationPrice,
    consultationPercentage: r.consultationPercentage,
    effectiveConsultationPrice: r.effectiveConsultationPrice,
    effectiveConsultationPriceFormatted: `$${r.effectiveConsultationPrice.toFixed(2)}`,
    isPrimary: r.isPrimary,
    isActive: r.isActive,
    assignedAt: r.assignedAt,
  }
}

export function toClinicStaffList(rs: ClinicStaffResponse[]): ClinicStaff[] {
  return rs.map(toClinicStaff)
}
