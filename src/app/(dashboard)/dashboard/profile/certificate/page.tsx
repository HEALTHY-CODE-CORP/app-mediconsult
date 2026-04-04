"use client"

import { useState } from "react"
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
import { ConfirmButton } from "@/components/shared/confirm-button"
import {
  useMyCertificates,
  useUploadMyCertificate,
  useDeactivateCertificate,
} from "@/hooks/use-certificates"
import {
  FileKey,
  Shield,
  Calendar,
  Upload,
  XCircle,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"
import type { ApiError } from "@/types/api"

const MAX_P12_FILE_SIZE_BYTES = 10 * 1024 * 1024
const ALLOWED_CERT_EXTENSIONS = [".p12", ".pfx"] as const

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

export default function MyCertificatePage() {
  const { data: certificates = [], isLoading } = useMyCertificates()
  const uploadMutation = useUploadMyCertificate()
  const deactivateMutation = useDeactivateCertificate()

  const [alias, setAlias] = useState("")
  const [password, setPassword] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showUpload, setShowUpload] = useState(false)

  const activeCert = certificates.find((c) => c.isActive && !c.isExpired)
  const hasAnyCert = certificates.length > 0

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
      await uploadMutation.mutateAsync({ file, alias, password })
      toast.success("Certificado subido exitosamente")
      setAlias("")
      setPassword("")
      setFile(null)
      setShowUpload(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Error al subir el certificado.")
    }
  }

  async function handleDeactivate(id: string) {
    try {
      await deactivateMutation.mutateAsync(id)
      toast.success("Certificado desactivado")
    } catch {
      toast.error("Error al desactivar")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Certificado</h1>
          <p className="text-muted-foreground">
            Gestiona tu certificado P12 para firma electrónica de facturas
          </p>
        </div>
        {!showUpload && (
          <Button onClick={() => setShowUpload(true)}>
            <Upload className="mr-2 h-4 w-4" />
            {hasAnyCert ? "Reemplazar certificado" : "Subir certificado"}
          </Button>
        )}
      </div>

      {!activeCert && !showUpload && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <p className="text-sm text-amber-800 dark:text-amber-200">
              No tienes un certificado activo. Sube tu archivo P12 para poder firmar facturas electrónicas.
            </p>
          </CardContent>
        </Card>
      )}

      {showUpload && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subir certificado P12</CardTitle>
              <CardDescription>
                Carga tu archivo .p12 para firma electrónica. Si ya tienes un certificado activo,
                este lo reemplazará automáticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="alias">Alias *</Label>
                <Input
                  id="alias"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                  placeholder="Ej: Mi firma 2026"
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
              onClick={() => {
                setShowUpload(false)
                setErrors({})
              }}
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
      )}

      {activeCert && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileKey className="h-5 w-5" />
                  Certificado activo
                </CardTitle>
                <Badge>{activeCert.statusLabel}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="Alias" value={activeCert.alias} />
              <InfoRow label="Sujeto (CN)" value={activeCert.subjectCn} />
              <InfoRow label="Emisor (CN)" value={activeCert.issuerCn} />
              <InfoRow label="Número de serie" value={activeCert.serialNumber} />
              <InfoRow label="Archivo" value={`${activeCert.fileName} (${activeCert.fileSizeFormatted})`} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Vigencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="Válido desde"
                value={activeCert.validFrom ? new Date(activeCert.validFrom).toLocaleDateString("es-EC") : null}
              />
              <InfoRow
                label="Válido hasta"
                value={activeCert.validUntil ? new Date(activeCert.validUntil).toLocaleDateString("es-EC") : null}
              />
              <div>
                <p className="text-xs text-muted-foreground">Estado de firma</p>
                <div className="mt-1 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    Listo para firmar documentos
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <ConfirmButton
                  variant="outline"
                  size="sm"
                  title="Desactivar certificado"
                  description="El certificado dejará de usarse para firmar documentos."
                  confirmLabel="Desactivar"
                  loadingLabel="Desactivando..."
                  onConfirm={() => handleDeactivate(activeCert.id)}
                  disabled={deactivateMutation.isPending}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Desactivar
                </ConfirmButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {certificates.filter((c) => !c.isActive || c.isExpired).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certificates
                .filter((c) => !c.isActive || c.isExpired)
                .map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">{cert.alias}</p>
                      <p className="text-xs text-muted-foreground">
                        {cert.subjectCn ?? cert.fileName} &middot;{" "}
                        {cert.validUntil
                          ? `Expira: ${new Date(cert.validUntil).toLocaleDateString("es-EC")}`
                          : "Sin fecha"}
                      </p>
                    </div>
                    <Badge variant={cert.isExpired ? "destructive" : "secondary"}>
                      {cert.statusLabel}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "---"}</p>
    </div>
  )
}
