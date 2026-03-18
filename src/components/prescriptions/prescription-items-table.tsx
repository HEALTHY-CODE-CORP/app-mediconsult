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
import type { PrescriptionItem } from "@/adapters/prescription.adapter"

interface PrescriptionItemsTableProps {
  items: PrescriptionItem[]
}

export function PrescriptionItemsTable({ items }: PrescriptionItemsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Producto</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Dosis</TableHead>
          <TableHead className="text-center">Cantidad</TableHead>
          <TableHead className="text-center">Dispensado</TableHead>
          <TableHead className="text-center">Pendiente</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="font-medium">{item.productName}</TableCell>
            <TableCell className="font-mono text-xs text-muted-foreground">
              {item.productBarcode ?? "—"}
            </TableCell>
            <TableCell className="max-w-[250px]">
              <p className="text-sm">{item.dosageSummary}</p>
              {item.instructions && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.instructions}
                </p>
              )}
            </TableCell>
            <TableCell className="text-center">{item.quantity}</TableCell>
            <TableCell className="text-center">{item.dispensedQuantity}</TableCell>
            <TableCell className="text-center">{item.remainingQuantity}</TableCell>
            <TableCell>
              {item.isPending ? (
                <Badge variant="outline" className="text-yellow-700 border-yellow-300 bg-yellow-50">
                  Pendiente
                </Badge>
              ) : (
                <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                  Completo
                </Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
