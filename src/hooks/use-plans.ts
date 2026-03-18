import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  PlanResponse,
  CreatePlanRequest,
  UpdatePlanRequest,
} from "@/types/plan.model"
import { toPlan, toPlanList } from "@/adapters/plan.adapter"

const PLANS_KEY = ["plans"]

export function usePlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: async () => {
      const { data } = await api.get<PlanResponse[]>("/plans")
      return toPlanList(data)
    },
  })
}

export function useActivePlans() {
  return useQuery({
    queryKey: [...PLANS_KEY, "active"],
    queryFn: async () => {
      const { data } = await api.get<PlanResponse[]>("/plans/active")
      return toPlanList(data)
    },
  })
}

export function usePlan(id: string) {
  return useQuery({
    queryKey: [...PLANS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<PlanResponse>(`/plans/${id}`)
      return toPlan(data)
    },
    enabled: !!id,
  })
}

export function useCreatePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (plan: CreatePlanRequest) => {
      const { data } = await api.post<PlanResponse>("/plans", plan)
      return toPlan(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  })
}

export function useUpdatePlan(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (plan: UpdatePlanRequest) => {
      const { data } = await api.put<PlanResponse>(`/plans/${id}`, plan)
      return toPlan(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  })
}

export function useDeletePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/plans/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PLANS_KEY }),
  })
}
