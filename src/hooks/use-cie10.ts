import { useQuery } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { Cie10CodeResponse } from "@/types/clinical.model"

export function useCie10Search(q: string) {
  return useQuery({
    queryKey: ["cie10", "search", q],
    queryFn: async () => {
      const { data } = await api.get<Cie10CodeResponse[]>("/cie10/search", { params: { q } })
      return data
    },
    enabled: q.trim().length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes - catalog doesn't change
  })
}
