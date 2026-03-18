import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  PatientResponse,
  CreatePatientRequest,
  UpdatePatientRequest,
  AllergyResponse,
  CreateAllergyRequest,
} from "@/types/patient.model"
import { toPatient, toPatientList, toAllergy, toAllergyList } from "@/adapters/patient.adapter"

const PATIENTS_KEY = ["patients"]

export function usePatients() {
  return useQuery({
    queryKey: PATIENTS_KEY,
    queryFn: async () => {
      const { data } = await api.get<PatientResponse[]>("/patients")
      return toPatientList(data)
    },
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: [...PATIENTS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<PatientResponse>(`/patients/${id}`)
      return toPatient(data)
    },
    enabled: !!id,
  })
}

export function usePatientByIdNumber(idNumber: string) {
  return useQuery({
    queryKey: [...PATIENTS_KEY, "id-number", idNumber],
    queryFn: async () => {
      const { data } = await api.get<PatientResponse>(`/patients/id-number/${idNumber}`)
      return toPatient(data)
    },
    enabled: !!idNumber,
  })
}

export function useSearchPatients(query: string) {
  return useQuery({
    queryKey: [...PATIENTS_KEY, "search", query],
    queryFn: async () => {
      const { data } = await api.get<PatientResponse[]>("/patients/search", {
        params: { q: query },
      })
      return toPatientList(data)
    },
    enabled: query.length >= 2,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patient: CreatePatientRequest) => {
      const { data } = await api.post<PatientResponse>("/patients", patient)
      return toPatient(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_KEY }),
  })
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (patient: UpdatePatientRequest) => {
      const { data } = await api.put<PatientResponse>(`/patients/${id}`, patient)
      return toPatient(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_KEY }),
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/patients/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PATIENTS_KEY }),
  })
}

// Allergies
export function usePatientAllergies(patientId: string) {
  return useQuery({
    queryKey: [...PATIENTS_KEY, patientId, "allergies"],
    queryFn: async () => {
      const { data } = await api.get<AllergyResponse[]>(`/patients/${patientId}/allergies`)
      return toAllergyList(data)
    },
    enabled: !!patientId,
  })
}

export function useCreateAllergy(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (allergy: CreateAllergyRequest) => {
      const { data } = await api.post<AllergyResponse>(
        `/patients/${patientId}/allergies`,
        allergy
      )
      return toAllergy(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...PATIENTS_KEY, patientId, "allergies"],
      }),
  })
}

export function useDeactivateAllergy(patientId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (allergyId: string) => {
      await api.patch(`/patients/${patientId}/allergies/${allergyId}/deactivate`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [...PATIENTS_KEY, patientId, "allergies"],
      }),
  })
}
