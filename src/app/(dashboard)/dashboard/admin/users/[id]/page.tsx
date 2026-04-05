"use client"

import { useState } from "react"
import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmButton } from "@/components/shared/confirm-button"
import { useUser, useToggleUserActive, useUpdateUser } from "@/hooks/use-users"
import { ROLE_LABELS } from "@/adapters/user.adapter"
import type { Role } from "@/types/auth.model"
import { formatDateTimeEc } from "@/lib/date"
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  Shield,
  Calendar,
  Power,
  UserRound,
} from "lucide-react"
import { toast } from "sonner"

const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  DOCTOR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  NURSE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  PHARMACIST: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  CASHIER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const ASSIGNABLE_ROLES: Role[] = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "PHARMACIST",
  "CASHIER",
]

interface UserDetailPageProps {
  params: Promise<{ id: string }>
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = use(params)
  const { data: user, isLoading } = useUser(id)
  const toggleMutation = useToggleUserActive()
  const updateUserMutation = useUpdateUser(id)
  const [consultationPriceOverride, setConsultationPriceOverride] = useState<string | null>(null)

  const hasNonEditableRoles = user
    ? user.roles.some((role) => !ASSIGNABLE_ROLES.includes(role as Role))
    : false
  const isDoctor = user?.roles.includes("DOCTOR") ?? false
  const consultationPriceDraft =
    consultationPriceOverride ??
    (user?.consultationPrice != null ? user.consultationPrice.toString() : "")

  async function handleToggleActive() {
    if (!user) return
    const action = user.isActive ? "desactivado" : "activado"
    try {
      await toggleMutation.mutateAsync(user.id)
      toast.success(`Usuario ${action}`)
    } catch {
      toast.error("Error al actualizar estado del usuario")
    }
  }

  async function handleSaveConsultationPrice() {
    if (!user) return

    if (hasNonEditableRoles) {
      toast.error("No se puede actualizar desde aquí por roles no editables")
      return
    }

    const trimmedPrice = consultationPriceDraft.trim()
    if (trimmedPrice && !/^\d+(\.\d{1,2})?$/.test(trimmedPrice)) {
      toast.error("Precio inválido (usa hasta 2 decimales)")
      return
    }

    const assignableRoles = user.roles.filter((role) =>
      ASSIGNABLE_ROLES.includes(role as Role)
    )
    if (assignableRoles.length === 0) {
      toast.error("No hay roles editables para este usuario")
      return
    }

    try {
      await updateUserMutation.mutateAsync({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone ?? undefined,
        roles: assignableRoles,
        consultationPrice: trimmedPrice ? Number(trimmedPrice) : undefined,
      })
      setConsultationPriceOverride(null)
      toast.success("Precio de consulta actualizado")
    } catch {
      toast.error("Error al actualizar precio de consulta")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-44 w-full" />
          <Skeleton className="h-44 w-full" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Usuario no encontrado</p>
        <Button variant="link" className="mt-2" render={<Link href="/dashboard/admin/users" />}>
          Volver a usuarios
        </Button>
      </div>
    )
  }

  const updatedAtFormatted = formatDateTimeEc(user.updatedAt, user.updatedAt)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/admin/users" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{user.fullName}</h1>
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/dashboard/admin/users/${id}/edit`} />}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Editar
          </Button>
          <ConfirmButton
            variant="outline"
            size="sm"
            title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
            description={
              user.isActive
                ? "El usuario no podrá iniciar sesión hasta ser reactivado."
                : "El usuario podrá volver a iniciar sesión."
            }
            confirmLabel={user.isActive ? "Desactivar" : "Activar"}
            confirmVariant={user.isActive ? "destructive" : "default"}
            loadingLabel="Guardando..."
            onConfirm={handleToggleActive}
            disabled={toggleMutation.isPending}
          >
            <Power className="mr-1 h-4 w-4" />
            {user.isActive ? "Desactivar" : "Activar"}
          </ConfirmButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Información del usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nombre" value={user.firstName} />
            <InfoRow label="Apellido" value={user.lastName} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={user.email} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Teléfono" value={user.phone} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Acceso y trazabilidad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">Roles asignados</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {user.roles.map((role) => (
                  <span
                    key={role}
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? ""}`}
                  >
                    {ROLE_LABELS[role] ?? role}
                  </span>
                ))}
              </div>
            </div>

            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Creado"
              value={user.createdAtFormatted}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Última actualización"
              value={updatedAtFormatted}
            />
          </CardContent>
        </Card>
      </div>

      {isDoctor && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de consulta del médico</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm space-y-2">
              <Label htmlFor="user-detail-consultation-price">
                Precio de consulta (USD)
              </Label>
              <Input
                id="user-detail-consultation-price"
                type="number"
                step="0.01"
                min="0"
                inputMode="decimal"
                value={consultationPriceDraft}
                onChange={(e) => setConsultationPriceOverride(e.target.value)}
                placeholder="Ej: 25.00"
              />
              <p className="text-xs text-muted-foreground">
                Precio por defecto al facturar consultas emitidas por este médico.
              </p>
            </div>
            {hasNonEditableRoles && (
              <p className="text-xs text-amber-700">
                Este usuario tiene roles no editables; actualiza el precio desde la pantalla de edición.
              </p>
            )}
            <div className="flex justify-end">
              <Button
                onClick={handleSaveConsultationPrice}
                disabled={updateUserMutation.isPending || hasNonEditableRoles}
              >
                {updateUserMutation.isPending ? "Guardando..." : "Guardar precio"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
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
