"use server"

import { signIn, signOut } from "@/lib/auth"
import { AuthError } from "next-auth"
import { isRedirectError } from "next/dist/client/components/redirect-error"

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
