import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  InvoiceResponse,
  CreateInvoiceRequest,
  CreateConsultationInvoiceRequest,
  SriAuthorizationResponse,
  SriInvoiceRequest,
} from "@/types/billing.model"
import { toInvoice, toInvoiceList } from "@/adapters/billing.adapter"

const BILLING_KEY = ["billing"]

export function useInvoice(id: string) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", id],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse>(`/billing/invoices/${id}`)
      return toInvoice(data)
    },
    enabled: !!id,
  })
}

export function useSaleInvoice(saleId: string) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "sale", saleId],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse | null>(
        `/billing/invoices/sale/${saleId}`
      )
      return data ? toInvoice(data) : null
    },
    enabled: !!saleId,
  })
}

export function useConsultationInvoice(consultationId: string) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "consultation", consultationId],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse | null>(
        `/billing/invoices/consultation/${consultationId}`
      )
      return data ? toInvoice(data) : null
    },
    enabled: !!consultationId,
  })
}

export function useOrganizationInvoices() {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "organization"],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>(
        "/billing/invoices/organization"
      )
      return toInvoiceList(data)
    },
  })
}

export function usePharmacyInvoices(pharmacyId: string) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "pharmacy", pharmacyId],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>(
        `/billing/invoices/pharmacy/${pharmacyId}`
      )
      return toInvoiceList(data)
    },
    enabled: !!pharmacyId,
  })
}

export function usePharmacyInvoicesByStatus(pharmacyId: string, status: string) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "pharmacy", pharmacyId, "status", status],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>(
        `/billing/invoices/pharmacy/${pharmacyId}/status/${status}`
      )
      return toInvoiceList(data)
    },
    enabled: !!pharmacyId && !!status,
  })
}

export function usePharmacyInvoicesByDateRange(
  pharmacyId: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "pharmacy", pharmacyId, "dates", startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>(
        `/billing/invoices/pharmacy/${pharmacyId}/date-range`,
        { params: { startDate, endDate } }
      )
      return toInvoiceList(data)
    },
    enabled: !!pharmacyId && !!startDate && !!endDate,
  })
}

export function useCustomerInvoices(identificacion: string) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "customer", identificacion],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>(
        `/billing/invoices/customer/${identificacion}`
      )
      return toInvoiceList(data)
    },
    enabled: !!identificacion,
  })
}

// === Consultation Billing Queries ===

export function useOrganizationConsultationInvoices() {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "organization", "consultations"],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>(
        "/billing/invoices/organization/consultations"
      )
      return toInvoiceList(data)
    },
  })
}

export function useClinicInvoices(clinicId: string) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "clinic", clinicId],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>(
        `/billing/invoices/clinic/${clinicId}`
      )
      return toInvoiceList(data)
    },
    enabled: !!clinicId,
  })
}

export function useClinicInvoicesByStatus(clinicId: string, status: string) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "clinic", clinicId, "status", status],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>(
        `/billing/invoices/clinic/${clinicId}/status/${status}`
      )
      return toInvoiceList(data)
    },
    enabled: !!clinicId && !!status,
  })
}

export function useClinicInvoicesByDateRange(
  clinicId: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "clinic", clinicId, "dates", startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>(
        `/billing/invoices/clinic/${clinicId}/date-range`,
        { params: { startDate, endDate } }
      )
      return toInvoiceList(data)
    },
    enabled: !!clinicId && !!startDate && !!endDate,
  })
}

export function useMyInvoices() {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", "my"],
    queryFn: async () => {
      const { data } = await api.get<InvoiceResponse[]>("/billing/invoices/my")
      return toInvoiceList(data)
    },
  })
}

export function useSriInvoiceRequest(invoiceId: string) {
  return useQuery({
    queryKey: [...BILLING_KEY, "invoices", invoiceId, "sri-request"],
    queryFn: async () => {
      const { data } = await api.get<SriInvoiceRequest>(
        `/billing/invoices/${invoiceId}/sri-request`
      )
      return data
    },
    enabled: !!invoiceId,
  })
}

// === Mutations ===

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (invoice: CreateInvoiceRequest) => {
      const { data } = await api.post<InvoiceResponse>(
        "/billing/invoices",
        invoice
      )
      return toInvoice(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BILLING_KEY }),
  })
}

export function useCreateConsultationInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (invoice: CreateConsultationInvoiceRequest) => {
      const { data } = await api.post<InvoiceResponse>(
        "/billing/invoices/consultation",
        invoice
      )
      return toInvoice(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BILLING_KEY }),
  })
}

export function useSubmitSriResponse(invoiceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sriResponse: SriAuthorizationResponse) => {
      const { data } = await api.post<InvoiceResponse>(
        `/billing/invoices/${invoiceId}/sri-response`,
        sriResponse
      )
      return toInvoice(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BILLING_KEY }),
  })
}

export function useMarkInvoicePending(invoiceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch<InvoiceResponse>(
        `/billing/invoices/${invoiceId}/pending`
      )
      return toInvoice(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BILLING_KEY }),
  })
}

export function useCancelInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data } = await api.patch<InvoiceResponse>(
        `/billing/invoices/${invoiceId}/cancel`
      )
      return toInvoice(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BILLING_KEY }),
  })
}
