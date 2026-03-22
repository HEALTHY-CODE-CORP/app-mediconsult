import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    backendToken?: string
    organizationId?: string | null
    roles?: string[]
    firstName?: string
    lastName?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      organizationId: string | null
      roles: string[]
      firstName: string
      lastName: string
    }
    backendToken: string | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    backendToken?: string
    organizationId?: string | null
    roles?: string[]
    firstName?: string
    lastName?: string
  }
}
