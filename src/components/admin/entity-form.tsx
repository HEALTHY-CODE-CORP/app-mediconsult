"use client"

import { useEffect, useMemo, useState } from "react"
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
import { useDeleteClinicLogo, useUploadClinicLogo } from "@/hooks/use-organizations"
import { ImagePlus, Trash2 } from "lucide-react"

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

const MAX_CLINIC_LOGO_SIZE_BYTES = 2 * 1024 * 1024
const CLINIC_LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"]

function validateClinicLogo(file: File | null): string | null {
  if (!file) return null
  if (!CLINIC_LOGO_ACCEPTED_TYPES.includes(file.type)) {
    return "Formato no válido. Solo se aceptan PNG, JPG/JPEG o WEBP."
  }
  if (file.size > MAX_CLINIC_LOGO_SIZE_BYTES) {
    return "El logo no puede superar 2 MB."
  }
  return null
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
  const uploadLogoMutation = useUploadClinicLogo()
  const deleteLogoMutation = useDeleteClinicLogo()

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
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoError, setLogoError] = useState<string | null>(null)
  const [removeCurrentLogo, setRemoveCurrentLogo] = useState(false)

  const selectedLogoPreviewUrl = useMemo(
    () => (logoFile ? URL.createObjectURL(logoFile) : null),
    [logoFile]
  )

  useEffect(() => {
    return () => {
      if (selectedLogoPreviewUrl) {
        URL.revokeObjectURL(selectedLogoPreviewUrl)
      }
    }
  }, [selectedLogoPreviewUrl])

  const existingLogoUrl = clinicEntity?.hasLogo ? clinicEntity.logoUrl : null
  const logoPreviewUrl = selectedLogoPreviewUrl ?? (!removeCurrentLogo ? existingLogoUrl : null)

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

      if (isClinic) {
        const clinicId = result.id
        try {
          if (logoFile) {
            await uploadLogoMutation.mutateAsync({ clinicId, file: logoFile })
          } else if (removeCurrentLogo && clinicEntity?.hasLogo) {
            await deleteLogoMutation.mutateAsync(clinicId)
          }
        } catch {
          toast.error("La clínica se guardó, pero no se pudo actualizar el logo.")
        }
      }

      toast.success(
        mode === "create"
          ? `${labels.singular} creada exitosamente`
          : `${labels.singular} actualizada exitosamente`
      )
      if (mode === "create") {
        router.push(`${backUrl}/${result.id}`)
      } else {
        router.push(`${backUrl}/${result.id}`)
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

          {isClinic && (
            <div className="col-span-full space-y-3 rounded-xl border border-dashed p-4">
              <div className="space-y-1">
                <Label htmlFor="clinic-logo">Logo de la clínica (opcional)</Label>
                <p className="text-xs text-muted-foreground">
                  Formatos aceptados: PNG, JPG/JPEG, WEBP (máx. 2 MB).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Input
                  id="clinic-logo"
                  type="file"
                  accept={CLINIC_LOGO_ACCEPTED_TYPES.join(",")}
                  onChange={(e) => {
                    const nextFile = e.target.files?.[0] ?? null
                    const error = validateClinicLogo(nextFile)
                    if (error) {
                      setLogoFile(null)
                      setLogoError(error)
                      return
                    }
                    setLogoError(null)
                    setLogoFile(nextFile)
                    setRemoveCurrentLogo(false)
                  }}
                />

                {clinicEntity?.hasLogo && !logoFile && (
                  <Button
                    type="button"
                    variant={removeCurrentLogo ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => setRemoveCurrentLogo((prev) => !prev)}
                  >
                    <Trash2 className="mr-1 h-4 w-4" />
                    {removeCurrentLogo ? "Mantener logo" : "Quitar logo actual"}
                  </Button>
                )}
              </div>

              {logoError && <p className="text-xs text-destructive">{logoError}</p>}

              {logoPreviewUrl ? (
                <div className="inline-flex max-w-[240px] items-center justify-center rounded-lg border bg-muted/20 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoPreviewUrl}
                    alt="Vista previa del logo de la clínica"
                    className="max-h-24 w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
                  <ImagePlus className="h-4 w-4" />
                  Sin logo configurado
                </div>
              )}
            </div>
          )}
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
          disabled={isPending || uploadLogoMutation.isPending || deleteLogoMutation.isPending}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={
            isPending || uploadLogoMutation.isPending || deleteLogoMutation.isPending
          }
        >
          {isPending || uploadLogoMutation.isPending || deleteLogoMutation.isPending
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
