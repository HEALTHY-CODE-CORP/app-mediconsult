"use client"

import { use, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  useSubmitSriResponse,
  useMarkInvoicePending,
  useCancelInvoice,
} from "@/hooks/use-billing"
import {
  ArrowLeft,
  FileText,
  User,
  DollarSign,
  Shield,
  Send,
  XCircle,
  Clock,
  Copy,
  CheckCircle,
} from "lucide-react"
import { toast } from "sonner"

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = use(params)
  const { data: invoice, isLoading } = useInvoice(id)
  const { data: sriRequest } = useSriInvoiceRequest(
    invoice?.status === "PENDING" || invoice?.status === "DRAFT" ? id : ""
  )
  const submitSriMutation = useSubmitSriResponse(id)
  const markPendingMutation = useMarkInvoicePending(id)
  const cancelMutation = useCancelInvoice()

  // SRI response form
  const [showSriForm, setShowSriForm] = useState(false)
  const [sriClaveAcceso, setSriClaveAcceso] = useState("")
  const [sriNumeroAutorizacion, setSriNumeroAutorizacion] = useState("")
  const [sriFechaAutorizacion, setSriFechaAutorizacion] = useState("")
  const [sriAmbiente, setSriAmbiente] = useState("1")

  async function handleMarkPending() {
    try {
      await markPendingMutation.mutateAsync()
      toast.success("Factura marcada como pendiente")
    } catch {
      toast.error("Error al actualizar factura")
    }
  }

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync(id)
      toast.success("Factura anulada")
    } catch {
      toast.error("Error al anular factura")
    }
  }

  async function handleSubmitSri(e: React.FormEvent) {
    e.preventDefault()
    if (!sriClaveAcceso || !sriNumeroAutorizacion || !sriFechaAutorizacion) {
      toast.error("Completa todos los campos de autorización SRI")
      return
    }
    try {
      await submitSriMutation.mutateAsync({
        claveAcceso: sriClaveAcceso,
        numeroAutorizacion: sriNumeroAutorizacion,
        fechaAutorizacion: sriFechaAutorizacion,
        ambiente: sriAmbiente,
      })
      toast.success("Autorización SRI registrada")
      setShowSriForm(false)
    } catch {
      toast.error("Error al registrar autorización SRI")
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
          render={<Link href="/dashboard/pharmacy/billing" />}
        >
          Volver a facturación
        </Button>
      </div>
    )
  }

  const canMarkPending = invoice.status === "DRAFT"
  const canSubmitSri =
    invoice.status === "PENDING" || invoice.status === "DRAFT"
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
            render={<Link href="/dashboard/pharmacy/billing" />}
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
            </div>
            <p className="text-muted-foreground">
              {invoice.createdAtFormatted} · {invoice.pharmacyName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canMarkPending && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkPending}
              disabled={markPendingMutation.isPending}
            >
              <Clock className="mr-1 h-4 w-4" />
              {markPendingMutation.isPending
                ? "Actualizando..."
                : "Marcar pendiente"}
            </Button>
          )}
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
            <InfoRow label="Farmacia" value={invoice.pharmacyName} />
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
              {/* SRI Request data */}
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

              {/* Submit SRI response */}
              {canSubmitSri && !showSriForm && (
                <Button
                  variant="outline"
                  onClick={() => setShowSriForm(true)}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Registrar autorización SRI
                </Button>
              )}

              {showSriForm && (
                <form
                  onSubmit={handleSubmitSri}
                  className="rounded-lg border bg-muted/30 p-4 space-y-4"
                >
                  <h4 className="text-sm font-semibold">
                    Registrar respuesta del SRI
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Clave de acceso *</Label>
                      <Input
                        value={sriClaveAcceso}
                        onChange={(e) => setSriClaveAcceso(e.target.value)}
                        placeholder="49 dígitos"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">N° Autorización *</Label>
                      <Input
                        value={sriNumeroAutorizacion}
                        onChange={(e) =>
                          setSriNumeroAutorizacion(e.target.value)
                        }
                        placeholder="Número de autorización"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Fecha autorización *</Label>
                      <Input
                        type="datetime-local"
                        value={sriFechaAutorizacion}
                        onChange={(e) =>
                          setSriFechaAutorizacion(e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Ambiente</Label>
                      <Input
                        value={sriAmbiente}
                        onChange={(e) => setSriAmbiente(e.target.value)}
                        placeholder="1 = Pruebas, 2 = Producción"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSriForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={submitSriMutation.isPending}
                    >
                      <Send className="mr-1 h-3 w-3" />
                      {submitSriMutation.isPending
                        ? "Enviando..."
                        : "Registrar autorización"}
                    </Button>
                  </div>
                </form>
              )}

              {!canSubmitSri && (
                <p className="text-sm text-muted-foreground">
                  La factura está {invoice.statusLabel.toLowerCase()} y no puede
                  ser enviada al SRI.
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Link to sale */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          render={
            <Link
              href={`/dashboard/pharmacy/sales/${invoice.saleId}`}
            />
          }
        >
          Ver venta asociada
        </Button>
      </div>
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
