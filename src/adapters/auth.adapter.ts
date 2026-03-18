import type { AuthResponse } from "@/types/auth.model"

export function extractUserFromAuth(data: AuthResponse) {
  return {
    id: data.user.id,
    email: data.user.email,
    name: data.user.fullName,
    backendToken: data.token,
    organizationId: data.user.organizationId,
    roles: data.user.roles,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
  }
}
