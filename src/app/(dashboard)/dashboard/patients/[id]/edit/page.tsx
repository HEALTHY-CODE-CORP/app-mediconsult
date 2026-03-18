"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { PatientForm } from "@/components/patients/patient-form"
import { usePatient } from "@/hooks/use-patients"
import { ArrowLeft } from "lucide-react"

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/dashboard/patients/${id}`} />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar paciente</h1>
          <p className="text-muted-foreground">{patient.fullName}</p>
        </div>
      </div>

      <PatientForm patient={patient} mode="edit" />
    </div>
  )
}
