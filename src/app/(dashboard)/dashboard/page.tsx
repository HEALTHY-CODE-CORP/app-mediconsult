import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { OrgDashboard } from "./org-dashboard"
import { PlatformDashboard } from "./platform-dashboard"

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  DOCTOR: "Doctor",
  NURSE: "Enfermera",
  PHARMACIST: "Farmacéutico",
  CASHIER: "Cajero",
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session) redirect("/login")

  const { user } = session
  const isSuperAdmin = user.roles.includes("SUPER_ADMIN")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido, {user.firstName}
        </h1>
        <p className="text-muted-foreground">
          {isSuperAdmin
            ? "Panel de administración de la plataforma"
            : "Panel de control de MediConsult"}
        </p>
        <div className="mt-2 flex gap-2">
          {user.roles.map((role) => (
            <Badge key={role} variant="secondary">
              {ROLE_LABELS[role] ?? role}
            </Badge>
          ))}
        </div>
      </div>

      {isSuperAdmin ? <PlatformDashboard /> : <OrgDashboard />}
    </div>
  )
}
