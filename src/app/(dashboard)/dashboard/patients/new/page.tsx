"use client"

import { PatientForm } from "@/components/patients/patient-form"

export default function NewPatientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo paciente</h1>
        <p className="text-muted-foreground">
          Registra un nuevo paciente en el sistema
        </p>
      </div>

      <PatientForm mode="create" />
    </div>
  )
}
