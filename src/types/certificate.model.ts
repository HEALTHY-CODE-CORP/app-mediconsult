// ─── Certificate API Types ──────────────────────────────────────────

export type OwnerType = "USER" | "PHARMACY"

export interface CertificateResponse {
  id: string
  organizationId: string
  ownerType: OwnerType
  ownerId: string
  alias: string
  subjectCn: string | null
  issuerCn: string | null
  serialNumber: string | null
  validFrom: string | null
  validUntil: string | null
  fileName: string
  fileSize: number
  isActive: boolean
  isExpired: boolean
  createdAt: string
  updatedAt: string
}
