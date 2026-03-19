"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { DataTable } from "@/components/ui/data-table"
import {
  useCashSession,
  useCashSessionSummary,
  useCashSessionSales,
} from "@/hooks/use-sales"
import {
  ArrowLeft,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Eye,
} from "lucide-react"

interface CashSessionDetailPageProps {
  params: Promise<{ id: string }>
}

export default function CashSessionDetailPage({
  params,
}: CashSessionDetailPageProps) {
  const { id } = use(params)
  const { data: session, isLoading } = useCashSession(id)
  const { data: summary, isLoading: loadingSummary } = useCashSessionSummary(id)
  const { data: sales = [], isLoading: loadingSales } = useCashSessionSales(id)

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

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Sesión no encontrada</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
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
            <h1 className="text-2xl font-bold">Sesión de caja</h1>
            <Badge className={session.statusColor}>{session.statusLabel}</Badge>
          </div>
          <p className="text-muted-foreground">
            {session.pharmacyName} · {session.userName} · {session.openedAtFormatted}
          </p>
        </div>
      </div>

      {/* Session info */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Información de la sesión
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Farmacia" value={session.pharmacyName} />
            <InfoRow label="Cajero" value={session.userName} />
            <InfoRow label="Apertura" value={session.openedAtFormatted} />
            <InfoRow label="Monto apertura" value={session.openingAmountFormatted} />
            {session.closedAt && (
              <>
                <InfoRow label="Cierre" value={session.closedAtFormatted} />
                <InfoRow label="Monto cierre" value={session.closingAmountFormatted} />
                {session.difference != null && (
                  <InfoRow
                    label="Diferencia"
                    value={session.differenceFormatted}
                  />
                )}
              </>
            )}
            {session.notes && <InfoRow label="Notas" value={session.notes} />}
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-32 w-full" />
            ) : summary ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <SummaryItem label="Total ventas" value={summary.totalSalesFormatted} bold />
                  <SummaryItem label="N° de ventas" value={String(summary.salesCount)} bold />
                  <SummaryItem label="Efectivo" value={summary.cashSalesFormatted} />
                  <SummaryItem label="Tarjeta" value={summary.cardSalesFormatted} />
                  <SummaryItem label="Transferencias" value={summary.transferSalesFormatted} />
                  <SummaryItem label="Esperado en caja" value={summary.expectedCashFormatted} bold />
                </div>
                {summary.difference != null && (
                  <div className="border-t pt-3">
                    <SummaryItem
                      label="Diferencia"
                      value={summary.differenceFormatted ?? "$0.00"}
                      bold
                    />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sales in session */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Ventas de la sesión ({sales.length})
        </h2>
        <DataTable
          isLoading={loadingSales}
          isEmpty={sales.length === 0}
          loadingRows={3}
          emptyIcon={<ShoppingCart className="h-8 w-8 text-muted-foreground" />}
          emptyMessage="No hay ventas en esta sesión"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Venta</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Pago</TableHead>
                <TableHead>Items</TableHead>
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
                  <TableCell className="text-sm">
                    {s.createdAtFormatted}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{s.paymentMethodLabel}</Badge>
                  </TableCell>
                  <TableCell>{s.totalItems}</TableCell>
                  <TableCell className="text-right font-bold">
                    {s.totalFormatted}
                  </TableCell>
                  <TableCell>
                    <Badge className={s.statusColor}>{s.statusLabel}</Badge>
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

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  )
}

function SummaryItem({
  label,
  value,
  bold,
}: {
  label: string
  value: string
  bold?: boolean
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={bold ? "text-lg font-bold" : "text-sm font-medium"}>
        {value}
      </p>
    </div>
  )
}
