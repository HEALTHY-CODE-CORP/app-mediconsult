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
import { Eye, Pencil } from "lucide-react"
import type { Clinic, Pharmacy } from "@/adapters/organization.adapter"

type Entity = Clinic | Pharmacy

interface EntityTableProps {
  entities: Entity[]
  isLoading?: boolean
  basePath: string
  entityType?: "clinic" | "pharmacy"
}

export function EntityTable({ entities, isLoading, basePath, entityType }: EntityTableProps) {
  const isClinic = entityType === "clinic"

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (entities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <p className="text-sm text-muted-foreground">
          No se encontraron registros
        </p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Direcci&oacute;n</TableHead>
          <TableHead>Tel&eacute;fono</TableHead>
          <TableHead>Email</TableHead>
          {isClinic && <TableHead className="text-right">Consulta</TableHead>}
          <TableHead>Estado</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entities.map((entity) => (
          <TableRow key={entity.id}>
            <TableCell className="font-medium">{entity.name}</TableCell>
            <TableCell>{entity.address ?? "\u2014"}</TableCell>
            <TableCell>{entity.phone ?? "\u2014"}</TableCell>
            <TableCell>{entity.email ?? "\u2014"}</TableCell>
            {isClinic && (
              <TableCell className="text-right">
                {(entity as Clinic).consultationPriceFormatted}
              </TableCell>
            )}
            <TableCell>
              <Badge variant={entity.isActive ? "default" : "secondary"}>
                {entity.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`${basePath}/${entity.id}`} />}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={<Link href={`${basePath}/${entity.id}/edit`} />}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
