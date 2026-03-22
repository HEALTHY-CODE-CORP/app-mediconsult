"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTable } from "@/components/ui/data-table"
import {
  useMyConsultations,
  useOrganizationConsultations,
} from "@/hooks/use-clinical"
import { useConsultationEarnings } from "@/hooks/use-dashboard"
import {
  CONSULTATION_STATUS_LABELS,
  CONSULTATION_STATUS_COLORS,
} from "@/adapters/clinical.adapter"
import { Plus, Eye, ClipboardList, DollarSign, TrendingUp } from "lucide-react"

export default function ConsultationsPage() {
  const { data: session } = useSession()
  const roles = session?.user?.roles ?? []
  const isDoctor = roles.includes("DOCTOR")
  const isAdmin = roles.includes("ADMIN")
  const canCreate = isDoctor || isAdmin
  // Nurse only sees all org consultations; Doctor/Admin sees their own
  const isNurseOnly = roles.includes("NURSE") && !isDoctor && !isAdmin

  // Doctor/Admin ve sus consultas; Enfermera ve todas las de la organización
  const doctorQuery = useMyConsultations()
  const orgQuery = useOrganizationConsultations()

  const activeQuery = isNurseOnly ? orgQuery : doctorQuery
  const consultations = activeQuery.data ?? []
  const isLoading = activeQuery.isLoading

  const { data: earnings } = useConsultationEarnings()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isNurseOnly ? "Consultas" : "Mis consultas"}
          </h1>
          <p className="text-muted-foreground">
            {isNurseOnly
              ? "Consultas médicas de la organización"
              : "Historial de consultas médicas realizadas"}
          </p>
        </div>
        {canCreate && (
          <Button render={<Link href="/dashboard/clinical/consultations/new" />}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva consulta
          </Button>
        )}
      </div>

      {/* Earnings Summary */}
      {earnings && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Consultas hoy</p>
                    <p className="text-2xl font-bold">{earnings.todayCount}</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ingreso hoy</p>
                    <p className="text-2xl font-bold">{earnings.todayRevenueFormatted}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Consultas del mes</p>
                    <p className="text-2xl font-bold">{earnings.monthCount}</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Ingreso del mes</p>
                    <p className="text-2xl font-bold">{earnings.monthRevenueFormatted}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {earnings.revenueByClinic.length > 1 && (
            <Card>
              <CardContent className="pt-6">
                <p className="mb-3 text-sm font-medium">Ingresos por clínica (mes)</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clínica</TableHead>
                      <TableHead className="text-right">Consultas</TableHead>
                      <TableHead className="text-right">Ingreso</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {earnings.revenueByClinic.map((c) => (
                      <TableRow key={c.clinicId}>
                        <TableCell className="font-medium">{c.clinicName}</TableCell>
                        <TableCell className="text-right">{c.count}</TableCell>
                        <TableCell className="text-right font-bold">{c.revenueFormatted}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <DataTable
        isLoading={isLoading}
        isEmpty={consultations.length === 0}
        emptyIcon={<ClipboardList className="h-10 w-10 text-muted-foreground" />}
        emptyMessage={
          isNurseOnly
            ? "No hay consultas registradas"
            : "No tienes consultas registradas"
        }
        emptyAction={
          canCreate ? (
            <Button
              variant="link"
              render={<Link href="/dashboard/clinical/consultations/new" />}
            >
              Crear primera consulta
            </Button>
          ) : undefined
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Paciente</TableHead>
              {isNurseOnly && <TableHead>Doctor</TableHead>}
              <TableHead>Motivo</TableHead>
              <TableHead>Diagnóstico</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {c.consultationDateFormatted}
                </TableCell>
                <TableCell className="font-medium">{c.patientName}</TableCell>
                {isNurseOnly && (
                  <TableCell className="text-sm">{c.doctorName}</TableCell>
                )}
                <TableCell className="max-w-[200px] truncate">
                  {c.reasonForVisit}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {c.diagnosisDescription ?? "—"}
                </TableCell>
                <TableCell>
                  <Badge className={c.statusColor}>
                    {c.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    render={
                      <Link href={`/dashboard/clinical/consultations/${c.id}`} />
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
  )
}
