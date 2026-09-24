"use client"

import { FormEvent, use, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Activity, Calendar, Eye, FileHeart, History, Plus, Save, Sparkles, Stethoscope, User, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { OdontogramEditor } from "@/components/dental/odontogram-editor"
import { StomatognathicExamEditor } from "@/components/dental/stomatognathic-exam-editor"
import { useMyClinics } from "@/hooks/use-organizations"
import { usePatient } from "@/hooks/use-patients"
import {
  useCreateDentalDate,
  useCreateDentalRecord,
  useCreateOdontogramVersion,
  useCurrentOdontogramVersion,
  useDentalDates,
  useOdontogramVersions,
  usePatientOrgDentalRecord,
} from "@/hooks/use-dental"
import type { DentalPatientType, OdontogramState } from "@/types/dental.model"

interface DentalPageProps {
  params: Promise<{ id: string }>
}

const EMPTY_ODONTOGRAM: OdontogramState = {
  teeth: {},
  prosthesisGroups: [],
  warnings: [],
}

export default function PatientDentalPage({ params }: DentalPageProps) {
  const { id } = use(params)
  const { data: patient, isLoading: patientLoading } = usePatient(id)
  const { data: clinics = [] } = useMyClinics()
  const {
    data: dentalRecord,
    isLoading: recordLoading,
  } = usePatientOrgDentalRecord(id)

  if (patientLoading || recordLoading) {
    return <DentalSkeleton />
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" render={<Link href={`/dashboard/dental`} />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">Odontología</h1>
              {dentalRecord ? (
                <Badge variant={dentalRecord.isActive ? "default" : "secondary"}>
                  {dentalRecord.isActive ? "Historia activa" : "Historia inactiva"}
                </Badge>
              ) : (
                <Badge variant="secondary">Sin historia odontológica</Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {patient.fullName} · {patient.idTypeLabel}: {patient.idNumber}
            </p>
          </div>
        </div>

        {dentalRecord && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" render={<Link href={`/dashboard/patients/${id}/dental/record`} />}>
              <FileHeart className="mr-1.5 h-4 w-4" />
              Ver apertura de historia
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Summary icon={<User className="h-4 w-4" />} label="Paciente" value={patient.fullName} />
        <Summary icon={<Calendar className="h-4 w-4" />} label="Edad" value={patient.age !== null ? `${patient.age} años` : "Sin registrar"} />
        <Summary icon={<FileHeart className="h-4 w-4" />} label="Historia" value={dentalRecord?.recordNumber ?? "Pendiente"} />
        <Summary icon={<FileHeart className="h-4 w-4" />} label="Odontograma" value={dentalRecord ? "Versionado" : "Requiere versión inicial"} />
      </div>

      {!dentalRecord ? (
        <CreateDentalRecordForm patientId={id} clinics={clinics} patientAge={patient.age} />
      ) : (
        <DentalWorkspace dentalRecordId={dentalRecord.id} clinics={clinics} patientAge={patient.age} />
      )}
    </div>
  )
}

function CreateDentalRecordForm({
  patientId,
  clinics,
  patientAge,
}: {
  patientId: string
  clinics: Array<{ id: string; name: string }>
  patientAge?: number | null
}) {
  const createRecord = useCreateDentalRecord()
  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "")
  const [openingReason, setOpeningReason] = useState("")
  const [currentIllness, setCurrentIllness] = useState("")
  const [odontologicalHistory, setOdontologicalHistory] = useState("")
  const [familyHistory, setFamilyHistory] = useState("")
  const [pathologicalHistory, setPathologicalHistory] = useState("")
  const [medicalAlerts, setMedicalAlerts] = useState("")
  const [patientType, setPatientType] = useState<DentalPatientType>("AMBULATORY")
  const [observations, setObservations] = useState("")
  const [stomatognathicExam, setStomatognathicExam] = useState("")
  const [systolicPressure, setSystolicPressure] = useState("")
  const [diastolicPressure, setDiastolicPressure] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [respiratoryRate, setRespiratoryRate] = useState("")
  const [temperature, setTemperature] = useState("")
  const [oxygenSaturation, setOxygenSaturation] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [odontogramState, setOdontogramState] = useState<OdontogramState>(EMPTY_ODONTOGRAM)

  function parseNumber(val: string): number | undefined {
    const trimmed = val.trim()
    if (!trimmed) return undefined
    const num = Number(trimmed)
    return isNaN(num) ? undefined : num
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stomatognathicExam.trim()) {
      toast.error("Debe registrar al menos un ítem en el Examen del sistema estomatognático")
      return
    }

    try {
      await createRecord.mutateAsync({
        patientId,
        clinicId: clinicId || undefined,
        openingReason,
        currentIllness: currentIllness || undefined,
        odontologicalHistory: odontologicalHistory || undefined,
        familyHistory: familyHistory || undefined,
        pathologicalHistory: pathologicalHistory || undefined,
        medicalAlerts: medicalAlerts || undefined,
        patientType,
        stomatognathicExam: stomatognathicExam.trim(),
        observations: observations || undefined,
        systolicPressure: parseNumber(systolicPressure),
        diastolicPressure: parseNumber(diastolicPressure),
        heartRate: parseNumber(heartRate),
        respiratoryRate: parseNumber(respiratoryRate),
        temperature: parseNumber(temperature),
        oxygenSaturation: parseNumber(oxygenSaturation),
        weight: parseNumber(weight),
        height: parseNumber(height),
        initialOdontogramData: odontogramState,
        initialOdontogramNotes: "Versión inicial",
      })
      toast.success("Historia odontológica creada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la historia odontológica")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileHeart className="h-5 w-5" />
            Apertura de historia odontológica
          </CardTitle>
          <CardDescription>
            Esta información se registra una sola vez y no se repetirá en cada cita.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <Field label="Consultorio">
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={clinicId} onChange={(e) => setClinicId(e.target.value)}>
              <option value="">Sin consultorio de apertura</option>
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de paciente">
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={patientType} onChange={(e) => setPatientType(e.target.value as DentalPatientType)}>
              <option value="AMBULATORY">Ambulatorio</option>
              <option value="HOSPITALIZATION">Hospitalización</option>
            </select>
          </Field>
          <Field label="Motivo inicial de atención">
            <Textarea required value={openingReason} onChange={(e) => setOpeningReason(e.target.value)} placeholder="Paciente acude por..." />
          </Field>
          <Field label="Enfermedad actual">
            <Textarea value={currentIllness} onChange={(e) => setCurrentIllness(e.target.value)} placeholder="Resumen del odontólogo sobre el estado actual" />
          </Field>
          <Field label="Antecedentes patológicos">
            <Textarea value={pathologicalHistory} onChange={(e) => setPathologicalHistory(e.target.value)} placeholder="Enfermedades sistémicas previas o actuales, cirugías, alergias, etc." />
          </Field>
          <Field label="Antecedentes familiares">
            <Textarea value={familyHistory} onChange={(e) => setFamilyHistory(e.target.value)} placeholder="Antecedentes médicos y bucodentales relevantes en la familia" />
          </Field>
          <Field label="Antecedentes odontológicos">
            <Textarea value={odontologicalHistory} onChange={(e) => setOdontologicalHistory(e.target.value)} placeholder="Tratamientos odontológicos previos, ortodoncia, extracciones..." />
          </Field>
          <Field label="Alertas médicas relevantes">
            <Textarea value={medicalAlerts} onChange={(e) => setMedicalAlerts(e.target.value)} placeholder="Alergias a fármacos, anestésicos, hipertensión, diabetes, etc." />
          </Field>
          <div className="md:col-span-2">
            <Field label="Observaciones generales">
              <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} placeholder="Notas adicionales sobre la apertura" />
            </Field>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Signos vitales
            </CardTitle>
            <Badge variant="outline" className="text-xs font-normal">
              Opcional
            </Badge>
          </div>
          <CardDescription>
            Registro de signos vitales basales o de control tomados en la apertura.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Presión sistólica (mmHg)">
            <Input
              type="number"
              value={systolicPressure}
              onChange={(e) => setSystolicPressure(e.target.value)}
              placeholder="120"
            />
          </Field>
          <Field label="Presión diastólica (mmHg)">
            <Input
              type="number"
              value={diastolicPressure}
              onChange={(e) => setDiastolicPressure(e.target.value)}
              placeholder="80"
            />
          </Field>
          <Field label="Frecuencia cardíaca (lpm)">
            <Input
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
              placeholder="72"
            />
          </Field>
          <Field label="Frecuencia respiratoria (rpm)">
            <Input
              type="number"
              value={respiratoryRate}
              onChange={(e) => setRespiratoryRate(e.target.value)}
              placeholder="16"
            />
          </Field>
          <Field label="Temperatura (°C)">
            <Input
              type="number"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              placeholder="36.5"
            />
          </Field>
          <Field label="Saturación SpO₂ (%)">
            <Input
              type="number"
              value={oxygenSaturation}
              onChange={(e) => setOxygenSaturation(e.target.value)}
              placeholder="98"
            />
          </Field>
          <Field label="Peso (kg)">
            <Input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
            />
          </Field>
          <Field label="Talla (cm)">
            <Input
              type="number"
              step="0.1"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
            />
          </Field>
        </CardContent>
      </Card>

      <StomatognathicExamEditor
        value={stomatognathicExam}
        onChange={setStomatognathicExam}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileHeart className="h-5 w-5" />
            Odontograma inicial
          </CardTitle>
          <CardDescription>
            Es obligatorio guardar una versión inicial, pero puede estar en blanco.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OdontogramEditor value={odontogramState} onChange={setOdontogramState} patientAge={patientAge} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" render={<Link href={`/dashboard/patients/${patientId}`} />}>
          Cancelar
        </Button>
        <Button type="submit" disabled={createRecord.isPending}>
          <Save className="mr-2 h-4 w-4" />
          Crear historia odontológica
        </Button>
      </div>
    </form>
  )
}

function DentalWorkspace({
  dentalRecordId,
  clinics,
  patientAge,
}: {
  dentalRecordId: string
  clinics: Array<{ id: string; name: string }>
  patientAge?: number | null
}) {
  const { data: versions = [] } = useOdontogramVersions(dentalRecordId)
  const { data: currentVersion } = useCurrentOdontogramVersion(dentalRecordId)
  const { data: dates = [] } = useDentalDates(dentalRecordId)
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null)

  const currentData = useMemo(
    () => (currentVersion?.data ?? EMPTY_ODONTOGRAM) as OdontogramState,
    [currentVersion]
  )

  const nextSessionNumber = useMemo(
    () => (dates.length > 0 ? Math.max(...dates.map((d) => d.sessionNumber)) + 1 : 1),
    [dates]
  )

  const previewVersion =
    versions.find((version) => version.id === previewVersionId) ??
    (currentVersion && previewVersionId === currentVersion.id ? currentVersion : null)

  const createDate = useCreateDentalDate(dentalRecordId)
  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "")
  const [diagnosisAndComplications, setDiagnosisAndComplications] = useState("")
  const [procedureText, setProcedureText] = useState("")
  const [prescriptionsOrRecommendations, setPrescriptionsOrRecommendations] = useState("")
  const [notes, setNotes] = useState("")
  const [editOdontogram, setEditOdontogram] = useState(false)
  const [odontogramState, setOdontogramState] = useState<OdontogramState>(currentData)
  const odontogramChanged = editOdontogram && JSON.stringify(odontogramState) !== JSON.stringify(currentData)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await createDate.mutateAsync({
        clinicId,
        diagnosisAndComplications,
        procedureText,
        prescriptionsOrRecommendations: prescriptionsOrRecommendations || undefined,
        notes: notes || undefined,
        status: "DRAFT",
        odontogramData: odontogramChanged ? odontogramState : undefined,
        odontogramNotes: odontogramChanged ? "Cambio desde cita odontológica" : undefined,
      })
      setDiagnosisAndComplications("")
      setProcedureText("")
      setPrescriptionsOrRecommendations("")
      setNotes("")
      setEditOdontogram(false)
      setOdontogramState(currentData)
      toast.success("Cita odontológica guardada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la cita")
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Fila superior de 2 columnas */}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* Columna Izquierda: Formulario de Nueva Cita */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nueva cita odontológica
              </CardTitle>
              <CardDescription>
                Formulario breve de sesión. El motivo inicial pertenece a la apertura de historia.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Consultorio">
                  <select
                    required
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    value={clinicId}
                    onChange={(e) => setClinicId(e.target.value)}
                  >
                    <option value="">Seleccionar consultorio</option>
                    {clinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Número de sesión">
                  <Input value={`Sesión #${nextSessionNumber}`} disabled className="bg-muted font-medium" />
                </Field>
                <Field label="Diagnóstico y complicaciones">
                  <Textarea
                    required
                    value={diagnosisAndComplications}
                    onChange={(e) => setDiagnosisAndComplications(e.target.value)}
                  />
                </Field>
                <Field label="Procedimiento">
                  <Textarea
                    required
                    value={procedureText}
                    onChange={(e) => setProcedureText(e.target.value)}
                  />
                </Field>
                <Field label="Prescripciones o recomendaciones">
                  <Textarea
                    value={prescriptionsOrRecommendations}
                    onChange={(e) => setPrescriptionsOrRecommendations(e.target.value)}
                  />
                </Field>
                <Field label="Notas">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </Field>
              </div>

              {!editOdontogram ? (
                <div className="rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4 transition-all hover:border-primary/50">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <FileHeart className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">¿Deseas registrar cambios en el Odontograma?</p>
                        <p className="text-xs text-muted-foreground">
                          Abre el editor para registrar hallazgos o tratamientos dentales en esta sesión.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-primary/50 text-primary hover:bg-primary hover:text-white shrink-0 font-medium cursor-pointer shadow-sm transition-all"
                      onClick={() => {
                        setOdontogramState(currentData)
                        setEditOdontogram(true)
                      }}
                    >
                      <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
                      Editar odontograma en esta cita
                    </Button>
                  </div>
                </div>
              ) : null}

              {!editOdontogram && (
                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={createDate.isPending || !clinicId} className="cursor-pointer">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Guardar cita odontológica
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Columna Derecha: Odontograma actual e Historial scrollable */}
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileHeart className="h-5 w-5" />
                  Odontograma actual
                </CardTitle>
                <CardDescription>Base para nuevas citas.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-md border bg-muted/30 p-3 text-sm space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Versión actual:</span>
                    <Badge variant="default">
                      {currentVersion ? `#${currentVersion.versionNumber}` : "Sin versión"}
                    </Badge>
                  </div>
                  {currentVersion?.createdAtFormatted && (
                    <p className="text-xs text-muted-foreground">
                      Actualizado: {currentVersion.createdAtFormatted}
                    </p>
                  )}
                  {currentVersion?.createdByName && (
                    <p className="text-xs text-muted-foreground">
                      Por: {currentVersion.createdByName}
                    </p>
                  )}
                  {currentVersion?.notes && (
                    <p className="text-xs text-muted-foreground italic">
                      &ldquo;{currentVersion.notes}&rdquo;
                    </p>
                  )}
                </div>

                {currentVersion && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-center cursor-pointer"
                    onClick={() => setPreviewVersionId(currentVersion.id)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Ver odontograma
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Historial de versiones</CardTitle>
                  <Badge variant="outline">{versions.length} {versions.length === 1 ? "versión" : "versiones"}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {versions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No hay versiones registradas.</p>
                ) : (
                  <div className="max-h-[220px] overflow-y-auto space-y-2 pr-1">
                    {versions.map((version) => (
                      <button
                        key={version.id}
                        type="button"
                        onClick={() => setPreviewVersionId(version.id)}
                        className="w-full rounded-md border p-2.5 text-left text-sm hover:bg-muted/50 transition-colors cursor-pointer block"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">Versión #{version.versionNumber}</span>
                          {version.isCurrent && <Badge className="text-xs">Actual</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{version.createdAtFormatted}</p>
                        {version.notes && <p className="mt-0.5 text-xs text-muted-foreground truncate">{version.notes}</p>}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cuadro de Edición de Odontograma a Pantalla Completa / Ancho Completo */}
        {editOdontogram && (
          <Card className="border-2 border-primary/40 shadow-md">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <FileHeart className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">Edición de Odontograma activa</CardTitle>
                      <Badge variant="default" className="text-xs">Modificando en esta cita</Badge>
                    </div>
                    <CardDescription className="text-xs">
                      Los cambios se guardarán automáticamente junto con los datos de esta sesión.
                    </CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive cursor-pointer"
                  onClick={() => {
                    setEditOdontogram(false)
                    setOdontogramState(currentData)
                  }}
                >
                  <X className="mr-1.5 h-4 w-4" />
                  Descartar cambios del odontograma
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <OdontogramEditor
                value={odontogramState}
                onChange={setOdontogramState}
                patientAge={patientAge}
              />
              <div className="flex justify-end border-t pt-4">
                <Button type="submit" disabled={createDate.isPending || !clinicId} className="cursor-pointer">
                  <Stethoscope className="mr-2 h-4 w-4" />
                  Guardar cita odontológica con odontograma
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>

      {/* Historial de Citas Odontológicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Citas odontológicas
          </CardTitle>
          <CardDescription>Sesiones registradas para esta historia odontológica.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dates.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay citas odontológicas registradas.</p>
          ) : (
            dates.map((date) => (
              <div key={date.id} className="rounded-md border p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">Sesión {date.sessionNumber}</p>
                    <p className="text-sm text-muted-foreground">{date.sessionDateFormatted} · {date.clinicName}</p>
                  </div>
                  <Badge className={date.statusColor}>{date.statusLabel}</Badge>
                </div>
                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  <InfoBlock label="Diagnóstico y complicaciones" value={date.diagnosisAndComplications} />
                  <InfoBlock label="Procedimiento" value={date.procedureText} />
                  <InfoBlock label="Prescripciones" value={date.prescriptionsOrRecommendations} />
                  <InfoBlock label="Notas" value={date.notes} />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Modal de Previsualización para cualquier versión */}
      {previewVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg border bg-background p-5 shadow-lg space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-lg font-semibold">Odontograma versión #{previewVersion.versionNumber}</h2>
                <p className="text-sm text-muted-foreground">
                  {previewVersion.createdAtFormatted} · {previewVersion.createdByName}
                </p>
              </div>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setPreviewVersionId(null)}>
                Cerrar
              </Button>
            </div>
            <OdontogramEditor value={previewVersion.data as OdontogramState} onChange={() => undefined} patientAge={patientAge} readOnly />
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

function Summary({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-6">
        <div className="text-muted-foreground">{icon}</div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-medium">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-wrap">{value || "-"}</p>
    </div>
  )
}

function DentalSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  )
}






