"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useOrganization,
  useDeleteOrganization,
  useDeactivateOrganization,
} from "@/hooks/use-organizations"
import {
  useOrganizationUsers,
  useToggleUserActiveByOrg,
} from "@/hooks/use-users"
import { ROLE_LABELS } from "@/adapters/user.adapter"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  Power,
  Building2,
  Store,
  Users,
  UserCheck,
  DollarSign,
  UserPlus,
} from "lucide-react"
import { toast } from "sonner"

interface OrganizationDetailPageProps {
  params: Promise<{ id: string }>
}

export default function OrganizationDetailPage({
  params,
}: OrganizationDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: org, isLoading } = useOrganization(id)
  const { data: users = [], isLoading: usersLoading } = useOrganizationUsers(id)
  const deleteMutation = useDeleteOrganization()
  const deactivateMutation = useDeactivateOrganization()
  const toggleMutation = useToggleUserActiveByOrg()

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar esta organización? Esta acción no se puede deshacer."))
      return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Organización eliminada")
      router.push("/dashboard/platform/organizations")
    } catch {
      toast.error("Error al eliminar la organización")
    }
  }

  async function handleDeactivate() {
    if (!confirm("¿Estás seguro de desactivar esta organización?")) return
    try {
      await deactivateMutation.mutateAsync(id)
      toast.success("Organización desactivada")
    } catch {
      toast.error("Error al desactivar la organización")
    }
  }

  async function handleToggleUser(userId: string) {
    try {
      await toggleMutation.mutateAsync({ organizationId: id, userId })
      toast.success("Estado del usuario actualizado")
    } catch {
      toast.error("Error al cambiar el estado del usuario")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Organización no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/platform/organizations" />}
        >
          Volver a organizaciones
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/platform/organizations" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{org.name}</h1>
              <Badge variant={org.isActive ? "default" : "secondary"}>
                {org.isActive ? "Activa" : "Inactiva"}
              </Badge>
              <Badge variant="outline">{org.planName}</Badge>
            </div>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              RUC: {org.ruc}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/dashboard/platform/organizations/${id}/create-admin`} />}
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Crear Admin
          </Button>
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/dashboard/platform/organizations/${id}/edit`} />}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Editar
          </Button>
          {org.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
            >
              <Power className="mr-1 h-4 w-4" />
              Desactivar
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<FileText className="h-4 w-4" />}
              label="RUC"
              value={org.ruc}
            />
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Dirección"
              value={org.address}
            />
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Teléfono"
              value={org.phone}
            />
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={org.email}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Plan" value={org.planName} />
            <InfoRow label="Ciclo de facturación" value={org.billingCycleLabel} />
            {org.plan && (
              <>
                <InfoRow
                  icon={<DollarSign className="h-4 w-4" />}
                  label="Precio"
                  value={
                    org.billingCycle === "ANNUAL"
                      ? `${org.plan.annualPriceFormatted}/año`
                      : `${org.plan.monthlyPriceFormatted}/mes`
                  }
                />
                <InfoRow
                  label="Fee por consulta"
                  value={org.plan.consultationFeeFormatted}
                />
              </>
            )}
            {org.planStartedAt && (
              <InfoRow
                label="Inicio del plan"
                value={new Date(org.planStartedAt).toLocaleDateString("es-EC", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            )}
            {org.planExpiresAt && (
              <InfoRow
                label="Expiración del plan"
                value={new Date(org.planExpiresAt).toLocaleDateString("es-EC", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              />
            )}
          </CardContent>
        </Card>

        {org.plan && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Límites del plan</CardTitle>
              <CardDescription>
                Recursos máximos permitidos por el plan {org.planName}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Clínicas</p>
                    <p className="text-lg font-semibold">{org.plan.maxClinics}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Farmacias</p>
                    <p className="text-lg font-semibold">{org.plan.maxPharmacies}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <UserCheck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Usuarios</p>
                    <p className="text-lg font-semibold">{org.plan.maxUsers}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-lg border p-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Pacientes</p>
                    <p className="text-lg font-semibold">{org.plan.maxPatients}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Users table ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Usuarios ({users.length})
            </CardTitle>
            <CardDescription>
              Usuarios registrados en esta organización
            </CardDescription>
          </div>
          <Button
            size="sm"
            render={<Link href={`/dashboard/platform/organizations/${id}/create-admin`} />}
          >
            <UserPlus className="mr-1 h-4 w-4" />
            Nuevo usuario
          </Button>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8">
              <p className="text-sm text-muted-foreground">
                No hay usuarios registrados
              </p>
              <Button
                variant="link"
                size="sm"
                className="mt-1"
                render={<Link href={`/dashboard/platform/organizations/${id}/create-admin`} />}
              >
                Crear el primer administrador
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.fullName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {ROLE_LABELS[role] ?? role}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleUser(user.id)}
                        disabled={toggleMutation.isPending}
                      >
                        <Power className="mr-1 h-4 w-4" />
                        {user.isActive ? "Desactivar" : "Activar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Información del sistema</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <InfoRow
            label="Creada"
            value={new Date(org.createdAt).toLocaleDateString("es-EC", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
          <InfoRow
            label="Última actualización"
            value={new Date(org.updatedAt).toLocaleDateString("es-EC", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string | null
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? "—"}</p>
      </div>
    </div>
  )
}
