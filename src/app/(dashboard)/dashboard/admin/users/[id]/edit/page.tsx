"use client"

import { useState, useMemo } from "react"
import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useUser, useUpdateUser } from "@/hooks/use-users"
import { ROLE_LABELS } from "@/adapters/user.adapter"
import type { Role } from "@/types/auth.model"
import { ArrowLeft, X } from "lucide-react"
import { toast } from "sonner"

const ASSIGNABLE_ROLES: Role[] = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "PHARMACIST",
  "CASHIER",
]

interface EditUserPageProps {
  params: Promise<{ id: string }>
}

type FormOverrides = {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  consultationPrice?: string
}

export default function EditUserPage({ params }: EditUserPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: user, isLoading } = useUser(id)
  const mutation = useUpdateUser(id)

  const [formOverrides, setFormOverrides] = useState<FormOverrides>({})
  const [selectedRolesOverride, setSelectedRolesOverride] = useState<Role[] | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const selectedRoles = useMemo(() => {
    if (selectedRolesOverride) return selectedRolesOverride
    if (!user) return []
    return user.roles.filter((role): role is Role =>
      ASSIGNABLE_ROLES.includes(role as Role)
    )
  }, [selectedRolesOverride, user])

  const hasNonEditableRoles = useMemo(() => {
    if (!user) return false
    return user.roles.some((role) => !ASSIGNABLE_ROLES.includes(role as Role))
  }, [user])
  const canConfigureDoctorPrice = selectedRoles.includes("DOCTOR")

  const formData = {
    firstName: formOverrides.firstName ?? user?.firstName ?? "",
    lastName: formOverrides.lastName ?? user?.lastName ?? "",
    email: formOverrides.email ?? user?.email ?? "",
    phone: formOverrides.phone ?? user?.phone ?? "",
    consultationPrice:
      formOverrides.consultationPrice ??
      (user?.consultationPrice != null ? user.consultationPrice.toString() : ""),
  }

  function updateField(key: keyof FormOverrides, value: string) {
    setFormOverrides((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
    }
  }

  function toggleRole(role: Role) {
    setSelectedRolesOverride((prev) => {
      const current = prev ?? selectedRoles
      return current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role]
    })
    if (errors.roles) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.roles
        return next
      })
    }
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!formData.firstName.trim()) newErrors.firstName = "El nombre es requerido"
    if (!formData.lastName.trim()) newErrors.lastName = "El apellido es requerido"
    if (!formData.email.trim()) {
      newErrors.email = "El correo es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = "Correo electrónico inválido"
    }
    if (selectedRoles.length === 0) {
      newErrors.roles = "Selecciona al menos un rol"
    }
    if (
      formData.consultationPrice.trim() &&
      !/^\d+(\.\d{1,2})?$/.test(formData.consultationPrice.trim())
    ) {
      newErrors.consultationPrice = "Precio inválido (usa hasta 2 decimales)"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || hasNonEditableRoles || !validate()) return

    try {
      await mutation.mutateAsync({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        consultationPrice: canConfigureDoctorPrice && formData.consultationPrice.trim()
          ? Number(formData.consultationPrice.trim())
          : undefined,
        roles: selectedRoles,
      })
      toast.success("Usuario actualizado")
      router.push(`/dashboard/admin/users/${id}`)
    } catch {
      toast.error("Error al actualizar el usuario")
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
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

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/dashboard/admin/users/${id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar usuario</h1>
          <p className="text-muted-foreground">{user.fullName}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>
              Actualiza los datos principales del usuario
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-user-first-name">Nombre *</Label>
              <Input
                id="edit-user-first-name"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Nombre"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-user-last-name">Apellido *</Label>
              <Input
                id="edit-user-last-name"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Apellido"
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="edit-user-email">Correo electrónico *</Label>
              <Input
                id="edit-user-email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="edit-user-phone">Teléfono</Label>
              <Input
                id="edit-user-phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="0999999999"
              />
            </div>
            {canConfigureDoctorPrice && (
              <div className="col-span-full space-y-2">
                <Label htmlFor="edit-user-consultation-price">
                  Precio de consulta del médico
                </Label>
                <Input
                  id="edit-user-consultation-price"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={formData.consultationPrice}
                  onChange={(e) => updateField("consultationPrice", e.target.value)}
                  placeholder="Ej: 25.00"
                />
                {errors.consultationPrice && (
                  <p className="text-xs text-destructive">{errors.consultationPrice}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Precio por defecto para facturas de consulta emitidas por este médico.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles del sistema</CardTitle>
            <CardDescription>
              Define los permisos que tendrá este usuario en la organización.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasNonEditableRoles && (
              <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                Este usuario tiene roles no editables desde esta sección.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {ASSIGNABLE_ROLES.map((role) => {
                const isSelected = selectedRoles.includes(role)
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => toggleRole(role)}
                    disabled={hasNonEditableRoles}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-foreground hover:bg-muted"
                    } ${hasNonEditableRoles ? "cursor-not-allowed opacity-60" : ""}`}
                  >
                    {ROLE_LABELS[role]}
                    {isSelected && <X className="h-3 w-3" />}
                  </button>
                )
              })}
            </div>

            {errors.roles && <p className="text-xs text-destructive">{errors.roles}</p>}

            {selectedRoles.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Roles seleccionados:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedRoles.map((role) => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {ROLE_LABELS[role]}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.back()}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={mutation.isPending || hasNonEditableRoles}
          >
            {mutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
