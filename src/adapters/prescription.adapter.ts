import type {
  PrescriptionResponse,
  PrescriptionItemResponse,
  StockAvailabilityResponse,
  PrescriptionStatus,
} from "@/types/prescription.model"
import { formatDateTimeEc } from "@/lib/date"

// ─── Label maps ──────────────────────────────────────────────────────

export const PRESCRIPTION_STATUS_LABELS: Record<PrescriptionStatus, string> = {
  PENDING: "Pendiente",
  PARTIALLY_DISPENSED: "Parcialmente dispensada",
  DISPENSED: "Dispensada",
  CANCELLED: "Cancelada",
}

export const PRESCRIPTION_STATUS_COLORS: Record<PrescriptionStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PARTIALLY_DISPENSED: "bg-blue-100 text-blue-800",
  DISPENSED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

// ─── Domain types ────────────────────────────────────────────────────

export interface PrescriptionItem {
  id: string
  productId: string
  productName: string
  productBarcode: string | null
  quantity: number
  dosage: string
  frequency: string
  duration: string
  instructions: string | null
  dispensedQuantity: number
  remainingQuantity: number
  isPending: boolean
  /** e.g. "1 tab, cada 8h, por 7 días" */
  dosageSummary: string
}

export interface Prescription {
  id: string
  consultationId: string
  pharmacyId: string | null
  pharmacyName: string | null
  doctorId: string
  doctorName: string
  patientId: string
  patientName: string
  patientIdNumber: string
  prescriptionNumber: string
  status: PrescriptionStatus
  statusLabel: string
  statusColor: string
  dispensedExternally: boolean
  notes: string | null
  prescribedAt: string
  prescribedAtFormatted: string
  dispensedAt: string | null
  dispensedAtFormatted: string | null
  dispensedByName: string | null
  signedAt: string | null
  signedAtFormatted: string | null
  signedById: string | null
  signedByName: string | null
  signedCertificateId: string | null
  signedCertificateAlias: string | null
  signaturePage: number | null
  signatureRect: string | null
  items: PrescriptionItem[]
  totalItems: number
  pendingItems: number
  createdAt: string
  updatedAt: string
}

export interface StockAvailability {
  productId: string
  productName: string
  requiredQuantity: number
  availableStock: number
  isAvailable: boolean
}

// ─── Helpers ─────────────────────────────────────────────────────────

function formatDateTime(dateStr?: string | null): string | null {
  return dateStr ? formatDateTimeEc(dateStr, dateStr) : null
}

// ─── Transform functions ─────────────────────────────────────────────

function toPrescriptionItem(raw: PrescriptionItemResponse): PrescriptionItem {
  return {
    id: raw.id,
    productId: raw.productId,
    productName: raw.productName,
    productBarcode: raw.productBarcode ?? null,
    quantity: raw.quantity,
    dosage: raw.dosage,
    frequency: raw.frequency,
    duration: raw.duration,
    instructions: raw.instructions ?? null,
    dispensedQuantity: raw.dispensedQuantity,
    remainingQuantity: raw.remainingQuantity,
    isPending: raw.isPending,
    dosageSummary: `${raw.dosage}, ${raw.frequency}, ${raw.duration}`,
  }
}

export function toPrescription(raw: PrescriptionResponse): Prescription {
  const items = raw.items.map(toPrescriptionItem)
  return {
    id: raw.id,
    consultationId: raw.consultationId,
    pharmacyId: raw.pharmacyId ?? null,
    pharmacyName: raw.pharmacyName ?? null,
    doctorId: raw.doctorId,
    doctorName: raw.doctorName,
    patientId: raw.patientId,
    patientName: raw.patientName,
    patientIdNumber: raw.patientIdNumber,
    prescriptionNumber: raw.prescriptionNumber,
    status: raw.status,
    statusLabel: PRESCRIPTION_STATUS_LABELS[raw.status] ?? raw.status,
    statusColor: PRESCRIPTION_STATUS_COLORS[raw.status] ?? "",
    dispensedExternally: raw.dispensedExternally ?? false,
    notes: raw.notes ?? null,
    prescribedAt: raw.prescribedAt,
    prescribedAtFormatted: formatDateTime(raw.prescribedAt) ?? "—",
    dispensedAt: raw.dispensedAt ?? null,
    dispensedAtFormatted: formatDateTime(raw.dispensedAt),
    dispensedByName: raw.dispensedByName ?? null,
    signedAt: raw.signedAt ?? null,
    signedAtFormatted: formatDateTime(raw.signedAt),
    signedById: raw.signedById ?? null,
    signedByName: raw.signedByName ?? null,
    signedCertificateId: raw.signedCertificateId ?? null,
    signedCertificateAlias: raw.signedCertificateAlias ?? null,
    signaturePage: raw.signaturePage ?? null,
    signatureRect: raw.signatureRect ?? null,
    items,
    totalItems: items.length,
    pendingItems: items.filter((i) => i.isPending).length,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export function toPrescriptionList(raw: PrescriptionResponse[]): Prescription[] {
  return raw.map(toPrescription)
}

export function toStockAvailability(raw: StockAvailabilityResponse): StockAvailability {
  return {
    productId: raw.productId,
    productName: raw.productName,
    requiredQuantity: raw.requiredQuantity,
    availableStock: raw.availableStock,
    isAvailable: raw.isAvailable,
  }
}

export function toStockAvailabilityList(raw: StockAvailabilityResponse[]): StockAvailability[] {
  return raw.map(toStockAvailability)
}
