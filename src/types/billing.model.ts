export type InvoiceStatus = "DRAFT" | "PENDING" | "AUTHORIZED" | "CANCELLED" | "REJECTED"
export type InvoiceType = "PHARMACY_SALE" | "CONSULTATION"
export type TipoIdentificacion = "04" | "05" | "06" | "07"
export type ConsultationIssuerType = "CLINIC" | "DOCTOR"
type NumericLike = number | string | null | undefined

export interface CreateInvoiceRequest {
  saleId: string
  compradorTipoId: TipoIdentificacion
  compradorIdentificacion: string
  compradorRazonSocial: string
  compradorDireccion?: string
  compradorEmail?: string
  compradorTelefono?: string
}

export interface CreateConsultationInvoiceRequest {
  consultationId: string
  issuerType?: ConsultationIssuerType
  compradorTipoId: TipoIdentificacion
  compradorIdentificacion: string
  compradorRazonSocial: string
  compradorDireccion?: string
  compradorEmail?: string
  compradorTelefono?: string
  consultationPrice?: number
  ambiente?: string
  formaPago?: string
}

export interface SriAuthorizationResponse {
  claveAcceso: string
  numeroAutorizacion: string
  fechaAutorizacion: string
  ambiente: string
}

export interface SendInvoiceEmailRequest {
  recipientEmail?: string
}

export interface SendInvoiceEmailResponse {
  invoiceId: string
  recipientEmail: string
  sentAt: string
}

export interface InvoiceResponse {
  id: string
  invoiceType: InvoiceType

  // Pharmacy sale fields
  saleId?: string
  pharmacyId?: string
  pharmacyName?: string

  // Consultation fields
  consultationId?: string
  clinicId?: string
  clinicName?: string
  doctorId?: string
  doctorName?: string
  consultationIssuerType?: ConsultationIssuerType

  numeroFactura: string
  claveAcceso?: string
  ambiente: string
  compradorTipoId: TipoIdentificacion
  compradorIdentificacion: string
  compradorRazonSocial: string
  compradorDireccion?: string
  compradorEmail?: string
  defaultRecipientEmail?: string
  subtotal?: NumericLike
  totalIva0?: NumericLike
  totalIva12?: NumericLike
  totalIva15?: NumericLike
  totalIva?: NumericLike
  valorIva?: NumericLike
  totalDescuento?: NumericLike
  totalSinImpuestos?: NumericLike
  importeTotal?: NumericLike
  status: InvoiceStatus
  sriStatus?: string
  sriErrors?: string
  sriNumeroAutorizacion?: string
  sriFechaAutorizacion?: string
  emailedAt?: string
  emailedTo?: string
  hasAuthorizedXml?: boolean
  hasAuthorizedPdf?: boolean
  createdAt: string
  updatedAt: string
}

export interface SriInvoiceRequest {
  infoTributaria: Record<string, unknown>
  infoFactura: Record<string, unknown>
  detalles: Record<string, unknown>[]
}

// ─── SRI Submit / Authorize Results ────────────────────────────────

export interface SriError {
  codigo?: string
  mensaje?: string
  informacionAdicional?: string
  tipo?: string
}

export interface SriSubmitResult {
  invoiceId: string
  estado: string       // "RECIBIDA", "DEVUELTA", "ERROR"
  accessKey?: string
  isReceived: boolean
  errors: SriError[]
  invoice: InvoiceResponse
}

export interface SriAuthorizeResult {
  invoiceId: string
  estado: string       // "AUTORIZADO", "NO AUTORIZADO", "DESCONOCIDO"
  accessKey?: string
  numeroAutorizacion?: string
  fechaAutorizacion?: string
  isAuthorized: boolean
  errors: SriError[]
  invoice: InvoiceResponse
}
