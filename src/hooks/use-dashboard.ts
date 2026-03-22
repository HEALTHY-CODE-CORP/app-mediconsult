import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  DashboardStatsResponse,
  ConsultationEarningsResponse,
  SalesEarningsResponse,
  PlatformStatsResponse,
} from "@/types/dashboard.model"
import {
  toDashboardStats,
  toConsultationEarnings,
  toSalesEarnings,
  toPlatformStats,
} from "@/adapters/dashboard.adapter"

const DASHBOARD_KEY = ["dashboard"]

export function useDashboardStats() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "stats"],
    queryFn: async () => {
      const { data } = await api.get<DashboardStatsResponse>("/dashboard/stats")
      return toDashboardStats(data)
    },
  })
}

export function useConsultationEarnings() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "consultation-earnings"],
    queryFn: async () => {
      const { data } = await api.get<ConsultationEarningsResponse>(
        "/dashboard/consultation-earnings"
      )
      return toConsultationEarnings(data)
    },
  })
}

export function useSalesEarnings() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "sales-earnings"],
    queryFn: async () => {
      const { data } = await api.get<SalesEarningsResponse>(
        "/dashboard/sales-earnings"
      )
      return toSalesEarnings(data)
    },
  })
}

export function usePlatformStats() {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "platform-stats"],
    queryFn: async () => {
      const { data } = await api.get<PlatformStatsResponse>(
        "/dashboard/platform-stats"
      )
      return toPlatformStats(data)
    },
  })
}
