"use client"

import Link from "next/link"
import { FileHeart, Plus, Search, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useOrganizationDentalRecords } from "@/hooks/use-dental"
import { usePatients } from "@/hooks/use-patients"

export default function DentalDashboardPage() {
  const { data: records = [], isLoading: recordsLoading } = useOrganizationDentalRecords()
  const { data: patients = [], isLoading: patientsLoading } = usePatients()

  const patientsWithoutDentalRecord = patients.filter(
    (patient) => !records.some((record) => record.patientId === patient.id && record.isActive)
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Odontología</h1>
          <p className="text-muted-foreground">
            Gestiona historias odontológicas, citas y odontogramas por paciente.
          </p>
        </div>
        <Button render={<Link href="/dashboard/patients" />}>
          <Search className="mr-2 h-4 w-4" />
          Buscar paciente
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Summary title="Historias odontológicas" value={records.length.toString()} />
        <Summary title="Historias activas" value={records.filter((record) => record.isActive).length.toString()} />
        <Summary title="Pacientes pendientes" value={patientsWithoutDentalRecord.length.toString()} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileHeart className="h-5 w-5" />
              Historias odontológicas
            </CardTitle>
            <CardDescription>Historias creadas dentro de la organización.</CardDescription>
          </CardHeader>
          <CardContent>
            {recordsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : records.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay historias odontológicas registradas.</p>
            ) : (
              <div className="space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-4">
                    <div className="min-w-0">
                      <p className="font-medium">{record.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.recordNumber} · {record.patientIdNumber} · {record.openedAtFormatted}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={record.isActive ? "default" : "secondary"}>
                        {record.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                      <Button variant="outline" size="sm" render={<Link href={`/dashboard/patients/${record.patientId}/dental`} />}>
                        Abrir
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Crear historia
            </CardTitle>
            <CardDescription>Selecciona un paciente para abrir su flujo odontológico.</CardDescription>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : patientsWithoutDentalRecord.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todos los pacientes listados ya tienen historia odontológica activa.</p>
            ) : (
              <div className="space-y-2">
                {patientsWithoutDentalRecord.slice(0, 8).map((patient) => (
                  <Button
                    key={patient.id}
                    variant="outline"
                    className="h-auto w-full justify-start py-3"
                    render={<Link href={`/dashboard/patients/${patient.id}/dental`} />}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span className="truncate">{patient.fullName}</span>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Summary({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  )
}
