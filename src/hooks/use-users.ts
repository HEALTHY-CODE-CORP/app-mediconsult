import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/axios"
import type {
  RegisterRequest,
  UpdateUserRequest,
  UpdateMyBillingProfileRequest,
  UserResponse,
} from "@/types/auth.model"
import { toUser, toUserList } from "@/adapters/user.adapter"

const USERS_KEY = ["users"]
const PROFILE_KEY = ["profile"]
const userKey = (userId: string | undefined) => ["users", userId]

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

// ─── Update my billing profile ─────────────────────────────────────
export function useUpdateMyBillingProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateMyBillingProfileRequest) => {
      const { data: raw } = await api.patch<UserResponse>(
        "/auth/me/billing-profile",
        data
      )
      return toUser(raw)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_KEY })
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
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

// ─── Get single user (org admin — own org) ──────────────────────────
export function useUser(userId: string | undefined) {
  return useQuery({
    queryKey: userKey(userId),
    queryFn: async () => {
      const { data } = await api.get<UserResponse>(`/auth/users/${userId}`)
      return toUser(data)
    },
    enabled: !!userId,
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

// ─── Update user (org admin — own org) ───────────────────────────────
export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: UpdateUserRequest) => {
      const { data: raw } = await api.put<UserResponse>(`/auth/users/${userId}`, data)
      return toUser(raw)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY })
      queryClient.invalidateQueries({ queryKey: userKey(userId) })
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

// ─── Resend credentials (org admin — own org) ──────────────────────
export function useResendCredentials() {
  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.post<{ message: string }>(
        `/auth/users/${userId}/resend-credentials`
      )
      return data
    },
  })
}

// ─── Resend credentials by organization (SUPER_ADMIN) ───────────────
export function useResendCredentialsByOrg() {
  return useMutation({
    mutationFn: async ({
      organizationId,
      userId,
    }: {
      organizationId: string
      userId: string
    }) => {
      const { data } = await api.post<{ message: string }>(
        `/auth/users/organization/${organizationId}/${userId}/resend-credentials`
      )
      return data
    },
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
