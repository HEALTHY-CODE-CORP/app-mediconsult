"use client"

import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Eye, Pill } from "lucide-react"
import type { Prescription } from "@/adapters/prescription.adapter"

interface PrescriptionTableProps {
  prescriptions: Prescription[]
  isLoading?: boolean
  showPatient?: boolean
  showDoctor?: boolean
}

export function PrescriptionTable({
  prescriptions,
  isLoading,
  showPatient = true,
  showDoctor = false,
}: PrescriptionTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (prescriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <Pill className="mb-3 h-10 w-10 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No se encontraron recetas
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>N° Receta</TableHead>
          <TableHead>Fecha</TableHead>
          {showPatient && <TableHead>Paciente</TableHead>}
          {showDoctor && <TableHead>Doctor</TableHead>}
          <TableHead>Farmacia</TableHead>
          <TableHead>Items</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prescriptions.map((p) => (
          <TableRow key={p.id}>
            <TableCell className="font-mono text-sm">
              {p.prescriptionNumber}
            </TableCell>
            <TableCell className="whitespace-nowrap text-sm">
              {p.prescribedAtFormatted}
            </TableCell>
            {showPatient && (
              <TableCell className="font-medium">{p.patientName}</TableCell>
            )}
            {showDoctor && (
              <TableCell>{p.doctorName}</TableCell>
            )}
            <TableCell>{p.pharmacyName ?? "Sin asignar"}</TableCell>
            <TableCell>
              {p.pendingItems > 0
                ? `${p.pendingItems}/${p.totalItems} pendientes`
                : `${p.totalItems} items`}
            </TableCell>
            <TableCell>
              <Badge className={p.statusColor}>{p.statusLabel}</Badge>
            </TableCell>
            <TableCell className="text-right">
              <Button
                variant="ghost"
                size="icon-sm"
                render={
                  <Link href={`/dashboard/prescriptions/${p.id}`} />
                }
              >
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
