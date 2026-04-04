"use client"

import { use, useMemo, useState, type ReactNode } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import {
  ArrowLeft,
  Calendar,
  Download,
  FileText,
  Package,
  PenLine,
  Pill,
  Printer,
  ShieldCheck,
  Stethoscope,
  Store,
  User,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
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
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ConfirmButton } from "@/components/shared/confirm-button"
import {
  PdfSignaturePlacementPicker,
  type SignaturePlacementState,
} from "@/components/clinical/pdf-signature-placement-picker"
import { PrescriptionItemsTable } from "@/components/prescriptions/prescription-items-table"
import { StockCheckTable } from "@/components/prescriptions/stock-check-table"
import {
  usePrescription,
  useCancelPrescription,
  useAssignPharmacy,
  useStockCheck,
  useSignPrescription,
} from "@/hooks/use-prescriptions"
import { usePharmacies } from "@/hooks/use-organizations"
import type { ApiError } from "@/types/api"
import type { SignPrescriptionRequest } from "@/types/prescription.model"

interface PrescriptionDetailPageProps {
  params: Promise<{ id: string }>
}

const DEFAULT_SIGNATURE_PLACEMENT: SignaturePlacementState = {
  pageNumber: 1,
  x: 120,
  y: 30,
  width: 210,
  height: 80,
}

export default function PrescriptionDetailPage({
  params,
}: PrescriptionDetailPageProps) {
  const { id } = use(params)
  const { data: session } = useSession()
  const userRoles = session?.user?.roles ?? []

  const isDoctor = userRoles.includes("DOCTOR") || userRoles.includes("ADMIN")
  const isPharmacist = userRoles.includes("PHARMACIST") || userRoles.includes("ADMIN")

  const { data: prescription, isLoading } = usePrescription(id)
  const { data: pharmacies = [] } = usePharmacies()
  const cancelMutation = useCancelPrescription()
  const assignPharmacyMutation = useAssignPharmacy(id)
  const signMutation = useSignPrescription(id)

  const [assignPharmacyId, setAssignPharmacyId] = useState("")
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false)
  const [useCustomPlacement, setUseCustomPlacement] = useState(false)
  const [signaturePlacement, setSignaturePlacement] = useState<SignaturePlacementState>(DEFAULT_SIGNATURE_PLACEMENT)

  const pharmacyItems = useMemo(
    () => Object.fromEntries(pharmacies.map((p) => [p.id, p.name])),
    [pharmacies]
  )

  // Stock check — only when pharmacy is assigned
  const stockCheck = useStockCheck(
    id,
    prescription?.pharmacyId ?? ""
  )

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync(id)
      toast.success("Receta cancelada")
    } catch {
      toast.error("Error al cancelar la receta")
    }
  }

  async function handleAssignPharmacy() {
    if (!assignPharmacyId) return
    try {
      await assignPharmacyMutation.mutateAsync(assignPharmacyId)
      toast.success("Farmacia asignada correctamente")
      setAssignPharmacyId("")
    } catch {
      toast.error("Error al asignar farmacia")
    }
  }

  function openSignDialog() {
    const rect = parseSignatureRect(prescription?.signatureRect)
    const page = prescription?.signaturePage
    if (rect && page && page > 0) {
      setUseCustomPlacement(true)
      setSignaturePlacement({
        pageNumber: page,
        x: Math.max(0, Math.round(rect.x)),
        y: Math.max(0, Math.round(rect.y)),
        width: Math.max(1, Math.round(rect.width)),
        height: Math.max(1, Math.round(rect.height)),
      })
    } else {
      setUseCustomPlacement(false)
      setSignaturePlacement(DEFAULT_SIGNATURE_PLACEMENT)
    }
    setIsSignDialogOpen(true)
  }

  async function handleSignPrescription() {
    const payload = buildSignPayload(useCustomPlacement, signaturePlacement)
    if (!payload) {
      toast.error("Configura una posición de firma válida")
      return
    }

    try {
      await signMutation.mutateAsync(payload)
      toast.success("Receta firmada digitalmente")
      setIsSignDialogOpen(false)
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "No se pudo firmar la receta")
    }
  }

  function handlePrintPrescription() {
    const pdfUrl = `/api/bff/v1/prescriptions/${id}/pdf`
    const pdfWindow = window.open(pdfUrl, "_blank", "noopener,noreferrer")
    if (!pdfWindow) {
      toast.error("No se pudo abrir el PDF. Verifica el bloqueo de ventanas emergentes.")
    }
  }

  async function handleDownloadPrescription() {
    try {
      const response = await fetch(
        `/api/bff/v1/prescriptions/${id}/pdf?download=true`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/pdf",
          },
        }
      )

      if (!response.ok) {
        let errorMessage = "No se pudo descargar la receta en PDF"
        try {
          const payload = (await response.json()) as ApiError
          if (payload?.message) errorMessage = payload.message
        } catch {
          // ignore non-json payloads
        }
        toast.error(errorMessage)
        return
      }

      const contentType = response.headers.get("content-type") ?? ""
      if (!contentType.toLowerCase().includes("application/pdf")) {
        toast.error("La respuesta no es un PDF válido")
        return
      }

      const blob = await response.blob()
      const disposition = response.headers.get("content-disposition")
      const fallbackName = `receta-${id}.pdf`
      const fileName = getFileNameFromDisposition(disposition) ?? fallbackName

      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = blobUrl
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(blobUrl)
    } catch {
      toast.error("No se pudo descargar la receta en PDF")
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
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Receta no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/prescriptions" />}
        >
          Volver a recetas
        </Button>
      </div>
    )
  }

  const isPending = prescription.status === "PENDING"
  const isPartial = prescription.status === "PARTIALLY_DISPENSED"
  const isCancelled = prescription.status === "CANCELLED"
  const isDispensed = prescription.status === "DISPENSED"
  const isSigned = Boolean(prescription.signedAt)
  const canCancel = (isPending || isPartial) && isDoctor
  const canAssignPharmacy = !prescription.pharmacyId && isDoctor && !isCancelled && !isDispensed
  const canSign = isDoctor && !isCancelled && !isSigned

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/prescriptions" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Receta {prescription.prescriptionNumber}
              </h1>
              <Badge className={prescription.statusColor}>
                {prescription.statusLabel}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {prescription.patientName} · {prescription.prescribedAtFormatted}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={handleDownloadPrescription}>
            <Download className="mr-1 h-4 w-4" />
            Descargar PDF
          </Button>
          <Button type="button" variant="outline" onClick={handlePrintPrescription}>
            <Printer className="mr-1 h-4 w-4" />
            Imprimir
          </Button>
          {canSign && (
            <Button
              type="button"
              onClick={openSignDialog}
              disabled={signMutation.isPending}
            >
              <PenLine className="mr-1 h-4 w-4" />
              Firmar digitalmente
            </Button>
          )}
          {canCancel && (
            <ConfirmButton
              variant="destructive"
              size="sm"
              title="Cancelar receta"
              description="Esta acción no se puede deshacer y la receta quedará cancelada."
              confirmLabel="Sí, cancelar receta"
              loadingLabel="Cancelando..."
              onConfirm={handleCancel}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Cancelar
            </ConfirmButton>
          )}
        </div>
      </div>

      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent className="sm:max-w-5xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Firmar receta</DialogTitle>
            <DialogDescription>
              Puedes usar la ubicación predeterminada o ajustar visualmente el área de firma.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="space-y-1">
                <p className="text-sm font-medium">Seleccionar ubicación visual</p>
                <p className="text-xs text-muted-foreground">
                  Si está desactivado, se usa la posición predeterminada.
                </p>
              </div>
              <Switch
                checked={useCustomPlacement}
                onCheckedChange={(checked) => setUseCustomPlacement(Boolean(checked))}
              />
            </div>

            {useCustomPlacement && (
              <PdfSignaturePlacementPicker
                pdfUrl={`/api/bff/v1/prescriptions/${id}/pdf`}
                documentLabel="receta"
                value={signaturePlacement}
                onChange={setSignaturePlacement}
                disabled={signMutation.isPending}
              />
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSignDialogOpen(false)}
              disabled={signMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSignPrescription}
              disabled={signMutation.isPending}
            >
              <PenLine className="mr-1 h-4 w-4" />
              {signMutation.isPending ? "Firmando..." : "Confirmar firma"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Info cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Paciente"
              value={`${prescription.patientName} (${prescription.patientIdNumber})`}
            />
            <InfoRow
              icon={<Stethoscope className="h-4 w-4" />}
              label="Doctor"
              value={prescription.doctorName}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Fecha de prescripción"
              value={prescription.prescribedAtFormatted}
            />
            {prescription.dispensedAt && (
              <InfoRow
                icon={<Pill className="h-4 w-4" />}
                label="Dispensado"
                value={`${prescription.dispensedAtFormatted} por ${prescription.dispensedByName}`}
              />
            )}
            {prescription.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="text-sm whitespace-pre-wrap">{prescription.notes}</p>
              </div>
            )}

            <div className="rounded-md border bg-muted/20 p-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                Firma electrónica
              </p>
              {isSigned ? (
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    Firmado por:{" "}
                    <span className="font-medium">
                      {prescription.signedByName ?? prescription.doctorName}
                    </span>
                  </p>
                  <p>
                    Fecha de firma:{" "}
                    <span className="font-medium">
                      {prescription.signedAtFormatted ?? "—"}
                    </span>
                  </p>
                  <p>
                    Certificado usado:{" "}
                    <span className="font-medium">
                      {prescription.signedCertificateAlias ?? "—"}
                    </span>
                  </p>
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">
                  Esta receta aún no está firmada digitalmente.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pharmacy info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Farmacia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescription.pharmacyId ? (
              <InfoRow
                icon={<Store className="h-4 w-4" />}
                label="Farmacia asignada"
                value={prescription.pharmacyName}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin farmacia asignada
              </p>
            )}

            {canAssignPharmacy && (
              <div className="space-y-2">
                <Label
                  htmlFor="prescription-assign-pharmacy-select"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Asignar farmacia
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={assignPharmacyId}
                    onValueChange={(v) => setAssignPharmacyId(v ?? "")}
                    items={pharmacyItems}
                  >
                    <SelectTrigger
                      id="prescription-assign-pharmacy-select"
                      className="flex-1"
                    >
                      <SelectValue placeholder="Seleccionar farmacia" />
                    </SelectTrigger>
                    <SelectContent>
                      {pharmacies.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleAssignPharmacy}
                    disabled={!assignPharmacyId || assignPharmacyMutation.isPending}
                  >
                    {assignPharmacyMutation.isPending ? "Asignando..." : "Asignar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prescription items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos recetados ({prescription.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PrescriptionItemsTable items={prescription.items} />
        </CardContent>
      </Card>

      {/* Stock check */}
      {prescription.pharmacyId && isPharmacist && (isPending || isPartial) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Verificación de stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StockCheckTable
              items={stockCheck.data ?? []}
              isLoading={stockCheck.isLoading}
            />
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
  icon?: ReactNode
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

function parseSignatureRect(signatureRect: string | null | undefined): {
  x: number
  y: number
  width: number
  height: number
} | null {
  if (!signatureRect) return null
  try {
    const parsed = JSON.parse(signatureRect) as Record<string, unknown>
    const x = Number(parsed.x)
    const y = Number(parsed.y)
    const width = Number(parsed.width)
    const height = Number(parsed.height)
    if (
      Number.isFinite(x) &&
      Number.isFinite(y) &&
      Number.isFinite(width) &&
      Number.isFinite(height)
    ) {
      return { x, y, width, height }
    }
    return null
  } catch {
    return null
  }
}

function getApiErrorMessage(error: unknown): string | null {
  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError
    if (typeof apiError.message === "string" && apiError.message.trim().length > 0) {
      return apiError.message
    }
  }
  return null
}

function getFileNameFromDisposition(disposition: string | null): string | null {
  if (!disposition) return null

  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i)
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim())
    } catch {
      return utf8Match[1].trim()
    }
  }

  const plainMatch = disposition.match(/filename=\"?([^\";]+)\"?/i)
  if (plainMatch?.[1]) {
    return plainMatch[1].trim()
  }

  return null
}

function buildSignPayload(
  useCustomPlacement: boolean,
  state: SignaturePlacementState
): SignPrescriptionRequest | null {
  if (!useCustomPlacement) {
    return {}
  }

  if (
    Number.isNaN(state.x) ||
    Number.isNaN(state.y) ||
    Number.isNaN(state.width) ||
    Number.isNaN(state.height) ||
    Number.isNaN(state.pageNumber) ||
    state.pageNumber < 1 ||
    state.x < 0 ||
    state.y < 0 ||
    state.width <= 0 ||
    state.height <= 0
  ) {
    return null
  }

  return {
    signaturePlacement: {
      pageMode: "INDEX",
      pageNumber: Math.round(state.pageNumber),
      x: roundValue(state.x),
      y: roundValue(state.y),
      width: roundValue(state.width),
      height: roundValue(state.height),
    },
  }
}

function roundValue(value: number): number {
  return Math.round(value)
}
