import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Product } from "@/adapters/inventory.adapter"
import type {
  ProductResponse,
  CreateProductRequest,
  UpdateProductRequest,
  ProductLotResponse,
  CreateProductLotRequest,
  BulkStockEntryRequest,
  InventoryMovementResponse,
} from "@/types/inventory.model"
import type { SpringPage } from "@/types/api"
import {
  toProduct,
  toProductList,
  toProductLot,
  toProductLotList,
  toInventoryMovementList,
} from "@/adapters/inventory.adapter"

function inventoryKey(pharmacyId: string) {
  return ["inventory", pharmacyId]
}

export interface ProductSearchPage {
  items: Product[]
  page: number
  size: number
  totalPages: number
  totalElements: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

// ─── Products ────────────────────────────────────────────────────────

export function useProducts(pharmacyId: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "products"],
    queryFn: async () => {
      const { data } = await api.get<ProductResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/products`
      )
      return toProductList(data)
    },
    enabled: !!pharmacyId,
  })
}

export function useProduct(pharmacyId: string, productId: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "products", productId],
    queryFn: async () => {
      const { data } = await api.get<ProductResponse>(
        `/pharmacies/${pharmacyId}/inventory/products/${productId}`
      )
      return toProduct(data)
    },
    enabled: !!pharmacyId && !!productId,
  })
}

export function useProductByBarcode(pharmacyId: string, barcode: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "products", "barcode", barcode],
    queryFn: async () => {
      const { data } = await api.get<ProductResponse>(
        `/pharmacies/${pharmacyId}/inventory/products/barcode/${barcode}`
      )
      return toProduct(data)
    },
    enabled: !!pharmacyId && !!barcode,
  })
}

export function useSearchProductsByName(pharmacyId: string, query: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "products", "search-name", query],
    queryFn: async () => {
      const { data } = await api.get<ProductResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/products/search/name`,
        { params: { q: query } }
      )
      return toProductList(data)
    },
    enabled: !!pharmacyId && query.length >= 2,
  })
}

export function useSearchProducts(
  pharmacyId: string,
  query: string,
  page: number,
  size = 20
) {
  const normalizedQuery = query.trim()

  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "products", "search", normalizedQuery, page, size],
    queryFn: async () => {
      const { data } = await api.get<SpringPage<ProductResponse>>(
        `/pharmacies/${pharmacyId}/inventory/products/search`,
        { params: { q: normalizedQuery, page, size } }
      )

      return {
        items: toProductList(data.content),
        page: data.number,
        size: data.size,
        totalPages: data.totalPages,
        totalElements: data.totalElements,
        numberOfElements: data.numberOfElements,
        first: data.first,
        last: data.last,
        empty: data.empty,
      } satisfies ProductSearchPage
    },
    enabled: !!pharmacyId && normalizedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
  })
}

export function useSearchProductsByIngredient(pharmacyId: string, query: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "products", "search-ingredient", query],
    queryFn: async () => {
      const { data } = await api.get<ProductResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/products/search/active-ingredient`,
        { params: { q: query } }
      )
      return toProductList(data)
    },
    enabled: !!pharmacyId && query.length >= 2,
  })
}

export function useCreateProduct(pharmacyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (product: CreateProductRequest) => {
      const { data } = await api.post<ProductResponse>(
        `/pharmacies/${pharmacyId}/inventory/products`,
        product
      )
      return toProduct(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inventoryKey(pharmacyId) }),
  })
}

export function useUpdateProduct(pharmacyId: string, productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (product: UpdateProductRequest) => {
      const { data } = await api.put<ProductResponse>(
        `/pharmacies/${pharmacyId}/inventory/products/${productId}`,
        product
      )
      return toProduct(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inventoryKey(pharmacyId) }),
  })
}

export function useDeleteProduct(pharmacyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(
        `/pharmacies/${pharmacyId}/inventory/products/${productId}`
      )
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inventoryKey(pharmacyId) }),
  })
}

// ─── Lots ────────────────────────────────────────────────────────────

export function useProductLots(pharmacyId: string, productId: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "products", productId, "lots"],
    queryFn: async () => {
      const { data } = await api.get<ProductLotResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/products/${productId}/lots`
      )
      return toProductLotList(data)
    },
    enabled: !!pharmacyId && !!productId,
  })
}

export function useCreateProductLot(pharmacyId: string, productId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (lot: CreateProductLotRequest) => {
      const { data } = await api.post<ProductLotResponse>(
        `/pharmacies/${pharmacyId}/inventory/products/${productId}/lots`,
        lot
      )
      return toProductLot(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inventoryKey(pharmacyId) }),
  })
}

export function useBulkStockEntry(pharmacyId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (entry: BulkStockEntryRequest) => {
      const { data } = await api.post<ProductLotResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/bulk-entry`,
        entry
      )
      return toProductLotList(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: inventoryKey(pharmacyId) }),
  })
}

// ─── Alerts ──────────────────────────────────────────────────────────

export function useLowStockAlerts(pharmacyId: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "alerts", "low-stock"],
    queryFn: async () => {
      const { data } = await api.get<ProductResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/alerts/low-stock`
      )
      return toProductList(data)
    },
    enabled: !!pharmacyId,
  })
}

export function useExpiringAlerts(pharmacyId: string, days = 30) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "alerts", "expiring", days],
    queryFn: async () => {
      const { data } = await api.get<ProductLotResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/alerts/expiring`,
        { params: { days } }
      )
      return toProductLotList(data)
    },
    enabled: !!pharmacyId,
  })
}

export function useExpiredAlerts(pharmacyId: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "alerts", "expired"],
    queryFn: async () => {
      const { data } = await api.get<ProductLotResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/alerts/expired`
      )
      return toProductLotList(data)
    },
    enabled: !!pharmacyId,
  })
}

// ─── Movements ───────────────────────────────────────────────────────

export function useProductMovements(pharmacyId: string, productId: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "movements", productId],
    queryFn: async () => {
      const { data } = await api.get<InventoryMovementResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/products/${productId}/movements`
      )
      return toInventoryMovementList(data)
    },
    enabled: !!pharmacyId && !!productId,
  })
}

export function useAllMovements(pharmacyId: string) {
  return useQuery({
    queryKey: [...inventoryKey(pharmacyId), "movements"],
    queryFn: async () => {
      const { data } = await api.get<InventoryMovementResponse[]>(
        `/pharmacies/${pharmacyId}/inventory/movements`
      )
      return toInventoryMovementList(data)
    },
    enabled: !!pharmacyId,
  })
}
