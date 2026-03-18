export type PrescriptionStatus = "PENDING" | "PARTIALLY_DISPENSED" | "DISPENSED" | "CANCELLED"

export interface CreatePrescriptionRequest {
  consultationId: string
  pharmacyId?: string
  notes?: string
  items: {
    productId: string
    quantity: number
    dosage: string
    frequency: string
    duration: string
    instructions?: string
  }[]
}

export interface PrescriptionResponse {
  id: string
  consultationId: string
  pharmacyId?: string
  pharmacyName?: string
  doctorId: string
  doctorName: string
  patientId: string
  patientName: string
  patientIdNumber: string
  prescriptionNumber: string
  status: PrescriptionStatus
  dispensedExternally: boolean
  notes?: string
  prescribedAt: string
  dispensedAt?: string
  dispensedByName?: string
  items: PrescriptionItemResponse[]
  createdAt: string
  updatedAt: string
}

export interface PrescriptionItemResponse {
  id: string
  productId: string
  productName: string
  productBarcode?: string
  quantity: number
  dosage: string
  frequency: string
  duration: string
  instructions?: string
  dispensedQuantity: number
  remainingQuantity: number
  isPending: boolean
}

export interface StockAvailabilityResponse {
  productId: string
  productName: string
  requiredQuantity: number
  availableStock: number
  isAvailable: boolean
}
