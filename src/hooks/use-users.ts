import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type { RegisterRequest, UserResponse } from "@/types/auth.model"
import { toUser, toUserList } from "@/adapters/user.adapter"

const USERS_KEY = ["users"]
const PROFILE_KEY = ["profile"]

// ─── Current user profile ────────────────────────────────────────────
export function useProfile() {
  return useQuery({
    queryKey: PROFILE_KEY,
    queryFn: async () => {
      const { data } = await api.get<UserResponse>("/auth/me")
      return toUser(data)
    },
  })
}

// ─── Change password ─────────────────────────────────────────────────
export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const { data: res } = await api.patch<{ message: string }>(
        "/auth/change-password",
        data
      )
      return res
    },
  })
}

// ─── List users (org admin — own org) ────────────────────────────────
export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: async () => {
      const { data } = await api.get<UserResponse[]>("/auth/users")
      return toUserList(data)
    },
  })
}

// ─── List users by organization (SUPER_ADMIN) ────────────────────────
export function useOrganizationUsers(organizationId: string | undefined) {
  return useQuery({
    queryKey: ["users", "organization", organizationId],
    queryFn: async () => {
      const { data } = await api.get<UserResponse[]>(
        `/auth/users/organization/${organizationId}`
      )
      return toUserList(data)
    },
    enabled: !!organizationId,
  })
}

// ─── Register (admin / super_admin) ──────────────────────────────────
export function useRegisterUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const { data: raw } = await api.post<UserResponse>("/auth/register", data)
      return toUser(raw)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      queryClient.invalidateQueries({ queryKey: ["users", "organization"] })
    },
  })
}

// ─── Toggle active (org admin — own org) ─────────────────────────────
export function useToggleUserActive() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.patch<UserResponse>(
        `/auth/users/${userId}/toggle-active`
      )
      return toUser(data)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: USERS_KEY }),
  })
}

// ─── Toggle active by organization (SUPER_ADMIN) ────────────────────
export function useToggleUserActiveByOrg() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      organizationId,
      userId,
    }: {
      organizationId: string
      userId: string
    }) => {
      const { data } = await api.patch<UserResponse>(
        `/auth/users/organization/${organizationId}/${userId}/toggle-active`
      )
      return toUser(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "organization"] })
    },
  })
}
