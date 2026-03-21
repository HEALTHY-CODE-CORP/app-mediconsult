import type {
  CashRegisterSessionResponse,
  CashSessionSummaryResponse,
  SaleResponse,
  SaleItemResponse,
  PatientPurchaseSummaryResponse,
  PaymentMethod,
  SaleStatus,
  CashSessionStatus,
} from "@/types/sales.model"

// ─── Label maps ──────────────────────────────────────────────────────

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  MIXED: "Mixto",
}

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  REFUNDED: "Reembolsada",
}

export const SALE_STATUS_COLORS: Record<SaleStatus, string> = {
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-yellow-100 text-yellow-800",
}

export const CASH_SESSION_STATUS_LABELS: Record<CashSessionStatus, string> = {
  OPEN: "Abierta",
  CLOSED: "Cerrada",
}

export const CASH_SESSION_STATUS_COLORS: Record<CashSessionStatus, string> = {
  OPEN: "bg-green-100 text-green-800",
  CLOSED: "bg-gray-100 text-gray-800",
}

// ─── Domain types ────────────────────────────────────────────────────

export interface CashSession {
  id: string
  pharmacyId: string
  pharmacyName: string
  userId: string
  userName: string
  status: CashSessionStatus
  statusLabel: string
  statusColor: string
  openingAmount: number
  openingAmountFormatted: string
  closingAmount: number | null
  closingAmountFormatted: string | null
  expectedAmount: number | null
  expectedAmountFormatted: string | null
  difference: number | null
  differenceFormatted: string | null
  notes: string | null
  openedAt: string
  openedAtFormatted: string
  closedAt: string | null
  closedAtFormatted: string | null
  createdAt: string
}

export interface CashSessionSummary {
  sessionId: string
  pharmacyName: string
  userName: string
  status: CashSessionStatus
  statusLabel: string
  openingAmount: number
  openingAmountFormatted: string
  totalSales: number
  totalSalesFormatted: string
  cashSales: number
  cashSalesFormatted: string
  cardSales: number
  cardSalesFormatted: string
  transferSales: number
  transferSalesFormatted: string
  salesCount: number
  expectedCash: number
  expectedCashFormatted: string
  closingAmount: number | null
  closingAmountFormatted: string | null
  difference: number | null
  differenceFormatted: string | null
  openedAt: string
  openedAtFormatted: string
  closedAt: string | null
  closedAtFormatted: string | null
}

export interface SaleItem {
  id: string
  productId: string
  productName: string
  productBarcode: string | null
  lotId: string | null
  lotNumber: string | null
  quantity: number
  unitPrice: number
  unitPriceFormatted: string
  discountPercent: number
  subtotal: number
  subtotalFormatted: string
}

export interface Sale {
  id: string
  pharmacyId: string
  pharmacyName: string
  cashSessionId: string | null
  prescriptionId: string | null
  prescriptionNumber: string | null
  patientId: string | null
  patientName: string | null
  customerId: string | null
  customerName: string | null
  sellerId: string
  sellerName: string
  saleNumber: string
  subtotal: number
  subtotalFormatted: string
  taxAmount: number
  taxAmountFormatted: string
  discountAmount: number
  discountAmountFormatted: string
  total: number
  totalFormatted: string
  paymentMethod: PaymentMethod
  paymentMethodLabel: string
  paymentReference: string | null
  status: SaleStatus
  statusLabel: string
  statusColor: string
  notes: string | null
  items: SaleItem[]
  totalItems: number
  createdAt: string
  createdAtFormatted: string
  updatedAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────

function fmt(value: number | null | undefined): string | null {
  if (value == null) return null
  return `$${value.toFixed(2)}`
}

function fmtRequired(value: number): string {
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

export function toCashSession(raw: CashRegisterSessionResponse): CashSession {
  return {
    id: raw.id,
    pharmacyId: raw.pharmacyId,
    pharmacyName: raw.pharmacyName,
    userId: raw.userId,
    userName: raw.userName,
    status: raw.status,
    statusLabel: CASH_SESSION_STATUS_LABELS[raw.status] ?? raw.status,
    statusColor: CASH_SESSION_STATUS_COLORS[raw.status] ?? "",
    openingAmount: raw.openingAmount,
    openingAmountFormatted: fmtRequired(raw.openingAmount),
    closingAmount: raw.closingAmount ?? null,
    closingAmountFormatted: fmt(raw.closingAmount),
    expectedAmount: raw.expectedAmount ?? null,
    expectedAmountFormatted: fmt(raw.expectedAmount),
    difference: raw.difference ?? null,
    differenceFormatted: fmt(raw.difference),
    notes: raw.notes ?? null,
    openedAt: raw.openedAt,
    openedAtFormatted: formatDateTime(raw.openedAt) ?? "—",
    closedAt: raw.closedAt ?? null,
    closedAtFormatted: formatDateTime(raw.closedAt),
    createdAt: raw.createdAt,
  }
}

export function toCashSessionList(raw: CashRegisterSessionResponse[]): CashSession[] {
  return raw.map(toCashSession)
}

export function toCashSessionSummary(raw: CashSessionSummaryResponse): CashSessionSummary {
  return {
    sessionId: raw.sessionId,
    pharmacyName: raw.pharmacyName,
    userName: raw.userName,
    status: raw.status,
    statusLabel: CASH_SESSION_STATUS_LABELS[raw.status] ?? raw.status,
    openingAmount: raw.openingAmount,
    openingAmountFormatted: fmtRequired(raw.openingAmount),
    totalSales: raw.totalSales,
    totalSalesFormatted: fmtRequired(raw.totalSales),
    cashSales: raw.cashSales,
    cashSalesFormatted: fmtRequired(raw.cashSales),
    cardSales: raw.cardSales,
    cardSalesFormatted: fmtRequired(raw.cardSales),
    transferSales: raw.transferSales,
    transferSalesFormatted: fmtRequired(raw.transferSales),
    salesCount: raw.salesCount,
    expectedCash: raw.expectedCash,
    expectedCashFormatted: fmtRequired(raw.expectedCash),
    closingAmount: raw.closingAmount ?? null,
    closingAmountFormatted: fmt(raw.closingAmount),
    difference: raw.difference ?? null,
    differenceFormatted: fmt(raw.difference),
    openedAt: raw.openedAt,
    openedAtFormatted: formatDateTime(raw.openedAt) ?? "—",
    closedAt: raw.closedAt ?? null,
    closedAtFormatted: formatDateTime(raw.closedAt),
  }
}

function toSaleItem(raw: SaleItemResponse): SaleItem {
  return {
    id: raw.id,
    productId: raw.productId,
    productName: raw.productName,
    productBarcode: raw.productBarcode ?? null,
    lotId: raw.lotId ?? null,
    lotNumber: raw.lotNumber ?? null,
    quantity: raw.quantity,
    unitPrice: raw.unitPrice,
    unitPriceFormatted: fmtRequired(raw.unitPrice),
    discountPercent: raw.discountPercent,
    subtotal: raw.subtotal,
    subtotalFormatted: fmtRequired(raw.subtotal),
  }
}

export function toSale(raw: SaleResponse): Sale {
  const items = raw.items.map(toSaleItem)
  return {
    id: raw.id,
    pharmacyId: raw.pharmacyId,
    pharmacyName: raw.pharmacyName,
    cashSessionId: raw.cashSessionId ?? null,
    prescriptionId: raw.prescriptionId ?? null,
    prescriptionNumber: raw.prescriptionNumber ?? null,
    patientId: raw.patientId ?? null,
    patientName: raw.patientName ?? null,
    customerId: raw.customerId ?? null,
    customerName: raw.customerName ?? null,
    sellerId: raw.sellerId,
    sellerName: raw.sellerName,
    saleNumber: raw.saleNumber,
    subtotal: raw.subtotal,
    subtotalFormatted: fmtRequired(raw.subtotal),
    taxAmount: raw.taxAmount,
    taxAmountFormatted: fmtRequired(raw.taxAmount),
    discountAmount: raw.discountAmount,
    discountAmountFormatted: fmtRequired(raw.discountAmount),
    total: raw.total,
    totalFormatted: fmtRequired(raw.total),
    paymentMethod: raw.paymentMethod,
    paymentMethodLabel: PAYMENT_METHOD_LABELS[raw.paymentMethod] ?? raw.paymentMethod,
    paymentReference: raw.paymentReference ?? null,
    status: raw.status,
    statusLabel: SALE_STATUS_LABELS[raw.status] ?? raw.status,
    statusColor: SALE_STATUS_COLORS[raw.status] ?? "",
    notes: raw.notes ?? null,
    items,
    totalItems: items.length,
    createdAt: raw.createdAt,
    createdAtFormatted: formatDateTime(raw.createdAt) ?? "—",
    updatedAt: raw.updatedAt,
  }
}

export function toSaleList(raw: SaleResponse[]): Sale[] {
  return raw.map(toSale)
}

// ─── Patient Purchase Summary ───────────────────────────────────────

export interface PatientPurchaseSummary {
  patientId: string
  patientName: string
  patientIdNumber: string
  totalPurchases: number
  totalSpent: number
  totalSpentFormatted: string
  lastPurchaseAt: string | null
  lastPurchaseAtFormatted: string | null
}

export function toPatientPurchaseSummary(
  raw: PatientPurchaseSummaryResponse
): PatientPurchaseSummary {
  return {
    patientId: raw.patientId,
    patientName: raw.patientName,
    patientIdNumber: raw.patientIdNumber,
    totalPurchases: raw.totalPurchases,
    totalSpent: raw.totalSpent,
    totalSpentFormatted: fmtRequired(raw.totalSpent),
    lastPurchaseAt: raw.lastPurchaseAt ?? null,
    lastPurchaseAtFormatted: formatDateTime(raw.lastPurchaseAt),
  }
}
