import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  PlatformFeeResponse,
  PlatformFeeSummary,
  OrganizationFeeSummary,
} from "@/types/platform-fee.model"
import { toPlatformFee, toPlatformFeeList } from "@/adapters/platform-fee.adapter"

const FEES_KEY = ["platform-fees"]

// === SUPER_ADMIN queries ===

export function useAllPlatformFees() {
  return useQuery({
    queryKey: [...FEES_KEY, "all"],
    queryFn: async () => {
      const { data } = await api.get<PlatformFeeResponse[]>("/platform-fees")
      return toPlatformFeeList(data)
    },
  })
}

export function usePlatformFeeSummary() {
  return useQuery({
    queryKey: [...FEES_KEY, "summary"],
    queryFn: async () => {
      const { data } = await api.get<PlatformFeeSummary>("/platform-fees/summary")
      return data
    },
  })
}

export function usePlatformFeesByStatus(status: string) {
  return useQuery({
    queryKey: [...FEES_KEY, "status", status],
    queryFn: async () => {
      const { data } = await api.get<PlatformFeeResponse[]>(
        `/platform-fees/status/${status}`
      )
      return toPlatformFeeList(data)
    },
    enabled: !!status,
  })
}

export function usePlatformFeesByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...FEES_KEY, "date-range", startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<PlatformFeeResponse[]>(
        "/platform-fees/date-range",
        { params: { startDate, endDate } }
      )
      return toPlatformFeeList(data)
    },
    enabled: !!startDate && !!endDate,
  })
}

export function useOrganizationFeeSummary(organizationId: string) {
  return useQuery({
    queryKey: [...FEES_KEY, "org-summary", organizationId],
    queryFn: async () => {
      const { data } = await api.get<OrganizationFeeSummary>(
        `/platform-fees/organization/${organizationId}/summary`
      )
      return data
    },
    enabled: !!organizationId,
  })
}

export function useOrganizationFees(organizationId: string) {
  return useQuery({
    queryKey: [...FEES_KEY, "organization", organizationId],
    queryFn: async () => {
      const { data } = await api.get<PlatformFeeResponse[]>(
        `/platform-fees/organization/${organizationId}`
      )
      return toPlatformFeeList(data)
    },
    enabled: !!organizationId,
  })
}

// === Organization ADMIN queries ===

export function useMyPlatformFees() {
  return useQuery({
    queryKey: [...FEES_KEY, "my"],
    queryFn: async () => {
      const { data } = await api.get<PlatformFeeResponse[]>("/platform-fees/my")
      return toPlatformFeeList(data)
    },
  })
}

export function useMyPlatformFeeSummary() {
  return useQuery({
    queryKey: [...FEES_KEY, "my", "summary"],
    queryFn: async () => {
      const { data } = await api.get<OrganizationFeeSummary>(
        "/platform-fees/my/summary"
      )
      return data
    },
  })
}

export function useMyPlatformFeesByDateRange(startDate: string, endDate: string) {
  return useQuery({
    queryKey: [...FEES_KEY, "my", "date-range", startDate, endDate],
    queryFn: async () => {
      const { data } = await api.get<PlatformFeeResponse[]>(
        "/platform-fees/my/date-range",
        { params: { startDate, endDate } }
      )
      return toPlatformFeeList(data)
    },
    enabled: !!startDate && !!endDate,
  })
}

// === Mutations ===

export function useCollectFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (feeId: string) => {
      const { data } = await api.patch<PlatformFeeResponse>(
        `/platform-fees/${feeId}/collect`
      )
      return toPlatformFee(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FEES_KEY }),
  })
}

export function useWaiveFee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ feeId, notes }: { feeId: string; notes?: string }) => {
      const { data } = await api.patch<PlatformFeeResponse>(
        `/platform-fees/${feeId}/waive`,
        { notes }
      )
      return toPlatformFee(data)
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: FEES_KEY }),
  })
}
