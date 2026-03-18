export type MovementType = "IN" | "OUT" | "ADJUSTMENT" | "RETURN"

export interface CreateProductRequest {
  pharmacyId: string
  barcode?: string
  name: string
  genericName?: string
  activeIngredient?: string
  presentation?: string
  concentration?: string
  purchasePrice: number
  sellingPrice: number
  minStock: number
  requiresPrescription: boolean
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductResponse {
  id: string
  pharmacyId: string
  barcode?: string
  name: string
  genericName?: string
  activeIngredient?: string
  presentation?: string
  concentration?: string
  purchasePrice: number
  sellingPrice: number
  minStock: number
  currentStock: number
  requiresPrescription: boolean
  isActive: boolean
  isLowStock: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateProductLotRequest {
  lotNumber: string
  quantity: number
  expirationDate: string
  purchasePrice?: number
}

export interface ProductLotResponse {
  id: string
  productId: string
  productName: string
  lotNumber: string
  quantity: number
  expirationDate: string
  purchasePrice?: number
  daysUntilExpiration: number
  isExpired: boolean
  isExpiringSoon: boolean
  receivedAt: string
  createdAt: string
}

export interface BulkStockEntryRequest {
  entries: {
    productId: string
    lotNumber: string
    quantity: number
    expirationDate: string
    purchasePrice?: number
  }[]
}

export interface InventoryMovementResponse {
  id: string
  productId: string
  productName: string
  lotId?: string
  lotNumber?: string
  userId: string
  userName: string
  movementType: MovementType
  quantity: number
  unitPrice?: number
  totalPrice?: number
  reason?: string
  referenceId?: string
  referenceType?: string
  notes?: string
  createdAt: string
}
