"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useRegisterUser } from "@/hooks/use-users"
import { useOrganization } from "@/hooks/use-organizations"
import { ArrowLeft } from "lucide-react"

interface Props {
  params: Promise<{ id: string }>
}

export default function CreateOrgAdminPage({ params }: Props) {
  const { id: organizationId } = use(params)
  const router = useRouter()
  const { data: org, isLoading: orgLoading } = useOrganization(organizationId)
  const mutation = useRegisterUser()

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  function updateField(key: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key]
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
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    try {
      await mutation.mutateAsync({
        organizationId,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone || undefined,
        roles: ["ADMIN"],
      })
      toast.success("Administrador creado. Se envió un correo con las credenciales.")
      router.push(`/dashboard/platform/organizations/${organizationId}`)
    } catch {
      toast.error("Error al crear el administrador")
    }
  }

  if (orgLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-64" />
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/dashboard/platform/organizations/${organizationId}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Crear administrador
          </h1>
          <p className="text-muted-foreground">
            Usuario administrador para <span className="font-medium text-foreground">{org.name}</span>
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>
              Datos del administrador de la organización
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
                placeholder="Nombre"
              />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido *</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
                placeholder="Apellido"
              />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName}</p>
              )}
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="email">Correo electrónico *</Label>
              <Input
                id="email"
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
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="0999999999"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Creando..." : "Crear administrador"}
          </Button>
        </div>
      </form>
    </div>
  )
}
