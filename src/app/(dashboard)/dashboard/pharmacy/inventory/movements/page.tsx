"use client"

import { Suspense, useState } from "react"
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
import { PharmacySelector } from "@/components/inventory/pharmacy-selector"
import { useAllMovements } from "@/hooks/use-inventory"
import { ArrowLeft, BarChart3, Package } from "lucide-react"

export default function MovementsPage() {
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
      <MovementsContent />
    </Suspense>
  )
}

function MovementsContent() {
  const searchParams = useSearchParams()
  const [pharmacyId, setPharmacyId] = useState(
    searchParams.get("pharmacyId") ?? ""
  )

  const { data: movements = [], isLoading } = useAllMovements(pharmacyId)

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
            Movimientos de inventario
          </h1>
          <p className="text-muted-foreground">
            Kardex general — entradas, salidas, ajustes y devoluciones
          </p>
        </div>
      </div>

      <PharmacySelector value={pharmacyId} onChange={setPharmacyId} />

      {!pharmacyId ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Package className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Selecciona una farmacia para ver movimientos
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : movements.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <BarChart3 className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay movimientos registrados
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Lote</TableHead>
              <TableHead className="text-center">Cantidad</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead>Usuario</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {m.createdAtFormatted}
                </TableCell>
                <TableCell>
                  <Badge className={m.movementTypeColor}>
                    {m.movementTypeLabel}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{m.productName}</TableCell>
                <TableCell className="font-mono text-xs">
                  {m.lotNumber ?? "—"}
                </TableCell>
                <TableCell className="text-center font-medium">
                  {m.movementType === "OUT" ? `-${m.quantity}` : `+${m.quantity}`}
                </TableCell>
                <TableCell className="text-right">
                  {m.totalPriceFormatted ?? "—"}
                </TableCell>
                <TableCell className="max-w-[180px] truncate text-sm">
                  {m.reason ?? m.notes ?? "—"}
                </TableCell>
                <TableCell className="text-sm">{m.userName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
