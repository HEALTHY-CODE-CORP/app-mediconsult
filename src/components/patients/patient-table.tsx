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
import { DataTable } from "@/components/ui/data-table"
import { Eye, Pencil } from "lucide-react"
import type { Patient } from "@/adapters/patient.adapter"

interface PatientTableProps {
  patients: Patient[]
  isLoading?: boolean
}

export function PatientTable({ patients, isLoading }: PatientTableProps) {
  return (
    <DataTable
      isLoading={isLoading}
      isEmpty={patients.length === 0}
      emptyMessage="No se encontraron pacientes"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Identificación</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead>Género</TableHead>
            <TableHead>Edad</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    {patient.idTypeLabel}
                  </span>
                  <span className="font-medium">{patient.idNumber}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{patient.fullName}</span>
                  {patient.email && (
                    <span className="text-xs text-muted-foreground">
                      {patient.email}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>{patient.genderLabel ?? "—"}</TableCell>
              <TableCell>
                {patient.age != null ? `${patient.age} años` : "—"}
              </TableCell>
              <TableCell>{patient.phone ?? "—"}</TableCell>
              <TableCell>
                <Badge variant={patient.isActive ? "default" : "secondary"}>
                  {patient.isActive ? "Activo" : "Inactivo"}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    render={<Link href={`/dashboard/patients/${patient.id}`} />}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    render={<Link href={`/dashboard/patients/${patient.id}/edit`} />}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DataTable>
  )
}
