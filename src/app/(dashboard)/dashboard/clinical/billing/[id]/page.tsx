"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmButton } from "@/components/shared/confirm-button"
import {
  useInvoice,
  useSriInvoiceRequest,
  useCancelInvoice,
  useSriSubmit,
  useSriAuthorize,
} from "@/hooks/use-billing"
import {
  ArrowLeft,
  FileText,
  User,
  DollarSign,
  Shield,
  Send,
  XCircle,
  Copy,
  CheckCircle,
  Stethoscope,
} from "lucide-react"
import { toast } from "sonner"
import type { ApiError } from "@/types/api"

interface ConsultationInvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ConsultationInvoiceDetailPage({
  params,
}: ConsultationInvoiceDetailPageProps) {
  const { id } = use(params)
  const { data: invoice, isLoading } = useInvoice(id)
  const { data: sriRequest } = useSriInvoiceRequest(
    invoice?.status === "PENDING" || invoice?.status === "DRAFT" ? id : ""
  )
  const sriSubmitMutation = useSriSubmit()
  const sriAuthorizeMutation = useSriAuthorize()
  const cancelMutation = useCancelInvoice()
  const [sriEnvironmentOverride, setSriEnvironmentOverride] = useState<"1" | "2" | null>(null)
  const sriEnvironment = sriEnvironmentOverride ?? (invoice?.ambiente === "2" ? "2" : "1")

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync(id)
      toast.success("Factura anulada")
    } catch {
      toast.error("Error al anular factura")
    }
  }

  async function handleSubmitToSri() {
    try {
      const response = await sriSubmitMutation.mutateAsync({
        invoiceId: id,
        isProduction: sriEnvironment === "2",
      })
      if (response.isReceived) {
        toast.success(`Factura enviada al SRI: ${response.estado}`)
      } else {
        const firstError = response.errors[0]
        toast.error(
          firstError?.mensaje
            ? `${response.estado}: ${firstError.mensaje}`
            : `SRI respondió: ${response.estado}`
        )
      }
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? (error as ApiError).message
          : null
      toast.error(message || "Error al enviar factura al SRI")
    }
  }

  async function handleCheckAuthorization() {
    try {
      const response = await sriAuthorizeMutation.mutateAsync({
        invoiceId: id,
        isProduction: sriEnvironment === "2",
      })
      if (response.isAuthorized) {
        toast.success("Factura autorizada por el SRI")
      } else {
        const firstError = response.errors[0]
        toast.error(
          firstError?.mensaje
            ? `${response.estado}: ${firstError.mensaje}`
            : `Estado de autorización: ${response.estado}`
        )
      }
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? (error as ApiError).message
          : null
      toast.error(message || "Error al consultar autorización SRI")
    }
  }

  function copySriRequest() {
    if (sriRequest) {
      navigator.clipboard.writeText(JSON.stringify(sriRequest, null, 2))
      toast.success("XML/JSON copiado al portapapeles")
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

  if (!invoice) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Factura no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/clinical/billing" />}
        >
          Volver a facturación de consultas
        </Button>
      </div>
    )
  }

  const canSubmitSri = invoice.status === "DRAFT"
  const canAuthorizeSri =
    invoice.status === "PENDING" && Boolean(invoice.claveAcceso)
  const canCancel =
    invoice.status !== "CANCELLED" && invoice.status !== "AUTHORIZED"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/clinical/billing" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Factura {invoice.numeroFactura}
              </h1>
              <Badge className={invoice.statusColor}>
                {invoice.statusLabel}
              </Badge>
              <Badge className={invoice.invoiceTypeColor}>
                {invoice.invoiceTypeLabel}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {invoice.createdAtFormatted} · {invoice.clinicName ?? invoice.establishmentName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <ConfirmButton
              variant="destructive"
              size="sm"
              title="Anular factura"
              description="La factura se marcará como anulada."
              confirmLabel="Sí, anular factura"
              loadingLabel="Anulando..."
              onConfirm={handleCancel}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Anular factura
            </ConfirmButton>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoice info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información de la factura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="N° Factura" value={invoice.numeroFactura} />
            <InfoRow label="Clínica" value={invoice.clinicName} />
            <InfoRow label="Ambiente" value={invoice.ambienteLabel} />
            <InfoRow
              label="Clave de acceso"
              value={invoice.claveAcceso}
            />
            <InfoRow label="Fecha creación" value={invoice.createdAtFormatted} />
          </CardContent>
        </Card>

        {/* Buyer info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Datos del comprador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="Razón social"
              value={invoice.compradorRazonSocial}
            />
            <InfoRow
              label="Tipo identificación"
              value={invoice.compradorTipoIdLabel}
            />
            <InfoRow
              label="Identificación"
              value={invoice.compradorIdentificacion}
            />
            <InfoRow
              label="Dirección"
              value={invoice.compradorDireccion}
            />
            <InfoRow label="Email" value={invoice.compradorEmail} />
          </CardContent>
        </Card>
      </div>

      {/* Doctor info */}
      {invoice.doctorName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Información de la consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Doctor" value={invoice.doctorName} />
            <InfoRow label="Clínica" value={invoice.clinicName} />
          </CardContent>
        </Card>
      )}

      {/* Totals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Detalle de valores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <ValueBox
              label="Subtotal sin impuestos"
              value={invoice.totalSinImpuestosFormatted}
            />
            <ValueBox label="Descuento" value={invoice.totalDescuentoFormatted} />
            <ValueBox label="Base IVA 0%" value={invoice.totalIva0Formatted} />
            <ValueBox label="Base IVA 12%" value={invoice.totalIva12Formatted} />
            <ValueBox label="Base IVA 15%" value={invoice.totalIva15Formatted} />
            <ValueBox label="Total IVA" value={invoice.totalIvaFormatted} />
            <div className="sm:col-span-2 rounded-lg border bg-primary/5 p-4">
              <p className="text-xs text-muted-foreground">Importe total</p>
              <p className="text-2xl font-bold">
                {invoice.importeTotalFormatted}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SRI Authorization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autorización SRI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoice.status === "AUTHORIZED" ? (
            <div className="rounded-lg border bg-green-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Factura autorizada por el SRI
                </span>
              </div>
              <div className="space-y-2">
                <InfoRow
                  label="N° Autorización"
                  value={invoice.sriNumeroAutorizacion}
                />
                <InfoRow
                  label="Fecha autorización"
                  value={invoice.sriFechaAutorizacionFormatted}
                />
                <InfoRow
                  label="Clave de acceso"
                  value={invoice.claveAcceso}
                />
              </div>
            </div>
          ) : (
            <>
              {sriRequest && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Datos para envío al SRI
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copySriRequest}
                    >
                      <Copy className="mr-1 h-3 w-3" />
                      Copiar
                    </Button>
                  </div>
                  <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/30 p-3 text-xs">
                    {JSON.stringify(sriRequest, null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-[minmax(0,220px)_1fr] sm:items-end">
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="clinical-sri-environment">
                    Ambiente de envío
                  </Label>
                  <Select
                    value={sriEnvironment}
                    onValueChange={(value) =>
                      setSriEnvironmentOverride((value as "1" | "2") ?? "1")
                    }
                    items={{ "1": "Pruebas", "2": "Producción" }}
                  >
                    <SelectTrigger id="clinical-sri-environment">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Pruebas</SelectItem>
                      <SelectItem value="2">Producción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canSubmitSri && (
                    <Button
                      onClick={handleSubmitToSri}
                      disabled={sriSubmitMutation.isPending || sriAuthorizeMutation.isPending}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      {sriSubmitMutation.isPending ? "Enviando..." : "Enviar al SRI"}
                    </Button>
                  )}
                  {canAuthorizeSri && (
                    <Button
                      variant="outline"
                      onClick={handleCheckAuthorization}
                      disabled={sriAuthorizeMutation.isPending || sriSubmitMutation.isPending}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {sriAuthorizeMutation.isPending
                        ? "Consultando..."
                        : "Consultar autorización"}
                    </Button>
                  )}
                </div>
              </div>

              {invoice.sriStatus && (
                <p className="text-sm text-muted-foreground">
                  Último estado SRI: <span className="font-medium">{invoice.sriStatus}</span>
                </p>
              )}

              {invoice.sriErrors && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  {invoice.sriErrors}
                </div>
              )}

              {!canSubmitSri && !canAuthorizeSri && (
                <p className="text-sm text-muted-foreground">
                  La factura está {invoice.statusLabel.toLowerCase()} y no requiere más acciones SRI.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Link to consultation */}
      {invoice.consultationId && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            render={
              <Link
                href={`/dashboard/clinical/consultations/${invoice.consultationId}`}
              />
            }
          >
            <Stethoscope className="mr-2 h-4 w-4" />
            Ver consulta asociada
          </Button>
        </div>
      )}
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  )
}

function ValueBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}
