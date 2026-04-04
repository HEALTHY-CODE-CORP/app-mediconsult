"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const isPharmacy = entityType === "pharmacy"
  const clinicEntity = isClinic ? (entity as Clinic | undefined) : undefined
  const pharmacyEntity = isPharmacy ? (entity as Pharmacy | undefined) : undefined
  const billingSource = isPharmacy ? pharmacyEntity : clinicEntity

  const [formData, setFormData] = useState({
    name: entity?.name ?? "",
    address: entity?.address ?? "",
    phone: entity?.phone ?? "",
    email: entity?.email ?? "",
    consultationPrice: clinicEntity?.consultationPrice?.toString() ?? "0",
    billingLegalName: billingSource?.billingLegalName ?? "",
    billingCommercialName: billingSource?.billingCommercialName ?? "",
    billingRuc: billingSource?.billingRuc ?? "",
    billingEstablishmentCode: billingSource?.billingEstablishmentCode ?? "",
    billingEmissionPointCode: billingSource?.billingEmissionPointCode ?? "",
    billingMatrixAddress: billingSource?.billingMatrixAddress ?? "",
    billingSpecialTaxpayerCode: billingSource?.billingSpecialTaxpayerCode ?? "",
    billingAccountingRequired: billingSource?.billingAccountingRequired ?? false,
    sriEnvironment:
      (isPharmacy ? pharmacyEntity?.sriEnvironment : clinicEntity?.sriEnvironment) ?? "1",
  })

  function updateField(
    key: Exclude<keyof typeof formData, "billingAccountingRequired">,
    value: string
  ) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function updateAccountingRequired(value: boolean) {
    setFormData((prev) => ({ ...prev, billingAccountingRequired: value }))
  }

  function updateSriEnvironment(value: "1" | "2") {
    setFormData((prev) => ({ ...prev, sriEnvironment: value }))
  }

  function toOptional(value: string): string | undefined {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }

  function toPayload(): FormData {
    const base = {
      name: formData.name.trim(),
      address: toOptional(formData.address),
      phone: toOptional(formData.phone),
      email: toOptional(formData.email),
    }

    if (isClinic) {
      return {
        ...base,
        billingLegalName: toOptional(formData.billingLegalName),
        billingCommercialName: toOptional(formData.billingCommercialName),
        billingRuc: toOptional(formData.billingRuc),
        billingEstablishmentCode: toOptional(formData.billingEstablishmentCode),
        billingEmissionPointCode: toOptional(formData.billingEmissionPointCode),
        billingMatrixAddress: toOptional(formData.billingMatrixAddress),
        billingSpecialTaxpayerCode: toOptional(formData.billingSpecialTaxpayerCode),
        billingAccountingRequired: formData.billingAccountingRequired,
        sriEnvironment: formData.sriEnvironment as "1" | "2",
        consultationPrice: formData.consultationPrice
          ? Number(formData.consultationPrice)
          : undefined,
      } satisfies CreateClinicRequest
    }

    return {
      ...base,
      billingLegalName: toOptional(formData.billingLegalName),
      billingCommercialName: toOptional(formData.billingCommercialName),
      billingRuc: toOptional(formData.billingRuc),
      billingEstablishmentCode: toOptional(formData.billingEstablishmentCode),
      billingEmissionPointCode: toOptional(formData.billingEmissionPointCode),
      billingMatrixAddress: toOptional(formData.billingMatrixAddress),
      billingSpecialTaxpayerCode: toOptional(formData.billingSpecialTaxpayerCode),
      billingAccountingRequired: formData.billingAccountingRequired,
      sriEnvironment: formData.sriEnvironment as "1" | "2",
    } satisfies CreatePharmacyRequest
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

      {(isPharmacy || isClinic) && (
        <Card>
          <CardHeader>
            <CardTitle>Facturación electrónica</CardTitle>
            <CardDescription>
              {isPharmacy
                ? "Perfil tributario requerido para emitir comprobantes SRI desde esta farmacia"
                : "Perfil tributario del consultorio para emitir facturas de consultas"}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {(isPharmacy || isClinic) && (
              <div className="space-y-2">
                <Label htmlFor="sriEnvironment">Ambiente SRI *</Label>
                <Select
                  value={formData.sriEnvironment}
                  onValueChange={(value) =>
                    updateSriEnvironment((value as "1" | "2") ?? "1")
                  }
                  items={{ "1": "Pruebas", "2": "Producción" }}
                >
                  <SelectTrigger id="sriEnvironment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Pruebas</SelectItem>
                    <SelectItem value="2">Producción</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Este ambiente se usará automáticamente al enviar facturas al SRI para este emisor.
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="billingLegalName">
                Razón social{isPharmacy ? " *" : ""}
              </Label>
              <Input
                id="billingLegalName"
                value={formData.billingLegalName}
                onChange={(e) => updateField("billingLegalName", e.target.value)}
                placeholder="OSWART JAVIER AYALA DAVILA"
                required={isPharmacy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingCommercialName">
                Nombre comercial{isPharmacy ? " *" : ""}
              </Label>
              <Input
                id="billingCommercialName"
                value={formData.billingCommercialName}
                onChange={(e) => updateField("billingCommercialName", e.target.value)}
                placeholder={isPharmacy ? "Farmacia Central" : "Consultorio San Rafael"}
                required={isPharmacy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingRuc">RUC{isPharmacy ? " *" : ""}</Label>
              <Input
                id="billingRuc"
                value={formData.billingRuc}
                onChange={(e) => updateField("billingRuc", e.target.value)}
                placeholder="1002090320001"
                inputMode="numeric"
                maxLength={13}
                pattern="[0-9]{13}"
                required={isPharmacy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingSpecialTaxpayerCode">Contribuyente especial</Label>
              <Input
                id="billingSpecialTaxpayerCode"
                value={formData.billingSpecialTaxpayerCode}
                onChange={(e) => updateField("billingSpecialTaxpayerCode", e.target.value)}
                placeholder="Opcional"
                maxLength={13}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingEstablishmentCode">
                Código establecimiento{isPharmacy ? " *" : ""}
              </Label>
              <Input
                id="billingEstablishmentCode"
                value={formData.billingEstablishmentCode}
                onChange={(e) => updateField("billingEstablishmentCode", e.target.value)}
                placeholder="001"
                inputMode="numeric"
                maxLength={3}
                pattern="[0-9]{3}"
                required={isPharmacy}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingEmissionPointCode">
                Punto de emisión{isPharmacy ? " *" : ""}
              </Label>
              <Input
                id="billingEmissionPointCode"
                value={formData.billingEmissionPointCode}
                onChange={(e) => updateField("billingEmissionPointCode", e.target.value)}
                placeholder="001"
                inputMode="numeric"
                maxLength={3}
                pattern="[0-9]{3}"
                required={isPharmacy}
              />
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="billingMatrixAddress">
                Dirección matriz{isPharmacy ? " *" : ""}
              </Label>
              <Input
                id="billingMatrixAddress"
                value={formData.billingMatrixAddress}
                onChange={(e) => updateField("billingMatrixAddress", e.target.value)}
                placeholder="Dirección tributaria de la matriz"
                required={isPharmacy}
              />
            </div>
            <div className="col-span-full rounded-lg border bg-muted/20 p-3">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium">Obligado a llevar contabilidad</p>
                  <p className="text-xs text-muted-foreground">
                    Este valor se enviará como obligadoContabilidad al emitir la factura.
                  </p>
                </div>
                <Switch
                  id="billing-accounting-required"
                  checked={formData.billingAccountingRequired}
                  onCheckedChange={updateAccountingRequired}
                />
              </div>
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
