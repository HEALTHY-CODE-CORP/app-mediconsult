import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { CertificateResponse, OwnerType } from "@/types/certificate.model"
import { toCertificate, toCertificateList } from "@/adapters/certificate.adapter"

const CERTS_KEY = ["certificates"]

export function useCertificates() {
  return useQuery({
    queryKey: CERTS_KEY,
    queryFn: async () => {
      const { data } = await api.get<CertificateResponse[]>("/certificates")
      return toCertificateList(data)
    },
  })
}

export function useCertificate(id: string) {
  return useQuery({
    queryKey: [...CERTS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<CertificateResponse>(`/certificates/${id}`)
      return toCertificate(data)
    },
    enabled: !!id,
  })
}

export function useCertificatesByOwner(ownerType: OwnerType, ownerId: string) {
  return useQuery({
    queryKey: [...CERTS_KEY, "owner", ownerType, ownerId],
    queryFn: async () => {
      const { data } = await api.get<CertificateResponse[]>(
        `/certificates/owner/${ownerType}/${ownerId}`
      )
      return toCertificateList(data)
    },
    enabled: !!ownerId,
  })
}

export function useActiveCertificate(ownerType: OwnerType, ownerId: string) {
  return useQuery({
    queryKey: [...CERTS_KEY, "active", ownerType, ownerId],
    queryFn: async () => {
      const { data } = await api.get<CertificateResponse>(
        `/certificates/owner/${ownerType}/${ownerId}/active`
      )
      return toCertificate(data)
    },
    enabled: !!ownerId,
    retry: false,
  })
}

export function useUploadCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      file: File
      ownerType: OwnerType
      ownerId: string
      alias: string
      password: string
    }) => {
      const formData = new FormData()
      formData.append("file", params.file)
      formData.append("ownerType", params.ownerType)
      formData.append("ownerId", params.ownerId)
      formData.append("alias", params.alias)
      formData.append("password", params.password)

      const { data } = await api.post<CertificateResponse>("/certificates", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return toCertificate(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CERTS_KEY }),
  })
}

// === Doctor self-management ===

export function useMyCertificates() {
  return useQuery({
    queryKey: [...CERTS_KEY, "my"],
    queryFn: async () => {
      const { data } = await api.get<CertificateResponse[]>("/certificates/my")
      return toCertificateList(data)
    },
  })
}

export function useMyActiveCertificate() {
  return useQuery({
    queryKey: [...CERTS_KEY, "my", "active"],
    queryFn: async () => {
      const { data } = await api.get<CertificateResponse>("/certificates/my/active")
      return toCertificate(data)
    },
    retry: false,
  })
}

export function useUploadMyCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (params: {
      file: File
      alias: string
      password: string
    }) => {
      const formData = new FormData()
      formData.append("file", params.file)
      formData.append("alias", params.alias)
      formData.append("password", params.password)

      const { data } = await api.post<CertificateResponse>("/certificates/my", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      return toCertificate(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CERTS_KEY }),
  })
}

// === Admin management ===

export function useDeactivateCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch<CertificateResponse>(
        `/certificates/${id}/deactivate`
      )
      return toCertificate(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CERTS_KEY }),
  })
}

export function useDeleteCertificate() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/certificates/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CERTS_KEY }),
  })
}
