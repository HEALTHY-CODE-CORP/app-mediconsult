"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import type { CreatePlanRequest, UpdatePlanRequest } from "@/types/plan.model"
import type { Plan } from "@/adapters/plan.adapter"

interface PlanFormProps {
  plan?: Plan
  mode: "create" | "edit"
  onSubmit: (data: CreatePlanRequest | UpdatePlanRequest) => Promise<{ id: string }>
  isPending: boolean
}

export function PlanForm({ plan, mode, onSubmit, isPending }: PlanFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: plan?.name ?? "",
    code: plan?.code ?? "",
    description: plan?.description ?? "",
    monthlyPrice: plan?.monthlyPrice?.toString() ?? "",
    annualPrice: plan?.annualPrice?.toString() ?? "",
    consultationFee: plan?.consultationFee?.toString() ?? "",
    maxClinics: plan?.maxClinics?.toString() ?? "",
    maxPharmacies: plan?.maxPharmacies?.toString() ?? "",
    maxUsers: plan?.maxUsers?.toString() ?? "",
    maxPatients: plan?.maxPatients?.toString() ?? "",
    sortOrder: plan?.sortOrder?.toString() ?? "0",
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

    if (!formData.name.trim()) newErrors.name = "El nombre es requerido"
    if (mode === "create") {
      if (!formData.code.trim()) {
        newErrors.code = "El código es requerido"
      } else if (!/^[A-Z_]+$/.test(formData.code)) {
        newErrors.code = "Solo mayúsculas y guiones bajos (ej: BASIC, PRO_PLUS)"
      }
    }
    if (!formData.monthlyPrice || Number(formData.monthlyPrice) < 0) {
      newErrors.monthlyPrice = "Precio mensual inválido"
    }
    if (!formData.annualPrice || Number(formData.annualPrice) < 0) {
      newErrors.annualPrice = "Precio anual inválido"
    }
    if (formData.consultationFee === "" || Number(formData.consultationFee) < 0) {
      newErrors.consultationFee = "Fee de consulta inválido"
    }
    if (!formData.maxClinics || Number(formData.maxClinics) < 1) {
      newErrors.maxClinics = "Mínimo 1"
    }
    if (!formData.maxPharmacies || Number(formData.maxPharmacies) < 1) {
      newErrors.maxPharmacies = "Mínimo 1"
    }
    if (!formData.maxUsers || Number(formData.maxUsers) < 1) {
      newErrors.maxUsers = "Mínimo 1"
    }
    if (!formData.maxPatients || Number(formData.maxPatients) < 1) {
      newErrors.maxPatients = "Mínimo 1"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function toPayload(): CreatePlanRequest | UpdatePlanRequest {
    if (mode === "create") {
      return {
        name: formData.name,
        code: formData.code,
        description: formData.description || undefined,
        monthlyPrice: Number(formData.monthlyPrice),
        annualPrice: Number(formData.annualPrice),
        consultationFee: Number(formData.consultationFee),
        maxClinics: Number(formData.maxClinics),
        maxPharmacies: Number(formData.maxPharmacies),
        maxUsers: Number(formData.maxUsers),
        maxPatients: Number(formData.maxPatients),
        sortOrder: Number(formData.sortOrder) || 0,
      } satisfies CreatePlanRequest
    }
    return {
      name: formData.name || undefined,
      description: formData.description || undefined,
      monthlyPrice: formData.monthlyPrice ? Number(formData.monthlyPrice) : undefined,
      annualPrice: formData.annualPrice ? Number(formData.annualPrice) : undefined,
      consultationFee: formData.consultationFee !== "" ? Number(formData.consultationFee) : undefined,
      maxClinics: formData.maxClinics ? Number(formData.maxClinics) : undefined,
      maxPharmacies: formData.maxPharmacies ? Number(formData.maxPharmacies) : undefined,
      maxUsers: formData.maxUsers ? Number(formData.maxUsers) : undefined,
      maxPatients: formData.maxPatients ? Number(formData.maxPatients) : undefined,
      sortOrder: formData.sortOrder ? Number(formData.sortOrder) : undefined,
    } satisfies UpdatePlanRequest
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    try {
      const result = await onSubmit(toPayload())
      toast.success(
        mode === "create"
          ? "Plan creado exitosamente"
          : "Plan actualizado exitosamente"
      )
      if (mode === "create") {
        router.push(`/dashboard/platform/plans/${result.id}`)
      } else {
        router.push(`/dashboard/platform/plans/${plan!.id}`)
      }
    } catch {
      toast.error(
        mode === "create"
          ? "Error al crear el plan"
          : "Error al actualizar el plan"
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informaci&oacute;n del plan</CardTitle>
          <CardDescription>
            Nombre, c&oacute;digo y descripci&oacute;n del plan
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Plan Básico"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">
              C&oacute;digo {mode === "create" ? "*" : "(no editable)"}
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => updateField("code", e.target.value.toUpperCase())}
              placeholder="BASIC"
              disabled={mode === "edit"}
            />
            {errors.code && (
              <p className="text-xs text-destructive">{errors.code}</p>
            )}
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="description">Descripci&oacute;n</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Descripción del plan..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sortOrder">Orden de visualizaci&oacute;n</Label>
            <Input
              id="sortOrder"
              type="number"
              value={formData.sortOrder}
              onChange={(e) => updateField("sortOrder", e.target.value)}
              placeholder="0"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precios</CardTitle>
          <CardDescription>
            Configuraci&oacute;n de precios y tarifas
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="monthlyPrice">Precio mensual (USD) *</Label>
            <Input
              id="monthlyPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.monthlyPrice}
              onChange={(e) => updateField("monthlyPrice", e.target.value)}
              placeholder="29.99"
            />
            {errors.monthlyPrice && (
              <p className="text-xs text-destructive">{errors.monthlyPrice}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualPrice">Precio anual (USD) *</Label>
            <Input
              id="annualPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.annualPrice}
              onChange={(e) => updateField("annualPrice", e.target.value)}
              placeholder="299.90"
            />
            {errors.annualPrice && (
              <p className="text-xs text-destructive">{errors.annualPrice}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="consultationFee">Fee por consulta (USD) *</Label>
            <Input
              id="consultationFee"
              type="number"
              step="0.01"
              min="0"
              value={formData.consultationFee}
              onChange={(e) => updateField("consultationFee", e.target.value)}
              placeholder="0.50"
            />
            {errors.consultationFee && (
              <p className="text-xs text-destructive">{errors.consultationFee}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>L&iacute;mites</CardTitle>
          <CardDescription>
            L&iacute;mites de recursos por organizaci&oacute;n
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label htmlFor="maxClinics">M&aacute;x. cl&iacute;nicas *</Label>
            <Input
              id="maxClinics"
              type="number"
              min="1"
              value={formData.maxClinics}
              onChange={(e) => updateField("maxClinics", e.target.value)}
              placeholder="1"
            />
            {errors.maxClinics && (
              <p className="text-xs text-destructive">{errors.maxClinics}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPharmacies">M&aacute;x. farmacias *</Label>
            <Input
              id="maxPharmacies"
              type="number"
              min="1"
              value={formData.maxPharmacies}
              onChange={(e) => updateField("maxPharmacies", e.target.value)}
              placeholder="1"
            />
            {errors.maxPharmacies && (
              <p className="text-xs text-destructive">{errors.maxPharmacies}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxUsers">M&aacute;x. usuarios *</Label>
            <Input
              id="maxUsers"
              type="number"
              min="1"
              value={formData.maxUsers}
              onChange={(e) => updateField("maxUsers", e.target.value)}
              placeholder="5"
            />
            {errors.maxUsers && (
              <p className="text-xs text-destructive">{errors.maxUsers}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPatients">M&aacute;x. pacientes *</Label>
            <Input
              id="maxPatients"
              type="number"
              min="1"
              value={formData.maxPatients}
              onChange={(e) => updateField("maxPatients", e.target.value)}
              placeholder="100"
            />
            {errors.maxPatients && (
              <p className="text-xs text-destructive">{errors.maxPatients}</p>
            )}
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
              ? "Crear plan"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
