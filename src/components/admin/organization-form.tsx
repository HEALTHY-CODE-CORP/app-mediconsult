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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import type {
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from "@/types/organization.model"
import type { Organization } from "@/adapters/organization.adapter"
import { useActivePlans } from "@/hooks/use-plans"

interface OrganizationFormProps {
  organization?: Organization
  mode: "create" | "edit"
  onSubmit: (
    data: CreateOrganizationRequest | UpdateOrganizationRequest
  ) => Promise<{ id: string }>
  isPending: boolean
}

export function OrganizationForm({
  organization,
  mode,
  onSubmit,
  isPending,
}: OrganizationFormProps) {
  const router = useRouter()
  const { data: plans = [] } = useActivePlans()

  const [formData, setFormData] = useState({
    name: organization?.name ?? "",
    ruc: organization?.ruc ?? "",
    address: organization?.address ?? "",
    phone: organization?.phone ?? "",
    email: organization?.email ?? "",
    logoUrl: organization?.logoUrl ?? "",
    planId: organization?.plan?.id ?? "",
    billingCycle: organization?.billingCycle ?? "MONTHLY",
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

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido"
    }
    if (mode === "create") {
      if (!formData.ruc.trim()) {
        newErrors.ruc = "El RUC es requerido"
      } else if (!/^\d{13}$/.test(formData.ruc)) {
        newErrors.ruc = "El RUC debe tener 13 dígitos"
      }
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function toPayload(): CreateOrganizationRequest | UpdateOrganizationRequest {
    if (mode === "create") {
      return {
        name: formData.name,
        ruc: formData.ruc,
        address: formData.address || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        logoUrl: formData.logoUrl || undefined,
        planId: formData.planId || undefined,
      } satisfies CreateOrganizationRequest
    }
    return {
      name: formData.name || undefined,
      address: formData.address || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      logoUrl: formData.logoUrl || undefined,
      planId: formData.planId || undefined,
      billingCycle: formData.billingCycle || undefined,
    } satisfies UpdateOrganizationRequest
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    try {
      const result = await onSubmit(toPayload())
      toast.success(
        mode === "create"
          ? "Organización creada exitosamente"
          : "Organización actualizada exitosamente"
      )
      if (mode === "create") {
        router.push(`/dashboard/platform/organizations/${result.id}`)
      } else {
        router.push(`/dashboard/platform/organizations/${organization!.id}`)
      }
    } catch {
      toast.error(
        mode === "create"
          ? "Error al crear la organización"
          : "Error al actualizar la organización"
      )
    }
  }

  const selectedPlan = plans.find((p) => p.id === formData.planId)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información general</CardTitle>
          <CardDescription>
            Datos principales de la organización
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="col-span-full space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Nombre de la organización"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="ruc">
              RUC {mode === "create" ? "*" : "(no editable)"}
            </Label>
            <Input
              id="ruc"
              value={formData.ruc}
              onChange={(e) => updateField("ruc", e.target.value)}
              placeholder="1790000000001"
              maxLength={13}
              disabled={mode === "edit"}
            />
            {errors.ruc && (
              <p className="text-xs text-destructive">{errors.ruc}</p>
            )}
            {mode === "create" && (
              <p className="text-xs text-muted-foreground">
                Registro Único de Contribuyentes (13 dígitos)
              </p>
            )}
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
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email}</p>
            )}
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="logoUrl">URL del logo</Label>
            <Input
              id="logoUrl"
              value={formData.logoUrl}
              onChange={(e) => updateField("logoUrl", e.target.value)}
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suscripción</CardTitle>
          <CardDescription>
            Plan y ciclo de facturación
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="organization-plan-select">Plan</Label>
            <Select
              value={formData.planId}
              onValueChange={(value) => updateField("planId", value ?? "")}
              items={Object.fromEntries(
                plans.map((p) => [p.id, `${p.name} — ${p.monthlyPriceFormatted}/mes`])
              )}
            >
              <SelectTrigger id="organization-plan-select">
                <SelectValue placeholder="Seleccionar plan" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} — {plan.monthlyPriceFormatted}/mes
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPlan && (
              <p className="text-xs text-muted-foreground">
                {selectedPlan.maxClinics} clínicas, {selectedPlan.maxPharmacies} farmacias,{" "}
                {selectedPlan.maxUsers} usuarios, fee: {selectedPlan.consultationFeeFormatted}/consulta
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="organization-billing-cycle">Ciclo de facturación</Label>
            <Select
              value={formData.billingCycle}
              onValueChange={(value) => updateField("billingCycle", value ?? "MONTHLY")}
              items={{ MONTHLY: "Mensual", ANNUAL: "Anual" }}
            >
              <SelectTrigger id="organization-billing-cycle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MONTHLY">Mensual</SelectItem>
                <SelectItem value="ANNUAL">Anual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
              ? "Crear organización"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
