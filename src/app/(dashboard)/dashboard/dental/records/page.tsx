"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useOrganizationDentalRecords } from "@/hooks/use-dental"
import { usePatients } from "@/hooks/use-patients"
import { SelectPatientDentalModal } from "@/components/dental/select-patient-dental-modal"
import {
  FileHeart,
  Search,
  Eye,
  User,
  Plus,
  Users,
  CheckCircle,
} from "lucide-react"

export default function DentalRecordsPage() {
  const { data: records = [], isLoading: recordsLoading } = useOrganizationDentalRecords()
  const { data: patients = [], isLoading: patientsLoading } = usePatients()
  const [search, setSearch] = useState("")
  const [patientModalOpen, setPatientModalOpen] = useState(false)

  const patientsWithoutRecord = useMemo(() => {
    return patients.filter(
      (p) => !records.some((r) => r.patientId === p.id && r.isActive)
    )
  }, [patients, records])

  const filteredRecords = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.patientIdNumber.toLowerCase().includes(q) ||
        r.recordNumber.toLowerCase().includes(q)
    )
  }, [records, search])

  const isLoading = recordsLoading || patientsLoading

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Historias clínicas odontológicas
          </h1>
          <p className="text-muted-foreground">
            Busca y consulta las historias clínicas, evolución y odontogramas de los pacientes
          </p>
        </div>
        <Button onClick={() => setPatientModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva historia clínica
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total historias
                </p>
                <p className="text-2xl font-bold">{records.length}</p>
              </div>
              <FileHeart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Historias activas
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {records.filter((r) => r.isActive).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pacientes sin historia
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {patientsWithoutRecord.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Buscador */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, cédula o N° historia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Resumen de resultados */}
      {!isLoading && filteredRecords.length > 0 && (
        <p className="text-sm text-muted-foreground">
          {filteredRecords.length} de {records.length}{" "}
          {records.length === 1 ? "historia clínica" : "historias clínicas"}
        </p>
      )}

      {/* Tabla de Historias */}
      <DataTable
        isLoading={isLoading}
        isEmpty={filteredRecords.length === 0}
        emptyIcon={<FileHeart className="h-10 w-10 text-muted-foreground" />}
        emptyMessage={
          search
            ? "No se encontraron historias clínicas odontológicas"
            : "No hay historias clínicas odontológicas registradas"
        }
        emptyDescription={
          !search
            ? "Crea una historia odontológica seleccionando un paciente desde la lista de pacientes."
            : undefined
        }
        emptyAction={
          <Button
            variant="link"
            onClick={() => setPatientModalOpen(true)}
          >
            Buscar paciente para abrir historia
          </Button>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Historia</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead className="hidden sm:table-cell">Cédula</TableHead>
              <TableHead className="hidden md:table-cell">Consultorio de apertura</TableHead>
              <TableHead className="hidden lg:table-cell">Fecha de apertura</TableHead>
              <TableHead className="hidden lg:table-cell">Abierto por</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium font-mono">
                  {record.recordNumber}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="hidden sm:block h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {record.patientName}
                      </p>
                      <p className="text-xs text-muted-foreground sm:hidden">
                        {record.patientIdNumber}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {record.patientIdNumber}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {record.clinicName ?? "—"}
                </TableCell>
                <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm">
                  {record.openedAtFormatted}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {record.openedByName}
                </TableCell>
                <TableCell>
                  <Badge variant={record.isActive ? "default" : "secondary"}>
                    {record.isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Ver historia odontológica"
                    render={
                      <Link
                        href={`/dashboard/patients/${record.patientId}/dental`}
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

      <SelectPatientDentalModal
        open={patientModalOpen}
        onOpenChange={setPatientModalOpen}
      />
    </div>
  )
}
