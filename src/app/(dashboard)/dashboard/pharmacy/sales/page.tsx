"use client"

import { useState } from "react"
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
import { DataTable } from "@/components/ui/data-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { PharmacySelector } from "@/components/inventory/pharmacy-selector"
import {
  useMyOpenCashSession,
  useOpenCashSession,
  useCloseCashSession,
  usePharmacySales,
  useOrganizationSales,
  useCashSessionSummary,
} from "@/hooks/use-sales"
import {
  useOrganizationPendingPrescriptions,
  useMarkPrescriptionExternal,
} from "@/hooks/use-prescriptions"
import {
  ShoppingCart,
  Plus,
  Eye,
  DollarSign,
  Lock,
  Unlock,
  BarChart3,
  FileText,
  Pill,
  ExternalLink,
  TrendingUp,
} from "lucide-react"
import { toast } from "sonner"
import { useSalesEarnings } from "@/hooks/use-dashboard"

export default function SalesPage() {
  const [pharmacyId, setPharmacyId] = useState("")

  // Cash session
  const { data: openSession, isLoading: loadingSession } = useMyOpenCashSession()
  const openSessionMutation = useOpenCashSession()
  const closeSessionMutation = useCloseCashSession(openSession?.id ?? "")
  const { data: summary } = useCashSessionSummary(openSession?.id ?? "")

  // Sales — by pharmacy or all org sales
  const { data: pharmacySales = [], isLoading: loadingPharmacySales } = usePharmacySales(pharmacyId)
  const { data: orgSales = [], isLoading: loadingOrgSales } = useOrganizationSales()
  const sales = pharmacyId ? pharmacySales : orgSales
  const loadingSales = pharmacyId ? loadingPharmacySales : loadingOrgSales

  // Sales earnings
  const { data: earnings } = useSalesEarnings()

  // Pending prescriptions
  const { data: pendingPrescriptions = [], isLoading: loadingPrescriptions } =
    useOrganizationPendingPrescriptions()
  const markExternalMutation = useMarkPrescriptionExternal()

  async function handleMarkExternal(prescriptionId: string) {
    try {
      await markExternalMutation.mutateAsync(prescriptionId)
      toast.success("Receta marcada como despachada externamente")
    } catch {
      toast.error("Error al marcar la receta")
    }
  }

  // Open session form
  const [openingAmount, setOpeningAmount] = useState("")
  const [openNotes, setOpenNotes] = useState("")

  // Close session form
  const [closingAmount, setClosingAmount] = useState("")
  const [closeNotes, setCloseNotes] = useState("")
  const [showCloseForm, setShowCloseForm] = useState(false)

  async function handleOpenSession() {
    if (!pharmacyId) {
      toast.error("Selecciona una farmacia")
      return
    }
    if (!openingAmount) {
      toast.error("Ingresa el monto de apertura")
      return
    }
    try {
      await openSessionMutation.mutateAsync({
        pharmacyId,
        openingAmount: parseFloat(openingAmount),
        notes: openNotes.trim() || undefined,
      })
      toast.success("Sesión de caja abierta")
      setOpeningAmount("")
      setOpenNotes("")
    } catch {
      toast.error("Error al abrir sesión de caja")
    }
  }

  async function handleCloseSession() {
    if (!closingAmount) {
      toast.error("Ingresa el monto de cierre")
      return
    }
    try {
      await closeSessionMutation.mutateAsync({
        closingAmount: parseFloat(closingAmount),
        notes: closeNotes.trim() || undefined,
      })
      toast.success("Sesión de caja cerrada")
      setClosingAmount("")
      setCloseNotes("")
      setShowCloseForm(false)
    } catch {
      toast.error("Error al cerrar sesión de caja")
    }
  }

  function buildNewSaleUrl(prescriptionId?: string) {
    if (!openSession) return "#"
    const base = `/dashboard/pharmacy/sales/new?pharmacyId=${openSession.pharmacyId}&sessionId=${openSession.id}`
    return prescriptionId ? `${base}&prescriptionId=${prescriptionId}` : base
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ventas</h1>
          <p className="text-muted-foreground">
            Punto de venta y sesiones de caja
          </p>
        </div>
        {openSession && (
          <Button render={<Link href={buildNewSaleUrl()} />}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva venta
          </Button>
        )}
      </div>

      <PharmacySelector value={pharmacyId} onChange={setPharmacyId} />

      {/* Earnings Summary */}
      {earnings && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas hoy</p>
                    <p className="text-2xl font-bold">{earnings.todayCount}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ingreso hoy</p>
                    <p className="text-2xl font-bold">{earnings.todayRevenueFormatted}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ventas del mes</p>
                    <p className="text-2xl font-bold">{earnings.monthCount}</p>
                  </div>
                  <ShoppingCart className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ingreso del mes</p>
                    <p className="text-2xl font-bold">{earnings.monthRevenueFormatted}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment method breakdown + pharmacy breakdown */}
          <div className="grid gap-4 lg:grid-cols-2">
            {earnings.salesByPaymentMethod.length > 0 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-3 text-sm font-medium">Ventas por método de pago (mes)</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {earnings.salesByPaymentMethod.map((pm) => (
                      <div
                        key={pm.method}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">{pm.methodLabel}</p>
                          <p className="text-xs text-muted-foreground">{pm.count} ventas</p>
                        </div>
                        <p className="text-sm font-bold">{pm.totalFormatted}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {earnings.salesByPharmacy.length > 1 && (
              <Card>
                <CardContent className="pt-6">
                  <p className="mb-3 text-sm font-medium">Ventas por farmacia (mes)</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Farmacia</TableHead>
                        <TableHead className="text-right">Ventas</TableHead>
                        <TableHead className="text-right">Ingreso</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {earnings.salesByPharmacy.map((p) => (
                        <TableRow key={p.pharmacyId}>
                          <TableCell className="font-medium">{p.pharmacyName}</TableCell>
                          <TableCell className="text-right">{p.count}</TableCell>
                          <TableCell className="text-right font-bold">{p.revenueFormatted}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Cash session card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Sesión de caja
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingSession ? (
            <Skeleton className="h-20 w-full" />
          ) : openSession ? (
            <>
              {/* Active session info */}
              <div className="rounded-lg border bg-green-50 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Unlock className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      Sesión abierta
                    </span>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {openSession.statusLabel}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Farmacia</p>
                    <p className="font-medium">{openSession.pharmacyName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cajero</p>
                    <p className="font-medium">{openSession.userName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Apertura</p>
                    <p className="font-medium">{openSession.openingAmountFormatted}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Abierta</p>
                    <p className="font-medium">{openSession.openedAtFormatted}</p>
                  </div>
                </div>

                {/* Summary */}
                {summary && (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-sm border-t pt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Ventas</p>
                      <p className="font-bold">{summary.salesCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total ventas</p>
                      <p className="font-bold">{summary.totalSalesFormatted}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Efectivo</p>
                      <p className="font-medium">{summary.cashSalesFormatted}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Esperado en caja</p>
                      <p className="font-bold">{summary.expectedCashFormatted}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link href={`/dashboard/pharmacy/sales/cash-sessions/${openSession.id}`} />
                    }
                  >
                    <BarChart3 className="mr-1 h-4 w-4" />
                    Ver detalle
                  </Button>
                  {!showCloseForm && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setShowCloseForm(true)}
                    >
                      <Lock className="mr-1 h-4 w-4" />
                      Cerrar caja
                    </Button>
                  )}
                </div>
              </div>

              {/* Close session form */}
              {showCloseForm && (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <h4 className="text-sm font-semibold">Cerrar sesión de caja</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Monto de cierre ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={closingAmount}
                        onChange={(e) => setClosingAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Notas</Label>
                      <Input
                        value={closeNotes}
                        onChange={(e) => setCloseNotes(e.target.value)}
                        placeholder="Observaciones del cierre"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCloseForm(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleCloseSession}
                      disabled={closeSessionMutation.isPending}
                    >
                      {closeSessionMutation.isPending ? "Cerrando..." : "Confirmar cierre"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No open session — show open form */
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                No tienes una sesión de caja abierta. Abre una para empezar a vender.
              </p>
              {pharmacyId ? (
                <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Monto de apertura ($) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={openingAmount}
                        onChange={(e) => setOpeningAmount(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Notas</Label>
                      <Input
                        value={openNotes}
                        onChange={(e) => setOpenNotes(e.target.value)}
                        placeholder="Observaciones de apertura"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleOpenSession}
                    disabled={openSessionMutation.isPending}
                  >
                    <Unlock className="mr-1 h-4 w-4" />
                    {openSessionMutation.isPending ? "Abriendo..." : "Abrir caja"}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Selecciona una farmacia primero
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending prescriptions */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recetas pendientes
            {pendingPrescriptions.length > 0 && (
              <Badge className="bg-amber-100 text-amber-800">
                {pendingPrescriptions.length}
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground">
            Recetas médicas que necesitan ser despachadas
          </p>
        </div>

        <DataTable
          isLoading={loadingPrescriptions}
          isEmpty={pendingPrescriptions.length === 0}
          loadingRows={2}
          emptyIcon={<FileText className="h-8 w-8 text-muted-foreground" />}
          emptyMessage="No hay recetas pendientes"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receta</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead className="hidden md:table-cell">Doctor</TableHead>
                <TableHead className="hidden sm:table-cell">Productos</TableHead>
                <TableHead className="hidden lg:table-cell">Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPrescriptions.map((rx) => (
                <TableRow key={rx.id}>
                  <TableCell className="font-mono text-sm font-medium">
                    {rx.prescriptionNumber}
                  </TableCell>
                  <TableCell>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{rx.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {rx.patientIdNumber}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm">
                    {rx.doctorName}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">
                        {rx.pendingItems}/{rx.totalItems} pendientes
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm">
                    {rx.prescribedAtFormatted}
                  </TableCell>
                  <TableCell>
                    <Badge className={rx.statusColor}>
                      {rx.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={
                          <Link href={`/dashboard/prescriptions/${rx.id}`} />
                        }
                        title="Ver receta"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkExternal(rx.id)}
                        disabled={markExternalMutation.isPending}
                        title="El paciente no compró aquí"
                        className="text-muted-foreground"
                      >
                        <ExternalLink className="mr-1 h-3.5 w-3.5" />
                        <span className="hidden lg:inline">No compró aquí</span>
                      </Button>
                      {openSession && (
                        <Button
                          size="sm"
                          render={
                            <Link href={buildNewSaleUrl(rx.id)} />
                          }
                        >
                          <ShoppingCart className="mr-1 h-3.5 w-3.5" />
                          Vender
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      </div>

      {/* Sales list */}
      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            {pharmacyId ? "Ventas de la farmacia" : "Todas las ventas"}
            {sales.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                ({sales.length})
              </span>
            )}
          </h2>
        </div>

        <DataTable
          isLoading={loadingSales}
          isEmpty={sales.length === 0}
          emptyIcon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
          emptyMessage="No hay ventas registradas"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Venta</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Cliente</TableHead>
                {!pharmacyId && <TableHead>Farmacia</TableHead>}
                <TableHead>Receta</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-sm">
                    {s.saleNumber}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {s.createdAtFormatted}
                  </TableCell>
                  <TableCell>{s.sellerName}</TableCell>
                  <TableCell>{s.customerName ?? s.patientName ?? "—"}</TableCell>
                  {!pharmacyId && (
                    <TableCell className="text-sm">{s.pharmacyName}</TableCell>
                  )}
                  <TableCell>
                    {s.prescriptionNumber ? (
                      <Badge variant="outline" className="font-mono text-xs">
                        {s.prescriptionNumber}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.paymentMethodLabel}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-bold">
                    {s.totalFormatted}
                  </TableCell>
                  <TableCell>
                    <Badge className={s.statusColor}>
                      {s.statusLabel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={
                        <Link href={`/dashboard/pharmacy/sales/${s.id}`} />
                      }
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DataTable>
      </div>
    </div>
  )
}
