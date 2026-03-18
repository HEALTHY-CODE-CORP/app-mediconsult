"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PatientTable } from "@/components/patients/patient-table"
import { usePatients, useSearchPatients } from "@/hooks/use-patients"
import { Plus, Search } from "lucide-react"

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const isSearching = searchQuery.length >= 2

  const patientsQuery = usePatients()
  const searchPatientsQuery = useSearchPatients(searchQuery)

  const activeQuery = isSearching ? searchPatientsQuery : patientsQuery
  const patients = activeQuery.data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gestión de pacientes registrados
          </p>
        </div>
        <Button render={<Link href="/dashboard/patients/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo paciente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre o cédula..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <PatientTable
        patients={patients}
        isLoading={activeQuery.isLoading}
      />
    </div>
  )
}
