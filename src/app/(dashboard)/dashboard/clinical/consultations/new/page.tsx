"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { usePatients } from "@/hooks/use-patients"
import { useMyClinics } from "@/hooks/use-organizations"
import {
  usePatientOrgMedicalRecord,
  useCreateMedicalRecord,
  useCreateConsultation,
  useLatestVitalSigns,
} from "@/hooks/use-clinical"
import { MedicalHistoryCard } from "@/components/clinical/medical-history-card"
import {
  ArrowLeft,
  Search,
  UserRound,
  Building2,
  Stethoscope,
  Heart,
  Thermometer,
  Activity,
} from "lucide-react"

export default function NewConsultationPage() {
  const router = useRouter()
  const { data: patients = [], isLoading: loadingPatients } = usePatients()
  const { data: clinics = [], isLoading: loadingClinics } = useMyClinics()
  const createRecord = useCreateMedicalRecord()
  const createConsultation = useCreateConsultation()

  const [search, setSearch] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [step, setStep] = useState<"select" | "form">("select")
  const [medicalRecordId, setMedicalRecordId] = useState("")
  const [isNewRecord, setIsNewRecord] = useState(false)

  // Auto-select clinic if only one
  const effectiveClinicId = clinics.length === 1 ? clinics[0].id : (selectedClinicId ?? "")

  useEffect(() => {
    if (clinics.length === 1 && !selectedClinicId) {
      setSelectedClinicId(clinics[0].id)
    }
  }, [clinics, selectedClinicId])

  // Look up existing medical record for the patient in this organization
  const {
    data: existingRecord,
    isLoading: loadingRecord,
  } = usePatientOrgMedicalRecord(selectedPatientId)

  // Get latest vital signs if we have a medical record
  const { data: latestVitals } = useLatestVitalSigns(existingRecord?.id ?? "")

  const selectedPatient = patients.find((p) => p.id === selectedPatientId)

  const filteredPatients = useMemo(() => {
    if (!search) return []
    const q = search.toLowerCase()
    return patients
      .filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.idNumber.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [patients, search])

  const [formData, setFormData] = useState({
    reasonForVisit: "",
    currentIllness: "",
    physicalExamination: "",
    diagnosisCode: "",
    diagnosisDescription: "",
    procedures: "",
    treatment: "",
    notes: "",
  })

  function updateField(key: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
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

  async function handleProceed() {
    if (!selectedPatientId || !effectiveClinicId) {
      toast.error("Selecciona un paciente y un consultorio")
      return
    }

    if (existingRecord) {
      setMedicalRecordId(existingRecord.id)
      setIsNewRecord(false)
      setStep("form")
    } else {
      try {
        const record = await createRecord.mutateAsync({
          patientId: selectedPatientId,
          clinicId: effectiveClinicId,
        })
        setMedicalRecordId(record.id)
        setIsNewRecord(true)
        setStep("form")
        toast.success("Historia clínica creada automáticamente")
      } catch {
        toast.error("Error al crear la historia clínica")
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.reasonForVisit.trim()) {
      toast.error("El motivo de consulta es requerido")
      return
    }

    try {
      const result = await createConsultation.mutateAsync({
        medicalRecordId,
        clinicId: effectiveClinicId,
        reasonForVisit: formData.reasonForVisit,
        currentIllness: formData.currentIllness || undefined,
        physicalExamination: formData.physicalExamination || undefined,
        diagnosisCode: formData.diagnosisCode || undefined,
        diagnosisDescription: formData.diagnosisDescription || undefined,
        procedures: formData.procedures || undefined,
        treatment: formData.treatment || undefined,
        notes: formData.notes || undefined,
      })
      toast.success("Consulta creada exitosamente")
      router.push(`/dashboard/clinical/consultations/${result.id}`)
    } catch {
      toast.error("Error al crear la consulta")
    }
  }

  const isPending = createRecord.isPending || createConsultation.isPending
  const canProceed = selectedPatientId && effectiveClinicId && !isPending && !loadingRecord

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/dashboard/clinical/consultations" />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nueva consulta</h1>
          {step === "form" && selectedPatient && (
            <p className="text-sm text-muted-foreground">
              Completa los datos de la consulta
            </p>
          )}
        </div>
      </div>

      {step === "select" ? (
        <div className="space-y-6">
          {/* Patient search */}
          <Card className="overflow-visible">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="h-5 w-5" />
                Paciente
              </CardTitle>
              <CardDescription>
                Busca al paciente por nombre o número de cédula
              </CardDescription>
            </CardHeader>
            <CardContent className="overflow-visible">
              {loadingPatients ? (
                <Skeleton className="h-10 w-full" />
              ) : selectedPatient ? (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <UserRound className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{selectedPatient.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPatient.idNumber}
                        {selectedPatient.phone && ` · ${selectedPatient.phone}`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleClearPatient}>
                    Cambiar
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nombre o cédula..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                      autoFocus
                    />
                  </div>
                  {search && filteredPatients.length === 0 && (
                    <p className="text-sm text-muted-foreground py-2 text-center">
                      No se encontraron pacientes
                    </p>
                  )}
                  {search && filteredPatients.length > 0 && (
                    <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border">
                      {filteredPatients.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectPatient(p.id)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                            <UserRound className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {p.fullName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {p.idNumber}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Clinic selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Consultorio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingClinics ? (
                <Skeleton className="h-10 w-full" />
              ) : clinics.length === 1 ? (
                <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                  <span className="font-medium">{clinics[0].name}</span>
                </div>
              ) : (
                <Select
                  value={selectedClinicId}
                  onValueChange={(v) => setSelectedClinicId(v)}
                  items={Object.fromEntries(clinics.map((c) => [c.id, c.name]))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un consultorio" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          {/* Latest vital signs preview */}
          {selectedPatientId && effectiveClinicId && latestVitals && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Últimos signos vitales
                </CardTitle>
                <CardDescription>
                  Registrados por {latestVitals.recordedByName} — {latestVitals.recordedAtFormatted}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {latestVitals.bloodPressure && (
                    <VitalItem icon={<Heart className="h-4 w-4 text-red-500" />} label="Presión" value={latestVitals.bloodPressure} />
                  )}
                  {latestVitals.heartRate != null && (
                    <VitalItem icon={<Heart className="h-4 w-4 text-red-500" />} label="FC" value={`${latestVitals.heartRate} bpm`} />
                  )}
                  {latestVitals.temperature != null && (
                    <VitalItem icon={<Thermometer className="h-4 w-4 text-orange-500" />} label="Temp" value={`${latestVitals.temperature}°C`} />
                  )}
                  {latestVitals.oxygenSaturation != null && (
                    <VitalItem icon={<Activity className="h-4 w-4 text-blue-500" />} label="SpO₂" value={`${latestVitals.oxygenSaturation}%`} />
                  )}
                  {latestVitals.weight != null && (
                    <VitalItem icon={<Activity className="h-4 w-4 text-purple-500" />} label="Peso" value={`${latestVitals.weight} kg`} />
                  )}
                  {latestVitals.height != null && (
                    <VitalItem icon={<Activity className="h-4 w-4 text-green-500" />} label="Talla" value={`${latestVitals.height} cm`} />
                  )}
                  {latestVitals.bmi != null && (
                    <VitalItem
                      icon={<Activity className="h-4 w-4" />}
                      label="IMC"
                      value={`${latestVitals.bmi.toFixed(1)}`}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Proceed button */}
          <div className="flex justify-end">
            <Button
              size="lg"
              onClick={handleProceed}
              disabled={!canProceed}
            >
              <Stethoscope className="mr-2 h-4 w-4" />
              {isPending ? "Preparando..." : "Iniciar consulta"}
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient summary bar */}
          {selectedPatient && (
            <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
              <UserRound className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{selectedPatient.fullName}</span>
              <span className="text-sm text-muted-foreground">({selectedPatient.idNumber})</span>
              {clinics.length === 1 ? (
                <span className="ml-auto text-sm text-muted-foreground">{clinics[0].name}</span>
              ) : (
                <span className="ml-auto text-sm text-muted-foreground">
                  {clinics.find((c) => c.id === effectiveClinicId)?.name}
                </span>
              )}
            </div>
          )}

          {/* Antecedentes — expanded edit for new records, collapsible for existing */}
          {medicalRecordId && (
            <MedicalHistoryCard
              medicalRecordId={medicalRecordId}
              isNew={isNewRecord}
              record={isNewRecord ? undefined : existingRecord}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle>Motivo de consulta</CardTitle>
              <CardDescription>
                Razón principal por la que el paciente asiste
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reasonForVisit">Motivo de consulta *</Label>
                <Textarea
                  id="reasonForVisit"
                  value={formData.reasonForVisit}
                  onChange={(e) => updateField("reasonForVisit", e.target.value)}
                  placeholder="Describa el motivo principal de la consulta"
                  rows={3}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentIllness">Enfermedad actual</Label>
                <Textarea
                  id="currentIllness"
                  value={formData.currentIllness}
                  onChange={(e) => updateField("currentIllness", e.target.value)}
                  placeholder="Descripción de la enfermedad actual"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Examen y diagnóstico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="physicalExamination">Examen físico</Label>
                <Textarea
                  id="physicalExamination"
                  value={formData.physicalExamination}
                  onChange={(e) =>
                    updateField("physicalExamination", e.target.value)
                  }
                  placeholder="Hallazgos del examen físico"
                  rows={3}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="diagnosisCode">Código CIE-10</Label>
                  <Input
                    id="diagnosisCode"
                    value={formData.diagnosisCode}
                    onChange={(e) =>
                      updateField("diagnosisCode", e.target.value)
                    }
                    placeholder="Ej: J06.9"
                    maxLength={10}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diagnosisDescription">
                    Descripción del diagnóstico
                  </Label>
                  <Input
                    id="diagnosisDescription"
                    value={formData.diagnosisDescription}
                    onChange={(e) =>
                      updateField("diagnosisDescription", e.target.value)
                    }
                    placeholder="Diagnóstico descriptivo"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tratamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="procedures">Procedimientos realizados</Label>
                <Textarea
                  id="procedures"
                  value={formData.procedures}
                  onChange={(e) => updateField("procedures", e.target.value)}
                  placeholder="Procedimientos aplicados durante la consulta"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment">Plan de tratamiento</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => updateField("treatment", e.target.value)}
                  placeholder="Indicaciones y plan de tratamiento"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  placeholder="Observaciones o notas adicionales"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep("select")}
              disabled={isPending}
            >
              Volver
            </Button>
            <Button type="submit" disabled={isPending}>
              <Stethoscope className="mr-2 h-4 w-4" />
              {isPending ? "Creando..." : "Crear consulta"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

function VitalItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border p-2">
      {icon}
      <div>
        <p className="text-[10px] text-muted-foreground leading-none">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
