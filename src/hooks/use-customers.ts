import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  CustomerSearchResultResponse,
  CustomerResponse,
  CreateCustomerRequest,
} from "@/types/customer.model"
import {
  toCustomerSearchResultList,
  toCustomer,
} from "@/adapters/customer.adapter"

const CUSTOMERS_KEY = ["customers"]

export function useSearchCustomers(query: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, "search", query],
    queryFn: async () => {
      const { data } = await api.get<CustomerSearchResultResponse[]>(
        `/customers/search?q=${encodeURIComponent(query)}`
      )
      return toCustomerSearchResultList(data)
    },
    enabled: query.length >= 2,
  })
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<CustomerResponse>(`/customers/${id}`)
      return toCustomer(data)
    },
    enabled: !!id,
  })
}

export function useCreateCustomer() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (request: CreateCustomerRequest) => {
      const { data } = await api.post<CustomerResponse>("/customers", request)
      return toCustomer(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_KEY })
    },
  })
}
