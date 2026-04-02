import type {
  ConsultationIssuerType,
  InvoiceResponse,
  InvoiceStatus,
  InvoiceType,
  TipoIdentificacion,
} from "@/types/billing.model"

// ─── Label maps ──────────────────────────────────────────────────────

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Borrador",
  PENDING: "Pendiente",
  AUTHORIZED: "Autorizada",
  REJECTED: "Rechazada",
  CANCELLED: "Anulada",
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-800",
  PENDING: "bg-yellow-100 text-yellow-800",
  AUTHORIZED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  PHARMACY_SALE: "Venta Farmacia",
  CONSULTATION: "Consulta Médica",
}

export const INVOICE_TYPE_COLORS: Record<InvoiceType, string> = {
  PHARMACY_SALE: "bg-blue-100 text-blue-800",
  CONSULTATION: "bg-purple-100 text-purple-800",
}

export const CONSULTATION_ISSUER_LABELS: Record<ConsultationIssuerType, string> = {
  CLINIC: "Consultorio",
  DOCTOR: "Médico",
}

export const TIPO_ID_LABELS: Record<TipoIdentificacion, string> = {
  "04": "RUC",
  "05": "Cédula",
  "06": "Pasaporte",
  "07": "Consumidor Final",
}

// ─── Domain types ────────────────────────────────────────────────────

export interface Invoice {
  id: string
  invoiceType: InvoiceType
  invoiceTypeLabel: string
  invoiceTypeColor: string

  // Pharmacy
  saleId: string | null
  pharmacyId: string | null
  pharmacyName: string | null

  // Consultation
  consultationId: string | null
  clinicId: string | null
  clinicName: string | null
  doctorId: string | null
  doctorName: string | null
  consultationIssuerType: ConsultationIssuerType | null
  consultationIssuerTypeLabel: string | null

  // Establishment name (pharmacy or clinic)
  establishmentName: string

  numeroFactura: string
  claveAcceso: string | null
  ambiente: string
  ambienteLabel: string
  compradorTipoId: TipoIdentificacion
  compradorTipoIdLabel: string
  compradorIdentificacion: string
  compradorRazonSocial: string
  compradorDireccion: string | null
  compradorEmail: string | null
  totalSinImpuestos: number
  totalSinImpuestosFormatted: string
  totalDescuento: number
  totalDescuentoFormatted: string
  totalIva0: number
  totalIva0Formatted: string
  totalIva12: number
  totalIva12Formatted: string
  totalIva15: number
  totalIva15Formatted: string
  totalIva: number
  totalIvaFormatted: string
  importeTotal: number
  importeTotalFormatted: string
  status: InvoiceStatus
  statusLabel: string
  statusColor: string
  sriNumeroAutorizacion: string | null
  sriFechaAutorizacion: string | null
  sriFechaAutorizacionFormatted: string | null
  createdAt: string
  createdAtFormatted: string
  updatedAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────

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

// ─── Transform functions ─────────────────────────────────────────────

export function toInvoice(raw: InvoiceResponse): Invoice {
  const invoiceType = raw.invoiceType ?? "PHARMACY_SALE"

  return {
    id: raw.id,
    invoiceType,
    invoiceTypeLabel: INVOICE_TYPE_LABELS[invoiceType] ?? invoiceType,
    invoiceTypeColor: INVOICE_TYPE_COLORS[invoiceType] ?? "",

    saleId: raw.saleId ?? null,
    pharmacyId: raw.pharmacyId ?? null,
    pharmacyName: raw.pharmacyName ?? null,

    consultationId: raw.consultationId ?? null,
    clinicId: raw.clinicId ?? null,
    clinicName: raw.clinicName ?? null,
    doctorId: raw.doctorId ?? null,
    doctorName: raw.doctorName ?? null,
    consultationIssuerType: raw.consultationIssuerType ?? null,
    consultationIssuerTypeLabel: raw.consultationIssuerType
      ? CONSULTATION_ISSUER_LABELS[raw.consultationIssuerType] ?? raw.consultationIssuerType
      : null,

    establishmentName:
      invoiceType === "CONSULTATION"
        ? raw.consultationIssuerType === "DOCTOR"
          ? raw.doctorName ?? "Médico"
          : raw.clinicName ?? "Clínica"
        : raw.pharmacyName ?? "Farmacia",

    numeroFactura: raw.numeroFactura,
    claveAcceso: raw.claveAcceso ?? null,
    ambiente: raw.ambiente,
    ambienteLabel: raw.ambiente === "1" ? "Pruebas" : "Producción",
    compradorTipoId: raw.compradorTipoId,
    compradorTipoIdLabel: TIPO_ID_LABELS[raw.compradorTipoId] ?? raw.compradorTipoId,
    compradorIdentificacion: raw.compradorIdentificacion,
    compradorRazonSocial: raw.compradorRazonSocial,
    compradorDireccion: raw.compradorDireccion ?? null,
    compradorEmail: raw.compradorEmail ?? null,
    totalSinImpuestos: raw.totalSinImpuestos,
    totalSinImpuestosFormatted: fmt(raw.totalSinImpuestos),
    totalDescuento: raw.totalDescuento,
    totalDescuentoFormatted: fmt(raw.totalDescuento),
    totalIva0: raw.totalIva0,
    totalIva0Formatted: fmt(raw.totalIva0),
    totalIva12: raw.totalIva12,
    totalIva12Formatted: fmt(raw.totalIva12),
    totalIva15: raw.totalIva15,
    totalIva15Formatted: fmt(raw.totalIva15),
    totalIva: raw.totalIva,
    totalIvaFormatted: fmt(raw.totalIva),
    importeTotal: raw.importeTotal,
    importeTotalFormatted: fmt(raw.importeTotal),
    status: raw.status,
    statusLabel: INVOICE_STATUS_LABELS[raw.status] ?? raw.status,
    statusColor: INVOICE_STATUS_COLORS[raw.status] ?? "",
    sriNumeroAutorizacion: raw.sriNumeroAutorizacion ?? null,
    sriFechaAutorizacion: raw.sriFechaAutorizacion ?? null,
    sriFechaAutorizacionFormatted: formatDateTime(raw.sriFechaAutorizacion),
    createdAt: raw.createdAt,
    createdAtFormatted: formatDateTime(raw.createdAt) ?? "—",
    updatedAt: raw.updatedAt,
  }
}

export function toInvoiceList(raw: InvoiceResponse[]): Invoice[] {
  return raw.map(toInvoice)
}
