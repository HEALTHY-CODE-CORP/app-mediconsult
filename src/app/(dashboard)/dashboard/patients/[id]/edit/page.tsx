"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SummaryTile } from "@/components/shared/summary-tile"
import { PatientForm } from "@/components/patients/patient-form"
import { usePatient } from "@/hooks/use-patients"
import { ArrowLeft, Clock3, UserRound, FilePenLine } from "lucide-react"

interface EditPatientPageProps {
  params: Promise<{ id: string }>
}

export default function EditPatientPage({ params }: EditPatientPageProps) {
  const { id } = use(params)
  const { data: patient, isLoading } = usePatient(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Paciente no encontrado</p>
        <Button variant="link" className="mt-2" render={<Link href="/dashboard/patients" />}>
          Volver a pacientes
        </Button>
      </div>
    )
  }

  const lastUpdated = new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(patient.updatedAt))

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/dashboard/patients/${id}`} />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar paciente</h1>
          <p className="text-muted-foreground">{patient.fullName} · {patient.idNumber}</p>
        </div>
      </div>

      <Card className="border-border/70">
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile
              icon={<UserRound className="h-4 w-4 text-muted-foreground" />}
              label="Estado"
              value={patient.isActive ? "Paciente activo" : "Paciente inactivo"}
            />
            <SummaryTile
              icon={<FilePenLine className="h-4 w-4 text-muted-foreground" />}
              label="Formulario"
              value="Actualización de datos personales"
            />
            <SummaryTile
              icon={<Clock3 className="h-4 w-4 text-muted-foreground" />}
              label="Última actualización"
              value={lastUpdated}
            />
          </div>
        </CardContent>
      </Card>

      <PatientForm patient={patient} mode="edit" />
    </div>
  )
}
