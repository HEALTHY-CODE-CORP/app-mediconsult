"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { PharmacySelector } from "@/components/inventory/pharmacy-selector"
import {
  useLowStockAlerts,
  useExpiringAlerts,
  useExpiredAlerts,
} from "@/hooks/use-inventory"
import {
  ArrowLeft,
  AlertTriangle,
  Clock,
  XCircle,
  Package,
  Eye,
} from "lucide-react"

export default function AlertsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      }
    >
      <AlertsContent />
    </Suspense>
  )
}

function AlertsContent() {
  const searchParams = useSearchParams()
  const [pharmacyId, setPharmacyId] = useState(
    searchParams.get("pharmacyId") ?? ""
  )

  const { data: lowStock = [], isLoading: loadingLow } =
    useLowStockAlerts(pharmacyId)
  const { data: expiring = [], isLoading: loadingExpiring } =
    useExpiringAlerts(pharmacyId)
  const { data: expired = [], isLoading: loadingExpired } =
    useExpiredAlerts(pharmacyId)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={
            <Link
              href={`/dashboard/pharmacy/inventory?pharmacyId=${pharmacyId}`}
            />
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Alertas de inventario
          </h1>
          <p className="text-muted-foreground">
            Stock bajo, productos por vencer y vencidos
          </p>
        </div>
      </div>

      <PharmacySelector value={pharmacyId} onChange={setPharmacyId} />

      {!pharmacyId ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Package className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Selecciona una farmacia para ver alertas
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Low stock */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Stock bajo
              {!loadingLow && (
                <Badge variant="destructive">{lowStock.length}</Badge>
              )}
            </h2>
            <DataTable
              isLoading={loadingLow}
              isEmpty={lowStock.length === 0}
              loadingRows={2}
              emptyMessage="No hay productos con stock bajo"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead className="text-center">Stock actual</TableHead>
                    <TableHead className="text-center">Stock mínimo</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">
                        {p.displayName}
                      </TableCell>
                      <TableCell className="text-center font-bold text-red-600">
                        {p.currentStock}
                      </TableCell>
                      <TableCell className="text-center">
                        {p.minStock}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          render={
                            <Link
                              href={`/dashboard/pharmacy/inventory/products/${p.id}?pharmacyId=${pharmacyId}`}
                            />
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

          {/* Expiring soon */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              Por vencer (30 días)
              {!loadingExpiring && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {expiring.length}
                </Badge>
              )}
            </h2>
            <DataTable
              isLoading={loadingExpiring}
              isEmpty={expiring.length === 0}
              loadingRows={2}
              emptyMessage="No hay lotes por vencer"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead>Días restantes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expiring.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">
                        {lot.productName}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {lot.lotNumber}
                      </TableCell>
                      <TableCell className="text-center">
                        {lot.quantity}
                      </TableCell>
                      <TableCell>{lot.expirationDateFormatted}</TableCell>
                      <TableCell>
                        <Badge className={lot.expirationColor}>
                          {lot.daysUntilExpiration}d
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTable>
          </div>

          {/* Expired */}
          <div className="space-y-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Vencidos
              {!loadingExpired && (
                <Badge variant="destructive">{expired.length}</Badge>
              )}
            </h2>
            <DataTable
              isLoading={loadingExpired}
              isEmpty={expired.length === 0}
              loadingRows={2}
              emptyMessage="No hay lotes vencidos"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Producto</TableHead>
                    <TableHead>Lote</TableHead>
                    <TableHead className="text-center">Cantidad</TableHead>
                    <TableHead>Venció el</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expired.map((lot) => (
                    <TableRow key={lot.id}>
                      <TableCell className="font-medium">
                        {lot.productName}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {lot.lotNumber}
                      </TableCell>
                      <TableCell className="text-center">
                        {lot.quantity}
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-red-100 text-red-800">
                          {lot.expirationDateFormatted}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTable>
          </div>
        </div>
      )}
    </div>
  )
}
