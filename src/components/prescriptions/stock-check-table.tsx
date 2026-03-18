"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import type { StockAvailability } from "@/adapters/prescription.adapter"

interface StockCheckTableProps {
  items: StockAvailability[]
  isLoading?: boolean
}

export function StockCheckTable({ items, isLoading }: StockCheckTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        No hay datos de stock disponibles
      </p>
    )
  }

  const allAvailable = items.every((i) => i.isAvailable)

  return (
    <div className="space-y-3">
      {allAvailable ? (
        <Badge className="bg-green-100 text-green-800">
          ✓ Todo el stock disponible
        </Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800">
          ✗ Stock insuficiente en algunos productos
        </Badge>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Producto</TableHead>
            <TableHead className="text-center">Requerido</TableHead>
            <TableHead className="text-center">Disponible</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.productId}>
              <TableCell className="font-medium">{item.productName}</TableCell>
              <TableCell className="text-center">{item.requiredQuantity}</TableCell>
              <TableCell className="text-center">{item.availableStock}</TableCell>
              <TableCell>
                {item.isAvailable ? (
                  <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                    Disponible
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-red-700 border-red-300 bg-red-50">
                    Insuficiente
                  </Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
