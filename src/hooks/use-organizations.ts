import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  OrganizationResponse,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  ClinicResponse,
  CreateClinicRequest,
  PharmacyResponse,
  CreatePharmacyRequest,
  ClinicPharmacyResponse,
  ClinicStaffResponse,
  AssignStaffRequest,
} from "@/types/organization.model"
import {
  toOrganization,
  toOrganizationList,
  toClinic,
  toClinicList,
  toPharmacy,
  toPharmacyList,
  toClinicPharmacyList,
  toClinicStaffList,
} from "@/adapters/organization.adapter"

const ORGS_KEY = ["organizations"]
const CLINICS_KEY = ["clinics"]
const PHARMACIES_KEY = ["pharmacies"]

// ─── Organizations ───────────────────────────────────────────────────

export function useOrganizations() {
  return useQuery({
    queryKey: ORGS_KEY,
    queryFn: async () => {
      const { data } = await api.get<OrganizationResponse[]>("/organizations")
      return toOrganizationList(data)
    },
  })
}

export function useOrganization(id: string) {
  return useQuery({
    queryKey: [...ORGS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<OrganizationResponse>(`/organizations/${id}`)
      return toOrganization(data)
    },
    enabled: !!id,
  })
}

export function useOrganizationByRuc(ruc: string) {
  return useQuery({
    queryKey: [...ORGS_KEY, "ruc", ruc],
    queryFn: async () => {
      const { data } = await api.get<OrganizationResponse>(`/organizations/ruc/${ruc}`)
      return toOrganization(data)
    },
    enabled: !!ruc,
  })
}

export function useCreateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (org: CreateOrganizationRequest) => {
      const { data } = await api.post<OrganizationResponse>("/organizations", org)
      return toOrganization(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORGS_KEY }),
  })
}

export function useUpdateOrganization(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (org: UpdateOrganizationRequest) => {
      const { data } = await api.put<OrganizationResponse>(`/organizations/${id}`, org)
      return toOrganization(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORGS_KEY }),
  })
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/organizations/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORGS_KEY }),
  })
}

export function useDeactivateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<OrganizationResponse>(`/organizations/${id}/deactivate`)
      return toOrganization(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORGS_KEY }),
  })
}

// ─── Clinics ─────────────────────────────────────────────────────────

export function useClinics() {
  return useQuery({
    queryKey: CLINICS_KEY,
    queryFn: async () => {
      const { data } = await api.get<ClinicResponse[]>("/clinics")
      return toClinicList(data)
    },
  })
}

export function useClinic(id: string) {
  return useQuery({
    queryKey: [...CLINICS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ClinicResponse>(`/clinics/${id}`)
      return toClinic(data)
    },
    enabled: !!id,
  })
}

export function useCreateClinic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (clinic: CreateClinicRequest) => {
      const { data } = await api.post<ClinicResponse>("/clinics", clinic)
      return toClinic(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLINICS_KEY }),
  })
}

export function useUpdateClinic(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (clinic: Partial<CreateClinicRequest>) => {
      const { data } = await api.put<ClinicResponse>(`/clinics/${id}`, clinic)
      return toClinic(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLINICS_KEY }),
  })
}

export function useDeleteClinic() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/clinics/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLINICS_KEY }),
  })
}

// ─── Clinic ↔ Pharmacy linking ───────────────────────────────────────

export function useClinicPharmacies(clinicId: string) {
  return useQuery({
    queryKey: [...CLINICS_KEY, clinicId, "pharmacies"],
    queryFn: async () => {
      const { data } = await api.get<ClinicPharmacyResponse[]>(
        `/clinics/${clinicId}/pharmacies`
      )
      return toClinicPharmacyList(data)
    },
    enabled: !!clinicId,
  })
}

export function useLinkPharmacyToClinic(clinicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: { pharmacyId: string }) => {
      const { data } = await api.post(`/clinics/${clinicId}/pharmacies`, body)
      return data
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICS_KEY, clinicId, "pharmacies"] }),
  })
}

export function useUnlinkPharmacyFromClinic(clinicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pharmacyId: string) => {
      await api.delete(`/clinics/${clinicId}/pharmacies/${pharmacyId}`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICS_KEY, clinicId, "pharmacies"] }),
  })
}

export function useSetPrimaryPharmacy(clinicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pharmacyId: string) => {
      await api.patch(`/clinics/${clinicId}/pharmacies/${pharmacyId}/primary`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICS_KEY, clinicId, "pharmacies"] }),
  })
}

// ─── Clinic ↔ Staff assignment ───────────────────────────────────────

export function useClinicStaff(clinicId: string) {
  return useQuery({
    queryKey: [...CLINICS_KEY, clinicId, "staff"],
    queryFn: async () => {
      const { data } = await api.get<ClinicStaffResponse[]>(
        `/clinics/${clinicId}/staff`
      )
      return toClinicStaffList(data)
    },
    enabled: !!clinicId,
  })
}

export function useAssignStaffToClinic(clinicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: AssignStaffRequest) => {
      const { data } = await api.post(`/clinics/${clinicId}/staff`, body)
      return data
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICS_KEY, clinicId, "staff"] }),
  })
}

export function useUnassignStaffFromClinic(clinicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/clinics/${clinicId}/staff/${userId}`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICS_KEY, clinicId, "staff"] }),
  })
}

export function useSetPrimaryClinic(clinicId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.patch(`/clinics/${clinicId}/staff/${userId}/primary`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...CLINICS_KEY, clinicId, "staff"] }),
  })
}

export function useMyClinics() {
  return useQuery({
    queryKey: [...CLINICS_KEY, "my-clinics"],
    queryFn: async () => {
      const { data } = await api.get<ClinicResponse[]>("/clinics/my-clinics")
      return toClinicList(data)
    },
  })
}

// ─── Pharmacies ──────────────────────────────────────────────────────

export function usePharmacies() {
  return useQuery({
    queryKey: PHARMACIES_KEY,
    queryFn: async () => {
      const { data } = await api.get<PharmacyResponse[]>("/pharmacies")
      return toPharmacyList(data)
    },
  })
}

export function usePharmacy(id: string) {
  return useQuery({
    queryKey: [...PHARMACIES_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<PharmacyResponse>(`/pharmacies/${id}`)
      return toPharmacy(data)
    },
    enabled: !!id,
  })
}

export function useCreatePharmacy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pharmacy: CreatePharmacyRequest) => {
      const { data } = await api.post<PharmacyResponse>("/pharmacies", pharmacy)
      return toPharmacy(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PHARMACIES_KEY }),
  })
}

export function useUpdatePharmacy(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (pharmacy: Partial<CreatePharmacyRequest>) => {
      const { data } = await api.put<PharmacyResponse>(`/pharmacies/${id}`, pharmacy)
      return toPharmacy(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PHARMACIES_KEY }),
  })
}

export function useDeletePharmacy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/pharmacies/${id}`)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: PHARMACIES_KEY }),
  })
}
