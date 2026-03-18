import type {
  PlatformFeeResponse,
  FeeStatus,
} from "@/types/platform-fee.model"

export const FEE_STATUS_LABELS: Record<FeeStatus, string> = {
  PENDING: "Pendiente",
  COLLECTED: "Cobrada",
  WAIVED: "Exonerada",
}

export const FEE_STATUS_COLORS: Record<FeeStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COLLECTED: "bg-green-100 text-green-800",
  WAIVED: "bg-gray-100 text-gray-800",
}

export interface PlatformFee {
  id: string
  organizationId: string
  organizationName: string
  invoiceId: string
  invoiceNumber: string
  consultationId: string
  planName: string | null
  feeAmount: number
  feeAmountFormatted: string
  feeDescription: string
  status: FeeStatus
  statusLabel: string
  statusColor: string
  collectedAt: string | null
  collectedAtFormatted: string | null
  notes: string | null
  createdAt: string
  createdAtFormatted: string
  updatedAt: string
}

function fmt(value: number): string {
  return `$${value.toFixed(2)}`
}

function formatDateTime(dateStr?: string | null): string | null {
  if (!dateStr) return null
  try {
    return new Intl.DateTimeFormat("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export function toPlatformFee(raw: PlatformFeeResponse): PlatformFee {
  return {
    id: raw.id,
    organizationId: raw.organizationId,
    organizationName: raw.organizationName,
    invoiceId: raw.invoiceId,
    invoiceNumber: raw.invoiceNumber,
    consultationId: raw.consultationId,
    planName: raw.planName ?? null,
    feeAmount: raw.feeAmount,
    feeAmountFormatted: fmt(raw.feeAmount),
    feeDescription: raw.feeDescription,
    status: raw.status,
    statusLabel: FEE_STATUS_LABELS[raw.status] ?? raw.status,
    statusColor: FEE_STATUS_COLORS[raw.status] ?? "",
    collectedAt: raw.collectedAt ?? null,
    collectedAtFormatted: formatDateTime(raw.collectedAt),
    notes: raw.notes ?? null,
    createdAt: raw.createdAt,
    createdAtFormatted: formatDateTime(raw.createdAt) ?? "—",
    updatedAt: raw.updatedAt,
  }
}

export function toPlatformFeeList(raw: PlatformFeeResponse[]): PlatformFee[] {
  return raw.map(toPlatformFee)
}
