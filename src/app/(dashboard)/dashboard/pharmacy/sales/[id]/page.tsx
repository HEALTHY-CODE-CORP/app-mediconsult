"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmButton } from "@/components/shared/confirm-button"
import { SummaryTile } from "@/components/shared/summary-tile"
import { useSale, useCancelSale } from "@/hooks/use-sales"
import { useSaleInvoice, useCreateInvoice } from "@/hooks/use-billing"
import { useCustomer } from "@/hooks/use-customers"
import { usePatient } from "@/hooks/use-patients"
import {
  ArrowLeft,
  ShoppingCart,
  CreditCard,
  Receipt,
  XCircle,
  FileText,
  Plus,
  Store,
  UserRound,
  DollarSign,
  Package2,
  RefreshCw,
} from "lucide-react"
import { toast } from "sonner"
import type { TipoIdentificacion } from "@/types/billing.model"
import { TIPO_ID_LABELS } from "@/adapters/billing.adapter"
import type { Sale } from "@/adapters/sales.adapter"
import type { ApiError } from "@/types/api"

interface SaleDetailPageProps {
  params: Promise<{ id: string }>
}

export default function SaleDetailPage({ params }: SaleDetailPageProps) {
  const { id } = use(params)
  const { data: sale, isLoading } = useSale(id)
  const cancelMutation = useCancelSale()

  async function handleCancel() {
    try {
      await cancelMutation.mutateAsync(id)
      toast.success("Venta cancelada")
    } catch {
      toast.error("Error al cancelar la venta")
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

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Venta no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/pharmacy/sales" />}
        >
          Volver a ventas
        </Button>
      </div>
    )
  }

  const canCancel = sale.status === "COMPLETED"
  const buyer = sale.customerName ?? sale.patientName ?? "Consumidor final"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/pharmacy/sales" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Venta {sale.saleNumber}</h1>
              <Badge className={sale.statusColor}>{sale.statusLabel}</Badge>
            </div>
            <p className="text-muted-foreground">
              {sale.createdAtFormatted} · {sale.pharmacyName}
            </p>
          </div>
        </div>
        {canCancel && (
          <ConfirmButton
            variant="destructive"
            size="sm"
            title="Cancelar venta"
            description="La venta se marcará como cancelada."
            confirmLabel="Cancelar venta"
            loadingLabel="Cancelando..."
            onConfirm={handleCancel}
            disabled={cancelMutation.isPending}
          >
            <XCircle className="mr-1 h-4 w-4" />
            Cancelar venta
          </ConfirmButton>
        )}
      </div>

      <Card className="border-border/70">
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              label="Total de venta"
              value={sale.totalFormatted}
            />
            <SummaryTile
              icon={<Package2 className="h-4 w-4 text-muted-foreground" />}
              label="Items"
              value={`${sale.totalItems} producto${sale.totalItems !== 1 ? "s" : ""}`}
            />
            <SummaryTile
              icon={<UserRound className="h-4 w-4 text-muted-foreground" />}
              label="Cliente"
              value={buyer}
              valueClassName="truncate"
            />
            <SummaryTile
              icon={<Store className="h-4 w-4 text-muted-foreground" />}
              label="Método de pago"
              value={sale.paymentMethodLabel}
            />
          </div>
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Información de la venta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="N° Venta" value={sale.saleNumber} />
            <InfoRow label="Farmacia" value={sale.pharmacyName} />
            <InfoRow label="Vendedor" value={sale.sellerName} />
            <InfoRow label="Fecha" value={sale.createdAtFormatted} />
            {sale.prescriptionNumber && (
              <InfoRow label="Receta" value={sale.prescriptionNumber} />
            )}
            {sale.notes && <InfoRow label="Notas" value={sale.notes} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sale.patientName && (
              <InfoRow label="Paciente" value={sale.patientName} />
            )}
            <InfoRow label="Método de pago" value={sale.paymentMethodLabel} />
            {sale.paymentReference && (
              <InfoRow label="Referencia" value={sale.paymentReference} />
            )}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{sale.subtotalFormatted}</span>
              </div>
              {sale.discountAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento</span>
                  <span className="text-red-600">-{sale.discountAmountFormatted}</span>
                </div>
              )}
              {sale.taxAmount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">IVA</span>
                  <span>{sale.taxAmountFormatted}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Total</span>
                <span>{sale.totalFormatted}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Productos ({sale.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead className="text-right">P. Unitario</TableHead>
                  <TableHead className="text-center">Desc. %</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="min-w-44 font-medium">{item.productName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {item.productBarcode ?? "—"}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unitPriceFormatted}</TableCell>
                    <TableCell className="text-center">
                      {item.discountPercent > 0 ? `${item.discountPercent}%` : "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {item.subtotalFormatted}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Invoice / Billing */}
      <InvoiceCard sale={sale} />
    </div>
  )
}

function mapPersonIdTypeToBillingType(rawIdType?: string | null): TipoIdentificacion | null {
  if (!rawIdType) return null
  const normalized = rawIdType.trim().toUpperCase()
  if (normalized === "04" || normalized === "RUC") return "04"
  if (normalized === "05" || normalized === "CEDULA" || normalized === "CÉDULA") return "05"
  if (normalized === "06" || normalized === "PASSPORT" || normalized === "PASAPORTE") return "06"
  if (normalized === "07" || normalized === "CONSUMIDOR_FINAL" || normalized === "CONSUMIDOR FINAL") return "07"
  return null
}

function InvoiceCard({ sale }: { sale: Sale }) {
  const router = useRouter()
  const saleId = sale.id
  const saleStatus = sale.status
  const { data: invoice, isLoading, refetch } = useSaleInvoice(saleId)
  const createMutation = useCreateInvoice()
  const customerQuery = useCustomer(sale.customerId ?? "")
  const patientQuery = usePatient(sale.patientId ?? "")
  const customer = customerQuery.data
  const patient = patientQuery.data
  const isPrefillLoading = customerQuery.isFetching || patientQuery.isFetching

  const [showForm, setShowForm] = useState(false)
  const [tipoId, setTipoId] = useState<TipoIdentificacion>("07")
  const [identificacion, setIdentificacion] = useState("9999999999999")
  const [razonSocial, setRazonSocial] = useState("CONSUMIDOR FINAL")
  const [direccion, setDireccion] = useState("")
  const [email, setEmail] = useState("")

  function prefillBuyerDataFromSale() {
    const suggestedType =
      mapPersonIdTypeToBillingType(customer?.idType) ??
      mapPersonIdTypeToBillingType(patient?.idType) ??
      (sale.customerId || sale.patientId ? "05" : "07")

    const suggestedIdentification =
      customer?.idNumber?.trim() ||
      patient?.idNumber?.trim() ||
      (suggestedType === "07" ? "9999999999999" : "")

    const suggestedName =
      customer?.fullName?.trim() ||
      patient?.fullName?.trim() ||
      sale.customerName?.trim() ||
      sale.patientName?.trim() ||
      (suggestedType === "07" ? "CONSUMIDOR FINAL" : "")

    setTipoId(suggestedType)
    setIdentificacion(suggestedIdentification)
    setRazonSocial(suggestedName)
    setDireccion((customer?.address ?? patient?.address ?? "").trim())
    setEmail((customer?.email ?? patient?.email ?? "").trim())
  }

  function openInvoiceForm() {
    prefillBuyerDataFromSale()
    setShowForm(true)
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

  function isInvoiceAlreadyExistsError(error: unknown): boolean {
    if (!error || typeof error !== "object") return false
    const apiError = error as Partial<ApiError>
    if (apiError.status === 409) return true
    if (typeof apiError.message === "string") {
      return apiError.message.toLowerCase().includes("invoice already exists")
    }
    return false
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!identificacion || !razonSocial) {
      toast.error("Completa los campos obligatorios")
      return
    }
    try {
      await createMutation.mutateAsync({
        saleId,
        compradorTipoId: tipoId,
        compradorIdentificacion: identificacion,
        compradorRazonSocial: razonSocial,
        compradorDireccion: direccion.trim() || undefined,
        compradorEmail: email.trim() || undefined,
      })
      toast.success("Factura creada exitosamente")
      setShowForm(false)
    } catch (error) {
      if (isInvoiceAlreadyExistsError(error)) {
        const existing = await refetch()
        if (existing.data?.id) {
          toast.message("Esta venta ya tiene una factura. Abriendo detalle.")
          setShowForm(false)
          router.push(`/dashboard/pharmacy/billing/${existing.data.id}`)
          return
        }
      }
      toast.error(getApiErrorMessage(error) ?? "Error al crear factura")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Facturación
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : invoice ? (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Factura {invoice.numeroFactura}
                </p>
                <p className="text-xs text-muted-foreground">
                  {invoice.compradorRazonSocial} · {invoice.importeTotalFormatted}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={invoice.statusColor}>
                  {invoice.statusLabel}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  render={
                    <Link href={`/dashboard/pharmacy/billing/${invoice.id}`} />
                  }
                >
                  Ver factura
                </Button>
              </div>
            </div>
          </div>
        ) : saleStatus === "COMPLETED" ? (
          <>
            {!showForm ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed bg-muted/20 p-4">
                <div>
                  <p className="text-sm font-medium">Esta venta aún no tiene factura</p>
                  <p className="text-xs text-muted-foreground">
                    Genera la factura electrónica para completar el proceso de cobro.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInvoiceForm}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Generar factura
                </Button>
              </div>
            ) : (
              <form onSubmit={handleCreate} className="rounded-lg border bg-muted/20 p-4 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-semibold">Datos del comprador</h4>
                      <p className="text-xs text-muted-foreground">
                        Completa la información requerida para generar la factura.
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={prefillBuyerDataFromSale}
                      disabled={isPrefillLoading}
                    >
                      <RefreshCw
                        className={`mr-1 h-3.5 w-3.5 ${isPrefillLoading ? "animate-spin" : ""}`}
                      />
                      Reautocompletar
                    </Button>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="sale-invoice-tipo-id">
                      Tipo identificación *
                    </Label>
                    <Select
                      value={tipoId}
                      onValueChange={(v) => {
                        const val = (v as TipoIdentificacion) ?? "07"
                        setTipoId(val)
                        if (val === "07") {
                          setIdentificacion("9999999999999")
                          setRazonSocial("CONSUMIDOR FINAL")
                        }
                      }}
                      items={TIPO_ID_LABELS as Record<string, string>}
                    >
                      <SelectTrigger id="sale-invoice-tipo-id">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.entries(TIPO_ID_LABELS) as [
                            TipoIdentificacion,
                            string,
                          ][]
                        ).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="sale-invoice-identificacion">
                      Identificación *
                    </Label>
                    <Input
                      id="sale-invoice-identificacion"
                      value={identificacion}
                      onChange={(e) => setIdentificacion(e.target.value)}
                      placeholder="N° identificación"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="sale-invoice-razon-social">
                      Razón social *
                    </Label>
                    <Input
                      id="sale-invoice-razon-social"
                      value={razonSocial}
                      onChange={(e) => setRazonSocial(e.target.value)}
                      placeholder="Nombre o razón social"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="sale-invoice-direccion">
                      Dirección
                    </Label>
                    <Input
                      id="sale-invoice-direccion"
                      value={direccion}
                      onChange={(e) => setDireccion(e.target.value)}
                      placeholder="Dirección del comprador"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs" htmlFor="sale-invoice-email">
                      Email
                    </Label>
                    <Input
                      id="sale-invoice-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createMutation.isPending}
                  >
                    <FileText className="mr-1 h-3 w-3" />
                    {createMutation.isPending
                      ? "Creando..."
                      : "Crear factura"}
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Solo se pueden facturar ventas completadas
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  )
}
