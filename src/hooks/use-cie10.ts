import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Cie10CodeResponse } from "@/types/clinical.model"

export function useCie10Search(q?: string) {
  const normalizedQuery = q?.trim() ?? ""
  return useQuery({
    queryKey: ["cie10", "search", normalizedQuery],
    queryFn: async () => {
      const { data } = await api.get<Cie10CodeResponse[]>("/cie10/search", { params: { q: normalizedQuery } })
      return data
    },
    enabled: normalizedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes - catalog doesn't change
  })
}
