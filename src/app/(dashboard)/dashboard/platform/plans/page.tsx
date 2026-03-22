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
import { DataTable } from "@/components/ui/data-table"
import { usePlans } from "@/hooks/use-plans"
import { Plus, Eye, Pencil } from "lucide-react"

export default function PlansPage() {
  const { data: plans = [], isLoading } = usePlans()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Planes</h1>
          <p className="text-muted-foreground">
            Gestión de planes de suscripción de la plataforma
          </p>
        </div>
        <Button render={<Link href="/dashboard/platform/plans/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo plan
        </Button>
      </div>

      <DataTable
        isLoading={isLoading}
        isEmpty={plans.length === 0}
        loadingRows={3}
        emptyMessage="No se encontraron planes"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="text-right">Precio mensual</TableHead>
              <TableHead className="text-right">Precio anual</TableHead>
              <TableHead className="text-right">Fee consulta</TableHead>
              <TableHead className="text-center">Límites</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell className="font-medium">{plan.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">
                    {plan.code}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {plan.monthlyPriceFormatted}
                </TableCell>
                <TableCell className="text-right">
                  {plan.annualPriceFormatted}
                </TableCell>
                <TableCell className="text-right">
                  {plan.consultationFeeFormatted}
                </TableCell>
                <TableCell className="text-center">
                  <span className="text-xs text-muted-foreground">
                    {plan.maxClinics}C / {plan.maxPharmacies}F / {plan.maxUsers}U
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={plan.isActive ? "default" : "secondary"}>
                    {plan.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/dashboard/platform/plans/${plan.id}`} />}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/dashboard/platform/plans/${plan.id}/edit`} />}
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
    </div>
  )
}
