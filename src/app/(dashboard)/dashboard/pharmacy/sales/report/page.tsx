"use client"

import { useState } from "react"
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
import { useSalesReport } from "@/hooks/use-sales"
import { PAYMENT_METHOD_LABELS, SALE_STATUS_LABELS, SALE_STATUS_COLORS } from "@/adapters/sales.adapter"
import type { PaymentMethod, SaleStatus } from "@/types/sales.model"
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Percent,
  ShoppingCart,
} from "lucide-react"

function getMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  }
}

export default function SalesReportPage() {
  const defaultRange = getMonthRange()
  const [pharmacyId, setPharmacyId] = useState("")
  const [startDate, setStartDate] = useState(defaultRange.start)
  const [endDate, setEndDate] = useState(defaultRange.end)

  const { data: report, isLoading } = useSalesReport(pharmacyId, startDate, endDate)

  const handleDownloadCSV = () => {
    if (!report || report.sales.length === 0) return

    const headers = [
      "N. Venta",
      "Fecha",
      "Cliente",
      "Vendedor",
      "Metodo Pago",
      "Subtotal",
      "Impuesto",
      "Descuento",
      "Total",
      "Costo",
      "Utilidad",
      "Estado",
    ]

    const rows = report.sales.map((s) => [
      s.saleNumber,
      s.createdAtFormatted,
      s.customerName ?? "N/A",
      s.sellerName,
      s.paymentMethodLabel,
      s.subtotal.toFixed(2),
      s.taxAmount.toFixed(2),
      s.discountAmount.toFixed(2),
      s.total.toFixed(2),
      s.totalCost.toFixed(2),
      s.profit.toFixed(2),
      s.statusLabel,
    ])

    // Add summary row
    rows.push([])
    rows.push(["", "", "", "", "TOTALES", "", "", "", report.totalRevenue.toFixed(2), report.totalCost.toFixed(2), report.totalProfit.toFixed(2), ""])
    rows.push(["", "", "", "", `Margen: ${report.profitMarginFormatted}`, "", "", "", "", "", "", ""])

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `reporte-ventas-${report.pharmacyName}-${startDate}-a-${endDate}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Reporte de Ventas
        </h1>
        <p className="text-muted-foreground">
          Analiza las ventas, costos y utilidad por rango de fechas
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Farmacia</Label>
              <PharmacySelector value={pharmacyId} onChange={setPharmacyId} />
            </div>
            <div className="space-y-2">
              <Label>Desde</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Hasta</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={handleDownloadCSV}
              disabled={!report || report.sales.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {!pharmacyId && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Selecciona una farmacia para ver el reporte
          </CardContent>
        </Card>
      )}

      {pharmacyId && isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {report && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <ShoppingCart className="h-4 w-4" />
                  Ventas
                </div>
                <p className="text-2xl font-bold">{report.totalSales}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <DollarSign className="h-4 w-4" />
                  Ingresos
                </div>
                <p className="text-2xl font-bold">{report.totalRevenueFormatted}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingDown className="h-4 w-4" />
                  Costo
                </div>
                <p className="text-2xl font-bold text-red-600">{report.totalCostFormatted}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <TrendingUp className="h-4 w-4" />
                  Utilidad
                </div>
                <p className={`text-2xl font-bold ${report.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {report.totalProfitFormatted}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                  <Percent className="h-4 w-4" />
                  Margen
                </div>
                <p className={`text-2xl font-bold ${report.profitMarginPercent >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {report.profitMarginFormatted}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Method Breakdown */}
          {Object.keys(report.salesByPaymentMethod).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ventas por metodo de pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(report.salesByPaymentMethod).map(([method, summary]) => (
                    <div key={method} className="rounded-lg border p-4">
                      <p className="text-sm text-muted-foreground">
                        {PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method}
                      </p>
                      <p className="text-xl font-semibold">{summary.totalFormatted}</p>
                      <p className="text-xs text-muted-foreground">{summary.count} venta(s)</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sales Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Detalle de ventas ({report.sales.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {report.sales.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No hay ventas en el rango seleccionado
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>N. Venta</TableHead>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Vendedor</TableHead>
                        <TableHead>Pago</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="text-right">Costo</TableHead>
                        <TableHead className="text-right">Utilidad</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.sales.map((sale) => (
                        <TableRow key={sale.id}>
                          <TableCell className="font-mono text-sm">{sale.saleNumber}</TableCell>
                          <TableCell className="text-sm">{sale.createdAtFormatted}</TableCell>
                          <TableCell className="text-sm">{sale.customerName ?? "—"}</TableCell>
                          <TableCell className="text-sm">{sale.sellerName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{sale.paymentMethodLabel}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{sale.totalFormatted}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{sale.totalCostFormatted}</TableCell>
                          <TableCell className={`text-right font-medium ${sale.profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {sale.profitFormatted}
                          </TableCell>
                          <TableCell>
                            <Badge className={SALE_STATUS_COLORS[sale.status as SaleStatus] ?? ""}>
                              {SALE_STATUS_LABELS[sale.status as SaleStatus] ?? sale.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Totals row */}
                      <TableRow className="bg-muted/50 font-semibold">
                        <TableCell colSpan={5} className="text-right">
                          TOTALES
                        </TableCell>
                        <TableCell className="text-right">{report.totalRevenueFormatted}</TableCell>
                        <TableCell className="text-right text-muted-foreground">{report.totalCostFormatted}</TableCell>
                        <TableCell className={`text-right ${report.totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {report.totalProfitFormatted}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
