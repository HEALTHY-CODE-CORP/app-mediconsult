import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { AuthResponse } from "@/types/auth.model"
import { getBackendApiBaseUrl } from "@/lib/bff/session"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        organizationId: { label: "Organization ID", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const backendUrl = getBackendApiBaseUrl()

          // Build login body — omit organizationId for SUPER_ADMIN
          const body: Record<string, string> = {
            email: credentials.email as string,
            password: credentials.password as string,
          }
          if (credentials.organizationId) {
            body.organizationId = credentials.organizationId as string
          }

          const res = await fetch(`${backendUrl}/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })



          if (!res.ok) {
            return null
          }

          const data: AuthResponse = await res.json()

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
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.backendToken = user.backendToken
        token.organizationId = user.organizationId ?? null
        token.roles = user.roles
        token.firstName = user.firstName
        token.lastName = user.lastName
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.sub!
      session.user.organizationId = (token.organizationId as string) ?? null
      session.user.roles = token.roles as string[]
      session.user.firstName = token.firstName as string
      session.user.lastName = token.lastName as string
      session.backendToken = (token.backendToken as string) ?? null
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24h — match backend JWT expiration
  },
})
