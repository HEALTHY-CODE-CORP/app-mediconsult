"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"
import { getBackendApiBaseUrl } from "@/lib/bff/session"

export async function getActiveOrganizations(): Promise<
  { id: string; name: string }[]
> {
  try {
    const backendUrl = getBackendApiBaseUrl()
    const res = await fetch(`${backendUrl}/v1/organizations/active-list`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) return []
    return res.json()
  } catch {
    return []
  }
}

export async function loginAction(data: {
  organizationId?: string
  email: string
  password: string
}) {
  try {
    await signIn("credentials", {
      organizationId: data.organizationId || "",
      email: data.email,
      password: data.password,
      redirectTo: "/dashboard",
    })
  } catch (error) {
    if (isRedirectError(error)) throw error
    if (error instanceof AuthError) {
      return { error: "Credenciales inválidas. Verifica tus datos e intenta de nuevo." }
    }
    return { error: "Ocurrió un error inesperado. Intenta de nuevo." }
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" })
}
