import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  MedicalRecordResponse,
  CreateMedicalRecordRequest,
  UpdateMedicalRecordRequest,
  VitalSignsResponse,
  CreateVitalSignsRequest,
  ConsultationResponse,
  CreateConsultationRequest,
  UpdateConsultationRequest,
  EvolutionNoteResponse,
  CreateEvolutionNoteRequest,
  ReferralResponse,
  CreateReferralRequest,
  ReferralStatus,
} from "@/types/clinical.model"
import {
  toMedicalRecord,
  toMedicalRecordList,
  toVitalSigns,
  toVitalSignsList,
  toConsultation,
  toConsultationList,
  toEvolutionNote,
  toEvolutionNoteList,
  toReferral,
  toReferralList,
} from "@/adapters/clinical.adapter"

const CLINICAL_KEY = ["clinical"]

// ─── Medical Records ─────────────────────────────────────────────────

export function useMedicalRecord(id: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "records", id],
    queryFn: async () => {
      const { data } = await api.get<MedicalRecordResponse>(
        `/clinical/medical-records/${id}`
      )
      return toMedicalRecord(data)
    },
    enabled: !!id,
  })
}

export function usePatientMedicalRecords(patientId: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "records", "patient", patientId],
    queryFn: async () => {
      const { data } = await api.get<MedicalRecordResponse[]>(
        `/clinical/medical-records/patient/${patientId}`
      )
      return toMedicalRecordList(data)
    },
    enabled: !!patientId,
  })
}

export function useOrganizationMedicalRecords() {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "records", "organization"],
    queryFn: async () => {
      const { data } = await api.get<MedicalRecordResponse[]>(
        "/clinical/medical-records/organization"
      )
      return toMedicalRecordList(data)
    },
  })
}

export function usePatientOrgMedicalRecord(patientId: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "records", "patient", patientId, "organization"],
    queryFn: async () => {
      const { data } = await api.get<MedicalRecordResponse | null>(
        `/clinical/medical-records/patient/${patientId}/organization`
      )
      return data ? toMedicalRecord(data) : null
    },
    enabled: !!patientId,
  })
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: CreateMedicalRecordRequest) => {
      const { data } = await api.post<MedicalRecordResponse>(
        "/clinical/medical-records",
        record
      )
      return toMedicalRecord(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICAL_KEY, "records"] }),
  })
}

export function useUpdateMedicalRecord(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: UpdateMedicalRecordRequest) => {
      const { data } = await api.put<MedicalRecordResponse>(
        `/clinical/medical-records/${id}`,
        record
      )
      return toMedicalRecord(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICAL_KEY, "records"] }),
  })
}

// ─── Vital Signs ─────────────────────────────────────────────────────

export function useVitalSigns(medicalRecordId: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "vital-signs", medicalRecordId],
    queryFn: async () => {
      const { data } = await api.get<VitalSignsResponse[]>(
        `/clinical/medical-records/${medicalRecordId}/vital-signs`
      )
      return toVitalSignsList(data)
    },
    enabled: !!medicalRecordId,
  })
}

export function useLatestVitalSigns(medicalRecordId: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "vital-signs", medicalRecordId, "latest"],
    queryFn: async () => {
      const { data } = await api.get<VitalSignsResponse>(
        `/clinical/medical-records/${medicalRecordId}/vital-signs/latest`
      )
      return data ? toVitalSigns(data) : null
    },
    enabled: !!medicalRecordId,
  })
}

export function useCreateVitalSigns() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (vitalSigns: CreateVitalSignsRequest) => {
      const { data } = await api.post<VitalSignsResponse>(
        "/clinical/vital-signs",
        vitalSigns
      )
      return toVitalSigns(data)
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: [...CLINICAL_KEY, "vital-signs", variables.medicalRecordId],
      }),
  })
}

// ─── Consultations ───────────────────────────────────────────────────

export function useConsultation(id: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "consultations", id],
    queryFn: async () => {
      const { data } = await api.get<ConsultationResponse>(
        `/clinical/consultations/${id}`
      )
      return toConsultation(data)
    },
    enabled: !!id,
  })
}

export function useRecordConsultations(medicalRecordId: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "consultations", "record", medicalRecordId],
    queryFn: async () => {
      const { data } = await api.get<ConsultationResponse[]>(
        `/clinical/medical-records/${medicalRecordId}/consultations`
      )
      return toConsultationList(data)
    },
    enabled: !!medicalRecordId,
  })
}

export function useMyConsultations() {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "consultations", "my"],
    queryFn: async () => {
      const { data } = await api.get<ConsultationResponse[]>(
        "/clinical/consultations/my"
      )
      return toConsultationList(data)
    },
  })
}

export function useOrganizationConsultations() {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "consultations", "organization"],
    queryFn: async () => {
      const { data } = await api.get<ConsultationResponse[]>(
        "/clinical/consultations/organization"
      )
      return toConsultationList(data)
    },
  })
}

export function useMyActiveConsultations() {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "consultations", "my", "active"],
    queryFn: async () => {
      const { data } = await api.get<ConsultationResponse[]>(
        "/clinical/consultations/my/active"
      )
      return toConsultationList(data)
    },
  })
}

export function useCreateConsultation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (consultation: CreateConsultationRequest) => {
      const { data } = await api.post<ConsultationResponse>(
        "/clinical/consultations",
        consultation
      )
      return toConsultation(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICAL_KEY, "consultations"] }),
  })
}

export function useUpdateConsultation(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (consultation: UpdateConsultationRequest) => {
      const { data } = await api.put<ConsultationResponse>(
        `/clinical/consultations/${id}`,
        consultation
      )
      return toConsultation(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICAL_KEY, "consultations"] }),
  })
}

export function useCompleteConsultation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<ConsultationResponse>(
        `/clinical/consultations/${id}/complete`
      )
      return toConsultation(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICAL_KEY, "consultations"] }),
  })
}

// ─── Evolution Notes ─────────────────────────────────────────────────

export function useEvolutionNotes(consultationId: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "evolution-notes", consultationId],
    queryFn: async () => {
      const { data } = await api.get<EvolutionNoteResponse[]>(
        `/clinical/consultations/${consultationId}/evolution-notes`
      )
      return toEvolutionNoteList(data)
    },
    enabled: !!consultationId,
  })
}

export function useCreateEvolutionNote(consultationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (note: CreateEvolutionNoteRequest) => {
      const { data } = await api.post<EvolutionNoteResponse>(
        `/clinical/consultations/${consultationId}/evolution-notes`,
        note
      )
      return toEvolutionNote(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...CLINICAL_KEY, "evolution-notes", consultationId],
      }),
  })
}

// ─── Referrals ───────────────────────────────────────────────────────

export function useReferral(id: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "referrals", id],
    queryFn: async () => {
      const { data } = await api.get<ReferralResponse>(
        `/clinical/referrals/${id}`
      )
      return toReferral(data)
    },
    enabled: !!id,
  })
}

export function useConsultationReferrals(consultationId: string) {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "referrals", "consultation", consultationId],
    queryFn: async () => {
      const { data } = await api.get<ReferralResponse[]>(
        `/clinical/consultations/${consultationId}/referrals`
      )
      return toReferralList(data)
    },
    enabled: !!consultationId,
  })
}

export function usePendingReferrals() {
  return useQuery({
    queryKey: [...CLINICAL_KEY, "referrals", "pending"],
    queryFn: async () => {
      const { data } = await api.get<ReferralResponse[]>(
        "/clinical/referrals/pending"
      )
      return toReferralList(data)
    },
  })
}

export function useCreateReferral(consultationId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (referral: CreateReferralRequest) => {
      const { data } = await api.post<ReferralResponse>(
        `/clinical/consultations/${consultationId}/referrals`,
        referral
      )
      return toReferral(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICAL_KEY, "referrals"] }),
  })
}

export function useUpdateReferralStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReferralStatus }) => {
      const { data } = await api.patch<ReferralResponse>(
        `/clinical/referrals/${id}/status`,
        null,
        { params: { status } }
      )
      return toReferral(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICAL_KEY, "referrals"] }),
  })
}
