"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { usePatients } from "@/hooks/use-patients"
import { useOrganizationDentalRecords } from "@/hooks/use-dental"
import type { DentalRecord } from "@/adapters/dental.adapter"
import {
  Search,
  User,
  CalendarPlus,
  FileHeart,
  ChevronRight,
  UserPlus,
  Stethoscope,
} from "lucide-react"

interface SelectPatientDentalModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SelectPatientDentalModal({
  open,
  onOpenChange,
}: SelectPatientDentalModalProps) {
  const router = useRouter()
  const { data: patients = [], isLoading: patientsLoading } = usePatients()
  const { data: records = [], isLoading: recordsLoading } = useOrganizationDentalRecords()

  const [search, setSearch] = useState("")

  const isLoading = patientsLoading || recordsLoading

  // Mapa de historias clínicas odontológicas activas por paciente
  const recordsMap = useMemo(() => {
    const map = new Map<string, DentalRecord>()
    records.forEach((r) => {
      if (r.isActive) {
        map.set(r.patientId, r)
      }
    })
    return map
  }, [records])

  // Filtro de búsqueda por nombre, cédula o correo
  const filteredPatients = useMemo(() => {
    if (!search.trim()) return patients
    const q = search.trim().toLowerCase()
    return patients.filter((p) => {
      const nameMatch = p.fullName.toLowerCase().includes(q)
      const idMatch = p.idNumber ? p.idNumber.toLowerCase().includes(q) : false
      const emailMatch = p.email ? p.email.toLowerCase().includes(q) : false
      return nameMatch || idMatch || emailMatch
    })
  }, [patients, search])

  function handleSelectPatient(patientId: string) {
    onOpenChange(false)
    router.push(`/dashboard/patients/${patientId}/dental`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5 text-primary" />
            Nueva consulta odontológica
          </DialogTitle>
          <DialogDescription>
            Busca y selecciona el paciente para ingresar a su cita o iniciar su historia clínica odontológica.
          </DialogDescription>
        </DialogHeader>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, cédula o correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>

        {/* Lista de pacientes scrolleable */}
        <div className="max-h-[360px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-2 py-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-60" />
                  </div>
                  <Skeleton className="h-6 w-24" />
                </div>
              ))}
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-10 w-10 text-muted-foreground/60" />
              <p className="mt-2 text-sm font-medium">No se encontraron pacientes</p>
              <p className="text-xs text-muted-foreground">
                {search
                  ? `No hay coincidencias para "${search}".`
                  : "No hay pacientes registrados en la organización."}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                render={<Link href="/dashboard/patients/new" />}
                onClick={() => onOpenChange(false)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Registrar nuevo paciente
              </Button>
            </div>
          ) : (
            <div className="space-y-2 py-1">
              {filteredPatients.map((patient) => {
                const record = recordsMap.get(patient.id)
                const hasRecord = !!record

                return (
                  <div
                    key={patient.id}
                    onClick={() => handleSelectPatient(patient.id)}
                    className="group flex cursor-pointer items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:border-primary/50 hover:bg-accent/60"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium leading-snug">
                          {patient.fullName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {patient.idTypeLabel}: {patient.idNumber}
                          {patient.email ? ` · ${patient.email}` : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {hasRecord ? (
                        <Badge
                          variant="outline"
                          className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300 flex items-center gap-1"
                        >
                          <CalendarPlus className="h-3 w-3" />
                          <span>Ir a cita</span>
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-1"
                        >
                          <FileHeart className="h-3 w-3" />
                          <span>Abrir historia</span>
                        </Badge>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <span>
            {filteredPatients.length}{" "}
            {filteredPatients.length === 1 ? "paciente encontrado" : "pacientes encontrados"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
