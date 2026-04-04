"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Stethoscope,
  LayoutDashboard,
  Users,
  ClipboardList,
  FileHeart,
  Pill,
  Package,
  ShoppingCart,
  Receipt,
  FileText,
  Building,
  Building2,
  Store,
  UserCog,
  ChevronUp,
  LogOut,
  CreditCard,
  Shield,
  Coins,
  Activity,
  User,
} from "lucide-react"
import { logoutAction } from "@/actions/auth.actions"
import type { Role } from "@/types/auth.model"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: Role[]
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const ALL_ORG_ROLES: Role[] = ["ADMIN", "DOCTOR", "NURSE", "PHARMACIST", "CASHIER"]
const CLINICAL_STAFF: Role[] = ["ADMIN", "DOCTOR", "NURSE"]
const PHARMACY_STAFF: Role[] = ["ADMIN", "PHARMACIST", "CASHIER"]

// ─── Navigation for org-scoped users ────────────────────────────────

const orgNavigation: NavGroup[] = [
  {
    label: "General",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ALL_ORG_ROLES,
      },
    ],
  },
  {
    label: "Clínica",
    items: [
      {
        title: "Pacientes",
        href: "/dashboard/patients",
        icon: Users,
        roles: ALL_ORG_ROLES,
      },
      {
        title: "Signos Vitales",
        href: "/dashboard/clinical/vital-signs",
        icon: Activity,
        roles: CLINICAL_STAFF,
      },
      {
        title: "Consultas",
        href: "/dashboard/clinical/consultations",
        icon: ClipboardList,
        roles: CLINICAL_STAFF,
      },
      {
        title: "Historias Clínicas",
        href: "/dashboard/clinical/records",
        icon: FileHeart,
        roles: CLINICAL_STAFF,
      },
      {
        title: "Recetas",
        href: "/dashboard/prescriptions",
        icon: Pill,
        roles: [...CLINICAL_STAFF, "PHARMACIST"],
      },
      {
        title: "Facturación Consultas",
        href: "/dashboard/clinical/billing",
        icon: Receipt,
        roles: CLINICAL_STAFF,
      },
      {
        title: "Plantillas certificados",
        href: "/dashboard/clinical/medical-certificate-templates",
        icon: FileText,
        roles: CLINICAL_STAFF,
      },
    ],
  },
  {
    label: "Farmacia",
    items: [
      {
        title: "Inventario",
        href: "/dashboard/pharmacy/inventory",
        icon: Package,
        roles: PHARMACY_STAFF,
      },
      {
        title: "Ventas",
        href: "/dashboard/pharmacy/sales",
        icon: ShoppingCart,
        roles: PHARMACY_STAFF,
      },
      {
        title: "Facturación",
        href: "/dashboard/pharmacy/billing",
        icon: Receipt,
        roles: PHARMACY_STAFF,
      },
    ],
  },
  {
    label: "Administración",
    items: [
      {
        title: "Usuarios",
        href: "/dashboard/admin/users",
        icon: UserCog,
        roles: ["ADMIN"],
      },
      {
        title: "Clínicas",
        href: "/dashboard/admin/clinics",
        icon: Building2,
        roles: ["ADMIN"],
      },
      {
        title: "Farmacias",
        href: "/dashboard/admin/pharmacies",
        icon: Store,
        roles: ["ADMIN"],
      },
    ],
  },
]

// ─── Navigation for SUPER_ADMIN (platform level) ────────────────────

const platformNavigation: NavGroup[] = [
  {
    label: "Plataforma",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Organizaciones",
        href: "/dashboard/platform/organizations",
        icon: Building,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Planes",
        href: "/dashboard/platform/plans",
        icon: CreditCard,
        roles: ["SUPER_ADMIN"],
      },
      {
        title: "Tarifas de Plataforma",
        href: "/dashboard/platform/platform-fees",
        icon: Coins,
        roles: ["SUPER_ADMIN"],
      },
    ],
  },
]

function hasAccess(userRoles: string[], requiredRoles: Role[]): boolean {
  return userRoles.some((role) => requiredRoles.includes(role as Role))
}

export function AppSidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const userRoles = session?.user?.roles ?? []
  const isSuperAdmin = userRoles.includes("SUPER_ADMIN")
  const isLoading = status === "loading"

  const navigation = isSuperAdmin ? platformNavigation : orgNavigation

  const initials = session?.user
    ? `${session.user.firstName?.[0] ?? ""}${session.user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?"

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            {isSuperAdmin ? (
              <Shield className="h-4 w-4 text-primary-foreground" />
            ) : (
              <Stethoscope className="h-4 w-4 text-primary-foreground" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight">MediConsult</span>
            {isSuperAdmin && (
              <span className="text-[10px] font-medium text-muted-foreground leading-none">
                Plataforma
              </span>
            )}
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {isLoading ? (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {Array.from({ length: 6 }).map((_, i) => (
                  <SidebarMenuItem key={i}>
                    <SidebarMenuButton disabled>
                      <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : (
          navigation.map((group) => {
            const visibleItems = group.items.filter((item) =>
              hasAccess(userRoles, item.roles)
            )
            if (visibleItems.length === 0) return null

            return (
              <SidebarGroup key={group.label}>
                <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleItems.map((item) => (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          isActive={pathname === item.href || pathname.startsWith(item.href + "/")}
                          tooltip={item.title}
                          render={<Link href={item.href} />}
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          })
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            {isLoading ? (
              <SidebarMenuButton size="lg" disabled>
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="flex flex-col gap-1">
                  <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-28 animate-pulse rounded bg-muted" />
                </div>
              </SidebarMenuButton>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <SidebarMenuButton size="lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col gap-0.5 leading-none">
                        <span className="text-sm font-medium">
                          {session?.user?.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {session?.user?.email}
                        </span>
                      </div>
                      <ChevronUp className="ml-auto h-4 w-4" />
                    </SidebarMenuButton>
                  }
                />
                <DropdownMenuContent
                  side="top"
                  className="w-(--anchor-width)"
                >
                  <DropdownMenuItem
                    render={<Link href="/dashboard/profile" />}
                    className="flex w-full items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Mi Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => logoutAction()}
                    className="flex w-full items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
