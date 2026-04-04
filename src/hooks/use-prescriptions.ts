import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  PrescriptionResponse,
  CreatePrescriptionRequest,
  SignPrescriptionRequest,
  StockAvailabilityResponse,
} from "@/types/prescription.model"
import {
  toPrescription,
  toPrescriptionList,
  toStockAvailabilityList,
} from "@/adapters/prescription.adapter"

const PRESCRIPTIONS_KEY = ["prescriptions"]

// ─── Queries ─────────────────────────────────────────────────────────

export function usePrescription(id: string) {
  return useQuery({
    queryKey: [...PRESCRIPTIONS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionResponse>(`/prescriptions/${id}`)
      return toPrescription(data)
    },
    enabled: !!id,
  })
}

export function useConsultationPrescriptions(consultationId: string) {
  return useQuery({
    queryKey: [...PRESCRIPTIONS_KEY, "consultation", consultationId],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionResponse[]>(
        `/prescriptions/consultation/${consultationId}`
      )
      return toPrescriptionList(data)
    },
    enabled: !!consultationId,
  })
}

export function usePatientPrescriptions(patientId: string) {
  return useQuery({
    queryKey: [...PRESCRIPTIONS_KEY, "patient", patientId],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionResponse[]>(
        `/prescriptions/patient/${patientId}`
      )
      return toPrescriptionList(data)
    },
    enabled: !!patientId,
  })
}

export function usePendingPrescriptions(pharmacyId: string) {
  return useQuery({
    queryKey: [...PRESCRIPTIONS_KEY, "pharmacy", pharmacyId, "pending"],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionResponse[]>(
        `/prescriptions/pharmacy/${pharmacyId}/pending`
      )
      return toPrescriptionList(data)
    },
    enabled: !!pharmacyId,
  })
}

export function useOrganizationPendingPrescriptions() {
  return useQuery({
    queryKey: [...PRESCRIPTIONS_KEY, "organization", "pending"],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionResponse[]>(
        "/prescriptions/organization/pending"
      )
      return toPrescriptionList(data)
    },
  })
}

export function useMyPrescriptions() {
  return useQuery({
    queryKey: [...PRESCRIPTIONS_KEY, "my"],
    queryFn: async () => {
      const { data } = await api.get<PrescriptionResponse[]>("/prescriptions/my")
      return toPrescriptionList(data)
    },
  })
}

export function useStockCheck(prescriptionId: string, pharmacyId: string) {
  return useQuery({
    queryKey: [...PRESCRIPTIONS_KEY, prescriptionId, "stock-check", pharmacyId],
    queryFn: async () => {
      const { data } = await api.get<StockAvailabilityResponse[]>(
        `/prescriptions/${prescriptionId}/stock-check/${pharmacyId}`
      )
      return toStockAvailabilityList(data)
    },
    enabled: !!prescriptionId && !!pharmacyId,
  })
}

// ─── Mutations ───────────────────────────────────────────────────────

export function useCreatePrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (prescription: CreatePrescriptionRequest) => {
      const { data } = await api.post<PrescriptionResponse>(
        "/prescriptions",
        prescription
      )
      return toPrescription(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRESCRIPTIONS_KEY }),
  })
}

export function useAssignPharmacy(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pharmacyId: string) => {
      const { data } = await api.patch<PrescriptionResponse>(
        `/prescriptions/${id}/assign-pharmacy/${pharmacyId}`
      )
      return toPrescription(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRESCRIPTIONS_KEY }),
  })
}

export function useMarkPrescriptionExternal() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<PrescriptionResponse>(
        `/prescriptions/${id}/mark-external`
      )
      return toPrescription(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRESCRIPTIONS_KEY }),
  })
}

export function useCancelPrescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<PrescriptionResponse>(
        `/prescriptions/${id}/cancel`
      )
      return toPrescription(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRESCRIPTIONS_KEY }),
  })
}

export function useSignPrescription(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload?: SignPrescriptionRequest) => {
      const { data } = await api.patch<PrescriptionResponse>(
        `/prescriptions/${id}/sign`,
        payload
      )
      return toPrescription(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PRESCRIPTIONS_KEY }),
  })
}
