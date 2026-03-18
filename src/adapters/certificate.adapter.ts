import type { CertificateResponse, OwnerType } from "@/types/certificate.model"

// ─── Domain Type ────────────────────────────────────────────────────

export interface Certificate {
  id: string
  organizationId: string
  ownerType: OwnerType
  ownerTypeLabel: string
  ownerId: string
  alias: string
  subjectCn: string | null
  issuerCn: string | null
  serialNumber: string | null
  validFrom: string | null
  validUntil: string | null
  fileName: string
  fileSize: number
  fileSizeFormatted: string
  isActive: boolean
  isExpired: boolean
  statusLabel: string
  createdAt: string
  updatedAt: string
}

// ─── Helpers ────────────────────────────────────────────────────────

const OWNER_TYPE_LABELS: Record<OwnerType, string> = {
  USER: "Doctor",
  PHARMACY: "Farmacia",
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getStatusLabel(isActive: boolean, isExpired: boolean): string {
  if (isExpired) return "Expirado"
  if (!isActive) return "Inactivo"
  return "Activo"
}

// ─── Transformers ───────────────────────────────────────────────────

export function toCertificate(r: CertificateResponse): Certificate {
  return {
    id: r.id,
    organizationId: r.organizationId,
    ownerType: r.ownerType,
    ownerTypeLabel: OWNER_TYPE_LABELS[r.ownerType] ?? r.ownerType,
    ownerId: r.ownerId,
    alias: r.alias,
    subjectCn: r.subjectCn ?? null,
    issuerCn: r.issuerCn ?? null,
    serialNumber: r.serialNumber ?? null,
    validFrom: r.validFrom ?? null,
    validUntil: r.validUntil ?? null,
    fileName: r.fileName,
    fileSize: r.fileSize,
    fileSizeFormatted: formatFileSize(r.fileSize),
    isActive: r.isActive,
    isExpired: r.isExpired,
    statusLabel: getStatusLabel(r.isActive, r.isExpired),
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

export function toCertificateList(rs: CertificateResponse[]): Certificate[] {
  return rs.map(toCertificate)
}
