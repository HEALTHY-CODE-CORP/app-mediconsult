"use client"

import Link from "next/link"
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
import { useOrganizations } from "@/hooks/use-organizations"
import { Plus, Eye, Pencil } from "lucide-react"

export default function OrganizationsPage() {
  const { data: organizations = [], isLoading } = useOrganizations()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Organizaciones</h1>
          <p className="text-muted-foreground">
            Gestión de organizaciones del sistema
          </p>
        </div>
        <Button render={<Link href="/dashboard/admin/organizations/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva organización
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : organizations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-sm text-muted-foreground">
            No se encontraron organizaciones
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>RUC</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">{org.name}</TableCell>
                <TableCell className="font-mono text-sm">{org.ruc}</TableCell>
                <TableCell>
                  <Badge variant="outline">{org.planName}</Badge>
                </TableCell>
                <TableCell>{org.email ?? "—"}</TableCell>
                <TableCell>{org.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={org.isActive ? "default" : "secondary"}>
                    {org.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/dashboard/admin/organizations/${org.id}`} />}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/dashboard/admin/organizations/${org.id}/edit`} />}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
