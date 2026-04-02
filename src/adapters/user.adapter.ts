import type { UserResponse, Role } from "@/types/auth.model"

// ─── Label maps ──────────────────────────────────────────────────────

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN: "Administrador",
  DOCTOR: "Doctor",
  NURSE: "Enfermero/a",
  PHARMACIST: "Farmacéutico/a",
  CASHIER: "Cajero/a",
}

// ─── Domain type ─────────────────────────────────────────────────────

export interface User {
  id: string
  organizationId: string | null
  email: string
  firstName: string
  lastName: string
  fullName: string
  phone: string | null
  billingLegalName: string | null
  billingCommercialName: string | null
  billingRuc: string | null
  billingEstablishmentCode: string | null
  billingEmissionPointCode: string | null
  billingMatrixAddress: string | null
  billingSpecialTaxpayerCode: string | null
  billingAccountingRequired: boolean
  roles: Role[]
  roleLabels: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdAtFormatted: string
}

// ─── Transformers ────────────────────────────────────────────────────

export function toUser(raw: UserResponse): User {
  const roles = raw.roles as Role[]
  return {
    id: raw.id,
    organizationId: raw.organizationId,
    email: raw.email,
    firstName: raw.firstName,
    lastName: raw.lastName,
    fullName: raw.fullName,
    phone: raw.phone ?? null,
    billingLegalName: raw.billingLegalName ?? null,
    billingCommercialName: raw.billingCommercialName ?? null,
    billingRuc: raw.billingRuc ?? null,
    billingEstablishmentCode: raw.billingEstablishmentCode ?? null,
    billingEmissionPointCode: raw.billingEmissionPointCode ?? null,
    billingMatrixAddress: raw.billingMatrixAddress ?? null,
    billingSpecialTaxpayerCode: raw.billingSpecialTaxpayerCode ?? null,
    billingAccountingRequired: raw.billingAccountingRequired ?? false,
    roles,
    roleLabels: roles.map((r) => ROLE_LABELS[r] ?? r),
    isActive: raw.isActive,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    createdAtFormatted: new Date(raw.createdAt).toLocaleDateString("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  }
}

export function toUserList(raw: UserResponse[]): User[] {
  return raw.map(toUser)
}
