"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePatients } from "@/hooks/use-patients"
import {
  usePatientOrgMedicalRecord,
  useCreateMedicalRecord,
} from "@/hooks/use-clinical"
import { VitalSignsCard } from "@/components/clinical/vital-signs-card"
import { MedicalHistoryCard } from "@/components/clinical/medical-history-card"
import { Activity, Search, UserRound } from "lucide-react"
import { toast } from "sonner"

export default function VitalSignsPage() {
  const { data: patients = [], isLoading: patientsLoading } = usePatients()
  const createRecordMutation = useCreateMedicalRecord()

  const [search, setSearch] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [medicalRecordId, setMedicalRecordId] = useState<string>("")
  const [isNewRecord, setIsNewRecord] = useState(false)

  const {
    data: medicalRecord,
    isLoading: recordLoading,
  } = usePatientOrgMedicalRecord(selectedPatientId)

  // Set medical record ID when found
  if (medicalRecord && medicalRecord.id !== medicalRecordId) {
    setMedicalRecordId(medicalRecord.id)
    setIsNewRecord(false)
  }

  const filteredPatients = useMemo(() => {
    if (!search) return patients.slice(0, 10)
    const q = search.toLowerCase()
    return patients.filter(
      (p) =>
        p.fullName.toLowerCase().includes(q) ||
        p.idNumber.toLowerCase().includes(q)
    ).slice(0, 10)
  }, [patients, search])

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  async function handleCreateRecord() {
    if (!selectedPatientId) return
    try {
      const record = await createRecordMutation.mutateAsync({
        patientId: selectedPatientId,
      })
      setMedicalRecordId(record.id)
      setIsNewRecord(true)
      toast.success("Historia clínica creada")
    } catch {
      toast.error("Error al crear la historia clínica")
    }
  }

  function handleSelectPatient(patientId: string) {
    setSelectedPatientId(patientId)
    setMedicalRecordId("")
    setIsNewRecord(false)
    setSearch("")
  }

  function handleClearPatient() {
    setSelectedPatientId("")
    setMedicalRecordId("")
    setIsNewRecord(false)
    setSearch("")
  }

  const showMedicalRecord = !!selectedPatientId
  const noRecordFound = showMedicalRecord && !recordLoading && !medicalRecord && !medicalRecordId

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Signos vitales</h1>
        <p className="text-muted-foreground">
          Registra los signos vitales del paciente
        </p>
      </div>

      {/* Patient search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserRound className="h-5 w-5" />
            Paciente
          </CardTitle>
          <CardDescription>Busca y selecciona al paciente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedPatient ? (
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
              <div>
                <p className="font-medium">{selectedPatient.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedPatient.idNumber}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClearPatient}>
                Cambiar
              </Button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o cédula..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              {patientsLoading ? (
                <Skeleton className="h-20 w-full" />
              ) : search && filteredPatients.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  No se encontraron pacientes
                </p>
              ) : search ? (
                <div className="max-h-48 space-y-1 overflow-y-auto">
                  {filteredPatients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPatient(p.id)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                    >
                      <span className="font-medium">{p.fullName}</span>
                      <span className="text-muted-foreground text-xs">
                        {p.idNumber}
                      </span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      {/* Show vital signs or create medical record */}
      {showMedicalRecord && (
        <>
          {recordLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : noRecordFound ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Activity className="mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Este paciente no tiene historia clínica
                </p>
                <Button
                  onClick={handleCreateRecord}
                  disabled={createRecordMutation.isPending}
                >
                  {createRecordMutation.isPending
                    ? "Creando..."
                    : "Crear historia clínica"}
                </Button>
              </CardContent>
            </Card>
          ) : medicalRecordId ? (
            <>
              {/* Antecedentes card — expanded for new records, collapsible for existing */}
              <MedicalHistoryCard
                medicalRecordId={medicalRecordId}
                isNew={isNewRecord}
                record={isNewRecord ? undefined : medicalRecord}
              />
              <VitalSignsCard medicalRecordId={medicalRecordId} canAdd={true} />
            </>
          ) : null}
        </>
      )}

      {!selectedPatientId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Activity className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Selecciona un paciente para registrar signos vitales
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
