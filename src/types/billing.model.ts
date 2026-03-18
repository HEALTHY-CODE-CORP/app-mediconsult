export type InvoiceStatus = "DRAFT" | "PENDING" | "AUTHORIZED" | "CANCELLED" | "REJECTED"
export type InvoiceType = "PHARMACY_SALE" | "CONSULTATION"
export type TipoIdentificacion = "04" | "05" | "06" | "07"

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
  compradorTipoId: TipoIdentificacion
  compradorIdentificacion: string
  compradorRazonSocial: string
  compradorDireccion?: string
  compradorEmail?: string
  compradorTelefono?: string
  ambiente?: string
  formaPago?: string
}

export interface SriAuthorizationResponse {
  claveAcceso: string
  numeroAutorizacion: string
  fechaAutorizacion: string
  ambiente: string
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

  numeroFactura: string
  claveAcceso?: string
  ambiente: string
  compradorTipoId: TipoIdentificacion
  compradorIdentificacion: string
  compradorRazonSocial: string
  compradorDireccion?: string
  compradorEmail?: string
  subtotal: number
  totalIva0: number
  totalIva12: number
  totalIva15: number
  totalIva: number
  totalDescuento: number
  totalSinImpuestos: number
  importeTotal: number
  status: InvoiceStatus
  sriNumeroAutorizacion?: string
  sriFechaAutorizacion?: string
  createdAt: string
  updatedAt: string
}

export interface SriInvoiceRequest {
  infoTributaria: Record<string, unknown>
  infoFactura: Record<string, unknown>
  detalles: Record<string, unknown>[]
}
