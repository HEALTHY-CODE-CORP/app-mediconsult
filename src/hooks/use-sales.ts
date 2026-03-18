import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  CashRegisterSessionResponse,
  CashSessionSummaryResponse,
  OpenCashSessionRequest,
  CloseCashSessionRequest,
  SaleResponse,
  CreateSaleRequest,
  PatientPurchaseSummaryResponse,
} from "@/types/sales.model"
import {
  toCashSession,
  toCashSessionList,
  toCashSessionSummary,
  toSale,
  toSaleList,
  toPatientPurchaseSummary,
} from "@/adapters/sales.adapter"

const SALES_KEY = ["sales"]
const CASH_SESSIONS_KEY = ["cash-sessions"]

// ─── Cash Sessions ───────────────────────────────────────────────────

export function useCashSession(id: string) {
  return useQuery({
    queryKey: [...CASH_SESSIONS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<CashRegisterSessionResponse>(
        `/sales/cash-sessions/${id}`
      )
      return toCashSession(data)
    },
    enabled: !!id,
  })
}

export function useMyOpenCashSession() {
  return useQuery({
    queryKey: [...CASH_SESSIONS_KEY, "my", "open"],
    queryFn: async () => {
      const { data } = await api.get<CashRegisterSessionResponse | null>(
        "/sales/cash-sessions/my/open"
      )
      return data ? toCashSession(data) : null
    },
  })
}

export function usePharmacyCashSessions(pharmacyId: string) {
  return useQuery({
    queryKey: [...CASH_SESSIONS_KEY, "pharmacy", pharmacyId],
    queryFn: async () => {
      const { data } = await api.get<CashRegisterSessionResponse[]>(
        `/sales/cash-sessions/pharmacy/${pharmacyId}`
      )
      return toCashSessionList(data)
    },
    enabled: !!pharmacyId,
  })
}

export function useCashSessionSummary(sessionId: string) {
  return useQuery({
    queryKey: [...CASH_SESSIONS_KEY, sessionId, "summary"],
    queryFn: async () => {
      const { data } = await api.get<CashSessionSummaryResponse>(
        `/sales/cash-sessions/${sessionId}/summary`
      )
      return toCashSessionSummary(data)
    },
    enabled: !!sessionId,
  })
}

export function useCashSessionSales(sessionId: string) {
  return useQuery({
    queryKey: [...CASH_SESSIONS_KEY, sessionId, "sales"],
    queryFn: async () => {
      const { data } = await api.get<SaleResponse[]>(
        `/sales/cash-sessions/${sessionId}/sales`
      )
      return toSaleList(data)
    },
    enabled: !!sessionId,
  })
}

export function useOpenCashSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (session: OpenCashSessionRequest) => {
      const { data } = await api.post<CashRegisterSessionResponse>(
        "/sales/cash-sessions",
        session
      )
      return toCashSession(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CASH_SESSIONS_KEY }),
  })
}

export function useCloseCashSession(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (session: CloseCashSessionRequest) => {
      const { data } = await api.post<CashRegisterSessionResponse>(
        `/sales/cash-sessions/${id}/close`,
        session
      )
      return toCashSession(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: CASH_SESSIONS_KEY }),
  })
}

// ─── Sales ───────────────────────────────────────────────────────────

export function useSale(id: string) {
  return useQuery({
    queryKey: [...SALES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<SaleResponse>(`/sales/${id}`)
      return toSale(data)
    },
    enabled: !!id,
  })
}

export function usePharmacySales(pharmacyId: string) {
  return useQuery({
    queryKey: [...SALES_KEY, "pharmacy", pharmacyId],
    queryFn: async () => {
      const { data } = await api.get<SaleResponse[]>(
        `/sales/pharmacy/${pharmacyId}`
      )
      return toSaleList(data)
    },
    enabled: !!pharmacyId,
  })
}

export function useMySales() {
  return useQuery({
    queryKey: [...SALES_KEY, "my"],
    queryFn: async () => {
      const { data } = await api.get<SaleResponse[]>("/sales/my")
      return toSaleList(data)
    },
  })
}

export function usePatientPurchaseSummary(patientId: string) {
  return useQuery({
    queryKey: [...SALES_KEY, "patient", patientId, "summary"],
    queryFn: async () => {
      const { data } = await api.get<PatientPurchaseSummaryResponse>(
        `/sales/patient/${patientId}/summary`
      )
      return toPatientPurchaseSummary(data)
    },
    enabled: !!patientId,
  })
}

export function useCreateSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sale: CreateSaleRequest) => {
      const { data } = await api.post<SaleResponse>("/sales", sale)
      return toSale(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_KEY })
      queryClient.invalidateQueries({ queryKey: CASH_SESSIONS_KEY })
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] })
    },
  })
}

export function useCancelSale() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<SaleResponse>(`/sales/${id}/cancel`)
      return toSale(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SALES_KEY })
      queryClient.invalidateQueries({ queryKey: CASH_SESSIONS_KEY })
    },
  })
}
