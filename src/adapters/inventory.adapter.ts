import type {
  ProductResponse,
  ProductLotResponse,
  InventoryMovementResponse,
  MovementType,
} from "@/types/inventory.model"

// ─── Label maps ──────────────────────────────────────────────────────

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  IN: "Entrada",
  OUT: "Salida",
  ADJUSTMENT: "Ajuste",
  RETURN: "Devolución",
}

export const MOVEMENT_TYPE_COLORS: Record<MovementType, string> = {
  IN: "bg-green-100 text-green-800",
  OUT: "bg-red-100 text-red-800",
  ADJUSTMENT: "bg-yellow-100 text-yellow-800",
  RETURN: "bg-blue-100 text-blue-800",
}

// ─── Domain types ────────────────────────────────────────────────────

export interface Product {
  id: string
  pharmacyId: string
  barcode: string | null
  name: string
  genericName: string | null
  activeIngredient: string | null
  presentation: string | null
  concentration: string | null
  purchasePrice: number
  sellingPrice: number
  minStock: number
  currentStock: number
  requiresPrescription: boolean
  isActive: boolean
  isLowStock: boolean
  /** e.g. "Ibuprofeno 400mg - Tabletas" */
  displayName: string
  /** formatted price "$12.50" */
  sellingPriceFormatted: string
  purchasePriceFormatted: string
  /** "Activo" | "Inactivo" */
  statusLabel: string
  createdAt: string
  updatedAt: string
}

export interface ProductLot {
  id: string
  productId: string
  productName: string
  lotNumber: string
  quantity: number
  expirationDate: string
  expirationDateFormatted: string
  purchasePrice: number | null
  purchasePriceFormatted: string | null
  daysUntilExpiration: number
  isExpired: boolean
  isExpiringSoon: boolean
  /** "Vencido" | "Por vencer (Xd)" | "Vigente" */
  expirationLabel: string
  expirationColor: string
  receivedAt: string
  receivedAtFormatted: string
  createdAt: string
}

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  lotId: string | null
  lotNumber: string | null
  userId: string
  userName: string
  movementType: MovementType
  movementTypeLabel: string
  movementTypeColor: string
  quantity: number
  unitPrice: number | null
  totalPrice: number | null
  totalPriceFormatted: string | null
  reason: string | null
  referenceId: string | null
  referenceType: string | null
  notes: string | null
  createdAt: string
  createdAtFormatted: string
}

// ─── Helpers ─────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined): string | null {
  if (value == null) return null
  return `$${value.toFixed(2)}`
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—"
  try {
    return new Intl.DateTimeFormat("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—"
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

export function toProduct(raw: ProductResponse): Product {
  const parts = [raw.name]
  if (raw.concentration) parts.push(raw.concentration)
  if (raw.presentation) parts.push(`- ${raw.presentation}`)

  return {
    id: raw.id,
    pharmacyId: raw.pharmacyId,
    barcode: raw.barcode ?? null,
    name: raw.name,
    genericName: raw.genericName ?? null,
    activeIngredient: raw.activeIngredient ?? null,
    presentation: raw.presentation ?? null,
    concentration: raw.concentration ?? null,
    purchasePrice: raw.purchasePrice,
    sellingPrice: raw.sellingPrice,
    minStock: raw.minStock,
    currentStock: raw.currentStock,
    requiresPrescription: raw.requiresPrescription,
    isActive: raw.isActive,
    isLowStock: raw.isLowStock,
    displayName: parts.join(" "),
    sellingPriceFormatted: formatCurrency(raw.sellingPrice) ?? "$0.00",
    purchasePriceFormatted: formatCurrency(raw.purchasePrice) ?? "$0.00",
    statusLabel: raw.isActive ? "Activo" : "Inactivo",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export function toProductList(raw: ProductResponse[]): Product[] {
  return raw.map(toProduct)
}

export function toProductLot(raw: ProductLotResponse): ProductLot {
  let expirationLabel: string
  let expirationColor: string

  if (raw.isExpired) {
    expirationLabel = "Vencido"
    expirationColor = "bg-red-100 text-red-800"
  } else if (raw.isExpiringSoon) {
    expirationLabel = `Por vencer (${raw.daysUntilExpiration}d)`
    expirationColor = "bg-yellow-100 text-yellow-800"
  } else {
    expirationLabel = "Vigente"
    expirationColor = "bg-green-100 text-green-800"
  }

  return {
    id: raw.id,
    productId: raw.productId,
    productName: raw.productName,
    lotNumber: raw.lotNumber,
    quantity: raw.quantity,
    expirationDate: raw.expirationDate,
    expirationDateFormatted: formatDate(raw.expirationDate),
    purchasePrice: raw.purchasePrice ?? null,
    purchasePriceFormatted: formatCurrency(raw.purchasePrice),
    daysUntilExpiration: raw.daysUntilExpiration,
    isExpired: raw.isExpired,
    isExpiringSoon: raw.isExpiringSoon,
    expirationLabel,
    expirationColor,
    receivedAt: raw.receivedAt,
    receivedAtFormatted: formatDateTime(raw.receivedAt),
    createdAt: raw.createdAt,
  }
}

export function toProductLotList(raw: ProductLotResponse[]): ProductLot[] {
  return raw.map(toProductLot)
}

export function toInventoryMovement(raw: InventoryMovementResponse): InventoryMovement {
  return {
    id: raw.id,
    productId: raw.productId,
    productName: raw.productName,
    lotId: raw.lotId ?? null,
    lotNumber: raw.lotNumber ?? null,
    userId: raw.userId,
    userName: raw.userName,
    movementType: raw.movementType,
    movementTypeLabel: MOVEMENT_TYPE_LABELS[raw.movementType] ?? raw.movementType,
    movementTypeColor: MOVEMENT_TYPE_COLORS[raw.movementType] ?? "",
    quantity: raw.quantity,
    unitPrice: raw.unitPrice ?? null,
    totalPrice: raw.totalPrice ?? null,
    totalPriceFormatted: formatCurrency(raw.totalPrice),
    reason: raw.reason ?? null,
    referenceId: raw.referenceId ?? null,
    referenceType: raw.referenceType ?? null,
    notes: raw.notes ?? null,
    createdAt: raw.createdAt,
    createdAtFormatted: formatDateTime(raw.createdAt),
  }
}

export function toInventoryMovementList(raw: InventoryMovementResponse[]): InventoryMovement[] {
  return raw.map(toInventoryMovement)
}
