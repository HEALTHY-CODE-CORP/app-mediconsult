"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
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
import { ArrowLeft, Upload } from "lucide-react"
import { toast } from "sonner"
import { useUploadCertificate } from "@/hooks/use-certificates"
import { useUsers } from "@/hooks/use-users"
import { usePharmacies, useClinics } from "@/hooks/use-organizations"
import type { OwnerType } from "@/types/certificate.model"
import type { ApiError } from "@/types/api"

const MAX_P12_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_CERT_EXTENSIONS = [".p12", ".pfx"] as const

const OWNER_TYPE_LABELS: Record<OwnerType, string> = {
  USER: "Doctor",
  PHARMACY: "Farmacia",
  CLINIC: "Clínica",
}

function isOwnerType(value: string | null): value is OwnerType {
  return value === "USER" || value === "PHARMACY" || value === "CLINIC"
}

function validateP12File(file: File | null): string | null {
  if (!file) return "Selecciona un archivo P12"

  const lowerName = file.name.toLowerCase()
  const hasAllowedExtension = ALLOWED_CERT_EXTENSIONS.some((ext) =>
    lowerName.endsWith(ext)
  )
  if (!hasAllowedExtension) {
    return "Formato inválido. Usa un archivo .p12 o .pfx"
  }

  if (file.size > MAX_P12_FILE_SIZE_BYTES) {
    return "El archivo excede el tamaño máximo permitido (10 MB)"
  }

  return null
}

export default function UploadCertificatePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const uploadMutation = useUploadCertificate()
  const { data: users = [] } = useUsers()
  const { data: pharmacies = [] } = usePharmacies()
  const { data: clinics = [] } = useClinics()

  const ownerTypeParam = searchParams.get("ownerType")
  const preselectedOwnerType = isOwnerType(ownerTypeParam)
    ? ownerTypeParam
    : null
  const preselectedOwnerId = searchParams.get("ownerId") ?? ""
  const backHref = searchParams.get("back") ?? "/dashboard/admin/pharmacies"
  const isOwnerLocked = !!preselectedOwnerType && !!preselectedOwnerId

  const [ownerType, setOwnerType] = useState<OwnerType>(
    preselectedOwnerType ?? "USER"
  )
  const [ownerId, setOwnerId] = useState(preselectedOwnerId)
  const [alias, setAlias] = useState("")
  const [password, setPassword] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const doctors = users.filter((u) =>
    u.roles.includes("DOCTOR")
  )
  const ownerOptions =
    ownerType === "USER"
      ? doctors.map((u) => ({ id: u.id, label: `${u.fullName} (${u.email})` }))
      : ownerType === "PHARMACY"
        ? pharmacies.map((p) => ({ id: p.id, label: p.name }))
        : clinics.map((c) => ({ id: c.id, label: c.name }))
  const hasOwnerOptions = ownerOptions.length > 0
  const lockedOwnerLabel =
    ownerOptions.find((opt) => opt.id === ownerId)?.label ?? ownerId
  const noOptionsLabel =
    ownerType === "USER"
      ? "No hay doctores disponibles"
      : ownerType === "PHARMACY"
        ? "No hay farmacias disponibles"
        : "No hay clínicas disponibles"

  function getApiErrorMessage(error: unknown): string | null {
    if (error && typeof error === "object" && "message" in error) {
      const apiError = error as ApiError
      if (typeof apiError.message === "string" && apiError.message.trim().length > 0) {
        return apiError.message
      }
    }
    return null
  }

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!ownerId) {
      newErrors.ownerId = "Selecciona un propietario"
    } else if (!isOwnerLocked && !hasOwnerOptions) {
      newErrors.ownerId = noOptionsLabel
    }
    if (!alias.trim()) newErrors.alias = "El alias es requerido"
    if (!password) newErrors.password = "La contraseña del P12 es requerida"
    const fileError = validateP12File(file)
    if (fileError) newErrors.file = fileError
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleFileChange(nextFile: File | null) {
    const fileError = validateP12File(nextFile)
    setFile(fileError ? null : nextFile)
    setErrors((prev) => {
      const nextErrors = { ...prev }
      if (fileError) {
        nextErrors.file = fileError
      } else {
        delete nextErrors.file
      }
      return nextErrors
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !file) return

    try {
      const result = await uploadMutation.mutateAsync({
        file,
        ownerType,
        ownerId,
        alias,
        password,
      })
      toast.success("Certificado subido exitosamente")
      const detailHref = `/dashboard/admin/certificates/${result.id}`
      router.push(`${detailHref}?back=${encodeURIComponent(backHref)}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Error al subir el certificado.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={backHref} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subir certificado</h1>
          <p className="text-muted-foreground">
            Carga un certificado P12 para firma electrónica
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Propietario</CardTitle>
            <CardDescription>
              Selecciona quién usará este certificado para firmar
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {isOwnerLocked ? (
              <div className="sm:col-span-2 space-y-2">
                <Label>Propietario asignado</Label>
                <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="font-medium">{OWNER_TYPE_LABELS[ownerType]}:</span>{" "}
                  {lockedOwnerLabel}
                </div>
                <p className="text-xs text-muted-foreground">
                  Este certificado se guardará para este propietario.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="certificate-owner-type">Tipo de propietario</Label>
                  <Select
                    value={ownerType}
                    onValueChange={(v) => {
                      if (v) setOwnerType(v as OwnerType)
                      setOwnerId("")
                    }}
                    items={{ USER: "Doctor", PHARMACY: "Farmacia", CLINIC: "Clínica" }}
                  >
                    <SelectTrigger id="certificate-owner-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USER">Doctor</SelectItem>
                      <SelectItem value="PHARMACY">Farmacia</SelectItem>
                      <SelectItem value="CLINIC">Clínica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certificate-owner-id">
                    {ownerType === "USER"
                      ? "Doctor"
                      : ownerType === "PHARMACY"
                        ? "Farmacia"
                        : "Clínica"}{" "}
                    *
                  </Label>
                  <Select
                    value={ownerId}
                    onValueChange={(v) => setOwnerId(v ?? "")}
                    items={Object.fromEntries(
                      ownerOptions.map((opt) => [opt.id, opt.label])
                    )}
                  >
                    <SelectTrigger id="certificate-owner-id" disabled={!hasOwnerOptions}>
                      <SelectValue
                        placeholder={
                          hasOwnerOptions ? "Seleccionar..." : noOptionsLabel
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {hasOwnerOptions ? (
                        ownerOptions.map((opt) => (
                          <SelectItem key={opt.id} value={opt.id}>
                            {opt.label}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="__no-owner-options__" disabled>
                          {noOptionsLabel}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {!hasOwnerOptions && (
                    <p className="text-xs text-muted-foreground">
                      Crea o activa una entidad de este tipo para continuar.
                    </p>
                  )}
                </div>
              </>
            )}
            {errors.ownerId && (
              <p className="sm:col-span-2 text-xs text-destructive">{errors.ownerId}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificado P12</CardTitle>
            <CardDescription>
              Archivo .p12 y contraseña para extraer la información
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="alias">Alias *</Label>
              <Input
                id="alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Ej: Firma Dr. Pérez 2026"
              />
              {errors.alias && (
                <p className="text-xs text-destructive">{errors.alias}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña del P12 *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña del archivo P12"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="file">Archivo P12 *</Label>
              <Input
                id="file"
                type="file"
                accept=".p12,.pfx"
                onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              />
              {errors.file && (
                <p className="text-xs text-destructive">{errors.file}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formatos aceptados: .p12, .pfx (máx. 10 MB)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(backHref)}
            disabled={uploadMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={uploadMutation.isPending}>
            <Upload className="mr-2 h-4 w-4" />
            {uploadMutation.isPending ? "Subiendo..." : "Subir certificado"}
          </Button>
        </div>
      </form>
    </div>
  )
}
