import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  ClipboardList,
  Package,
  ShoppingCart,
  Building,
  CreditCard,
  Coins,
} from "lucide-react"

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

// ─── Organization Dashboard ─────────────────────────────────────────

function OrgDashboard() {
  const quickActions = [
    {
      title: "Pacientes",
      description: "Gestionar pacientes registrados",
      icon: Users,
      href: "/dashboard/patients",
    },
    {
      title: "Consultas",
      description: "Ver consultas médicas",
      icon: ClipboardList,
      href: "/dashboard/clinical/consultations",
    },
    {
      title: "Inventario",
      description: "Control de productos",
      icon: Package,
      href: "/dashboard/pharmacy/inventory",
    },
    {
      title: "Ventas",
      description: "Registro de ventas",
      icon: ShoppingCart,
      href: "/dashboard/pharmacy/sales",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {quickActions.map((action) => (
        <a key={action.href} href={action.href}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">
                {action.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{action.description}</CardDescription>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  )
}

// ─── Platform Dashboard (SUPER_ADMIN) ───────────────────────────────

function PlatformDashboard() {
  const platformActions = [
    {
      title: "Organizaciones",
      description: "Gestionar organizaciones registradas en la plataforma",
      icon: Building,
      href: "/dashboard/admin/organizations",
    },
    {
      title: "Planes",
      description: "Administrar planes de suscripción y precios",
      icon: CreditCard,
      href: "/dashboard/admin/plans",
    },
    {
      title: "Tarifas de Plataforma",
      description: "Ver y cobrar tarifas pendientes por consultas",
      icon: Coins,
      href: "/dashboard/admin/platform-fees",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {platformActions.map((action) => (
        <a key={action.href} href={action.href}>
          <Card className="transition-colors hover:bg-muted/50">
            <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <action.icon className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">
                {action.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{action.description}</CardDescription>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  )
}
