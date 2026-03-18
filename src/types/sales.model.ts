export type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "MIXED"
export type SaleStatus = "COMPLETED" | "CANCELLED" | "REFUNDED"
export type CashSessionStatus = "OPEN" | "CLOSED"

export interface OpenCashSessionRequest {
  pharmacyId: string
  openingAmount: number
  notes?: string
}

export interface CloseCashSessionRequest {
  closingAmount: number
  notes?: string
}

export interface CashRegisterSessionResponse {
  id: string
  pharmacyId: string
  pharmacyName: string
  userId: string
  userName: string
  status: CashSessionStatus
  openingAmount: number
  closingAmount?: number
  expectedAmount?: number
  difference?: number
  notes?: string
  openedAt: string
  closedAt?: string
  createdAt: string
}

export interface CashSessionSummaryResponse {
  sessionId: string
  pharmacyName: string
  userName: string
  status: CashSessionStatus
  openingAmount: number
  totalSales: number
  cashSales: number
  cardSales: number
  transferSales: number
  salesCount: number
  expectedCash: number
  closingAmount?: number
  difference?: number
  openedAt: string
  closedAt?: string
}

export interface CreateSaleItemRequest {
  productId: string
  quantity: number
  discountPercent?: number
  lotId?: string
}

export interface CreateSaleRequest {
  pharmacyId: string
  cashSessionId?: string
  prescriptionId?: string
  patientId?: string
  paymentMethod: PaymentMethod
  paymentReference?: string
  taxAmount?: number
  discountAmount?: number
  notes?: string
  items: CreateSaleItemRequest[]
}

export interface PatientPurchaseSummaryResponse {
  patientId: string
  patientName: string
  patientIdNumber: string
  totalPurchases: number
  totalSpent: number
  lastPurchaseAt?: string
}

export interface SaleItemResponse {
  id: string
  productId: string
  productName: string
  productBarcode?: string
  lotId?: string
  lotNumber?: string
  quantity: number
  unitPrice: number
  discountPercent: number
  subtotal: number
}

export interface SaleResponse {
  id: string
  pharmacyId: string
  pharmacyName: string
  cashSessionId?: string
  prescriptionId?: string
  prescriptionNumber?: string
  patientId?: string
  patientName?: string
  sellerId: string
  sellerName: string
  saleNumber: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
  paymentMethod: PaymentMethod
  paymentReference?: string
  status: SaleStatus
  notes?: string
  items: SaleItemResponse[]
  createdAt: string
  updatedAt: string
}
