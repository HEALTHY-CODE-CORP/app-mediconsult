import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  CreateDentalDateRequest,
  CreateDentalRecordRequest,
  CreateOdontogramVersionRequest,
  DentalDateResponse,
  DentalRecordResponse,
  OdontogramVersionResponse,
  UpdateDentalDateRequest,
  UpdateDentalRecordRequest,
} from "@/types/dental.model"
import {
  toDentalDate,
  toDentalDateList,
  toDentalRecord,
  toDentalRecordList,
  toOdontogramVersion,
  toOdontogramVersionList,
} from "@/adapters/dental.adapter"

const DENTAL_KEY = ["dental"]

export function usePatientOrgDentalRecord(patientId: string) {
  return useQuery({
    queryKey: [...DENTAL_KEY, "records", "patient", patientId, "organization"],
    queryFn: async () => {
      const { data } = await api.get<DentalRecordResponse | null>(
        `/dental/records/patient/${patientId}/organization`
      )
      return data ? toDentalRecord(data) : null
    },
    enabled: !!patientId,
  })
}

export function useDentalRecord(id: string) {
  return useQuery({
    queryKey: [...DENTAL_KEY, "records", id],
    queryFn: async () => {
      const { data } = await api.get<DentalRecordResponse>(`/dental/records/${id}`)
      return toDentalRecord(data)
    },
    enabled: !!id,
  })
}

export function useOrganizationDentalRecords() {
  return useQuery({
    queryKey: [...DENTAL_KEY, "records", "organization"],
    queryFn: async () => {
      const { data } = await api.get<DentalRecordResponse[]>("/dental/records/organization")
      return toDentalRecordList(data)
    },
  })
}

export function useCreateDentalRecord() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: CreateDentalRecordRequest) => {
      const { data } = await api.post<DentalRecordResponse>("/dental/records", record)
      return toDentalRecord(data)
    },
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "records"] })
      queryClient.invalidateQueries({
        queryKey: [...DENTAL_KEY, "records", "patient", record.patientId, "organization"],
      })
    },
  })
}

export function useUpdateDentalRecord(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (record: UpdateDentalRecordRequest) => {
      const { data } = await api.put<DentalRecordResponse>(`/dental/records/${id}`, record)
      return toDentalRecord(data)
    },
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "records"] })
      queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "records", id] })
      queryClient.invalidateQueries({
        queryKey: [...DENTAL_KEY, "records", "patient", record.patientId, "organization"],
      })
    },
  })
}

export function useDentalDates(dentalRecordId: string) {
  return useQuery({
    queryKey: [...DENTAL_KEY, "dates", "record", dentalRecordId],
    queryFn: async () => {
      const { data } = await api.get<DentalDateResponse[]>(`/dental/records/${dentalRecordId}/dates`)
      return toDentalDateList(data)
    },
    enabled: !!dentalRecordId,
  })
}

export function useCreateDentalDate(dentalRecordId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateDentalDateRequest) => {
      const { data } = await api.post<DentalDateResponse>(`/dental/records/${dentalRecordId}/dates`, payload)
      return toDentalDate(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "dates", "record", dentalRecordId] })
      queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "odontogram-versions", dentalRecordId] })
    },
  })
}

export function useUpdateDentalDate(id: string, dentalRecordId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: UpdateDentalDateRequest) => {
      const { data } = await api.put<DentalDateResponse>(`/dental/dates/${id}`, payload)
      return toDentalDate(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "dates"] })
      if (dentalRecordId) {
        queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "dates", "record", dentalRecordId] })
        queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "odontogram-versions", dentalRecordId] })
      }
    },
  })
}

export function useCompleteDentalDate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<DentalDateResponse>(`/dental/dates/${id}/complete`)
      return toDentalDate(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "dates"] }),
  })
}

export function useOdontogramVersions(dentalRecordId: string) {
  return useQuery({
    queryKey: [...DENTAL_KEY, "odontogram-versions", dentalRecordId],
    queryFn: async () => {
      const { data } = await api.get<OdontogramVersionResponse[]>(
        `/dental/records/${dentalRecordId}/odontogram-versions`
      )
      return toOdontogramVersionList(data)
    },
    enabled: !!dentalRecordId,
  })
}

export function useCurrentOdontogramVersion(dentalRecordId: string) {
  return useQuery({
    queryKey: [...DENTAL_KEY, "odontogram-versions", dentalRecordId, "current"],
    queryFn: async () => {
      const { data } = await api.get<OdontogramVersionResponse | null>(
        `/dental/records/${dentalRecordId}/odontogram-versions/current`
      )
      return data ? toOdontogramVersion(data) : null
    },
    enabled: !!dentalRecordId,
  })
}

export function useCreateOdontogramVersion(dentalRecordId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateOdontogramVersionRequest) => {
      const { data } = await api.post<OdontogramVersionResponse>(
        `/dental/records/${dentalRecordId}/odontogram-versions`,
        payload
      )
      return toOdontogramVersion(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "odontogram-versions", dentalRecordId] })
      queryClient.invalidateQueries({ queryKey: [...DENTAL_KEY, "odontogram-versions", dentalRecordId, "current"] })
    },
  })
}
