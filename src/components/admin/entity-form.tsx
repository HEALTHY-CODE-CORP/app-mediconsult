"use client"

import { useState } from "react"
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
import { toast } from "sonner"
import type { CreateClinicRequest, CreatePharmacyRequest } from "@/types/organization.model"
import type { Clinic, Pharmacy } from "@/adapters/organization.adapter"

type EntityType = "clinic" | "pharmacy"
type FormData = CreateClinicRequest | CreatePharmacyRequest

interface EntityFormProps {
  entity?: Clinic | Pharmacy
  entityType: EntityType
  mode: "create" | "edit"
  onSubmit: (data: FormData) => Promise<{ id: string }>
  isPending: boolean
  backUrl: string
}

const ENTITY_LABELS: Record<EntityType, { singular: string; article: string }> = {
  clinic: { singular: "Clínica", article: "la clínica" },
  pharmacy: { singular: "Farmacia", article: "la farmacia" },
}

export function EntityForm({
  entity,
  entityType,
  mode,
  onSubmit,
  isPending,
  backUrl,
}: EntityFormProps) {
  const router = useRouter()
  const labels = ENTITY_LABELS[entityType]
  const isClinic = entityType === "clinic"
  const clinicEntity = isClinic ? (entity as Clinic | undefined) : undefined

  const [formData, setFormData] = useState({
    name: entity?.name ?? "",
    address: entity?.address ?? "",
    phone: entity?.phone ?? "",
    email: entity?.email ?? "",
    consultationPrice: clinicEntity?.consultationPrice?.toString() ?? "0",
  })

  function updateField(key: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function toPayload(): FormData {
    const base = {
      name: formData.name,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
    }

    if (isClinic) {
      return {
        ...base,
        consultationPrice: formData.consultationPrice
          ? Number(formData.consultationPrice)
          : undefined,
      } satisfies CreateClinicRequest
    }

    return base satisfies CreatePharmacyRequest
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await onSubmit(toPayload())
      toast.success(
        mode === "create"
          ? `${labels.singular} creada exitosamente`
          : `${labels.singular} actualizada exitosamente`
      )
      if (mode === "create") {
        router.push(`${backUrl}/${result.id}`)
      } else {
        router.push(`${backUrl}/${entity!.id}`)
      }
    } catch {
      toast.error(
        mode === "create"
          ? `Error al crear ${labels.article}`
          : `Error al actualizar ${labels.article}`
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Datos principales de {labels.article}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="col-span-full space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder={`Nombre de ${labels.article}`}
              required
            />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Dirección completa"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="0999999999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
        </CardContent>
      </Card>

      {isClinic && (
        <Card>
          <CardHeader>
            <CardTitle>Configuración de consultas</CardTitle>
            <CardDescription>
              Precio que se cobra por cada consulta médica en esta clínica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-xs space-y-2">
              <Label htmlFor="consultationPrice">Precio de consulta (USD)</Label>
              <Input
                id="consultationPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.consultationPrice}
                onChange={(e) => updateField("consultationPrice", e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-muted-foreground">
                Este valor se usará para calcular las ganancias del médico por consulta
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
              ? `Crear ${labels.singular.toLowerCase()}`
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
