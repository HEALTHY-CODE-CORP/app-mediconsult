"use client"

import { FormEvent, use, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Calendar, FileHeart, History, Plus, Save, Stethoscope, User } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { OdontogramEditor } from "@/components/dental/odontogram-editor"
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
          <Button variant="ghost" size="icon-sm" render={<Link href={`/dashboard/patients/${id}`} />}>
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
  const [medicalAlerts, setMedicalAlerts] = useState("")
  const [patientType, setPatientType] = useState<DentalPatientType>("AMBULATORY")
  const [observations, setObservations] = useState("")
  const [odontogramState, setOdontogramState] = useState<OdontogramState>(EMPTY_ODONTOGRAM)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await createRecord.mutateAsync({
        patientId,
        clinicId: clinicId || undefined,
        openingReason,
        currentIllness: currentIllness || undefined,
        odontologicalHistory: odontologicalHistory || undefined,
        medicalAlerts: medicalAlerts || undefined,
        patientType,
        observations: observations || undefined,
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
          <Field label="Antecedentes odontológicos">
            <Textarea value={odontologicalHistory} onChange={(e) => setOdontologicalHistory(e.target.value)} />
          </Field>
          <Field label="Alertas médicas relevantes">
            <Textarea value={medicalAlerts} onChange={(e) => setMedicalAlerts(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Observaciones generales">
              <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} />
            </Field>
          </div>
        </CardContent>
      </Card>

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
  const createVersion = useCreateOdontogramVersion(dentalRecordId)
  const [versionData, setVersionData] = useState<OdontogramState | null>(null)
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null)

  const currentData = useMemo(
    () => (currentVersion?.data ?? EMPTY_ODONTOGRAM) as OdontogramState,
    [currentVersion]
  )

  const previewVersion = versions.find((version) => version.id === previewVersionId) ?? null
  const hasPendingOdontogramChange = JSON.stringify(versionData ?? currentData) !== JSON.stringify(currentData)

  async function handleSaveVersion() {
    try {
      await createVersion.mutateAsync({
        data: versionData ?? currentData,
        notes: "Edición manual del odontograma",
      })
      setVersionData(null)
      toast.success("Nueva versión de odontograma guardada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el odontograma")
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <CreateDentalDateForm dentalRecordId={dentalRecordId} clinics={clinics} currentData={currentData} patientAge={patientAge} />
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
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileHeart className="h-5 w-5" />
              Odontograma actual
            </CardTitle>
            <CardDescription>
              Base para nuevas citas. Si se edita, se crea otra versión.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted/30 p-3 text-sm">
              Versión actual: {currentVersion ? `#${currentVersion.versionNumber}` : "Sin versión"}
            </div>
            <OdontogramEditor
              value={versionData ?? currentData}
              onChange={setVersionData}
              patientAge={patientAge}
            />
            <Button className="w-full" onClick={handleSaveVersion} disabled={createVersion.isPending || !hasPendingOdontogramChange}>
              <Save className="mr-2 h-4 w-4" />
              Guardar nueva versión
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de odontogramas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {versions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay versiones registradas.</p>
            ) : (
              versions.map((version) => (
                <button
                  key={version.id}
                  type="button"
                  onClick={() => setPreviewVersionId(version.id)}
                  className="w-full rounded-md border p-3 text-left text-sm hover:bg-muted/50"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span>Versión #{version.versionNumber}</span>
                    {version.isCurrent && <Badge>Actual</Badge>}
                  </div>
                  <p className="text-muted-foreground">{version.createdAtFormatted}</p>
                  {version.notes && <p className="mt-1 text-xs text-muted-foreground">{version.notes}</p>}
                </button>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {previewVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg border bg-background p-5 shadow-lg">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Odontograma versión #{previewVersion.versionNumber}</h2>
                <p className="text-sm text-muted-foreground">
                  {previewVersion.createdAtFormatted} · {previewVersion.createdByName}
                </p>
              </div>
              <Button type="button" variant="outline" onClick={() => setPreviewVersionId(null)}>
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

function CreateDentalDateForm({
  dentalRecordId,
  clinics,
  currentData,
  patientAge,
}: {
  dentalRecordId: string
  clinics: Array<{ id: string; name: string }>
  currentData: OdontogramState
  patientAge?: number | null
}) {
  const createDate = useCreateDentalDate(dentalRecordId)
  const [clinicId, setClinicId] = useState(clinics[0]?.id ?? "")
  const [diagnosisAndComplications, setDiagnosisAndComplications] = useState("")
  const [procedureText, setProcedureText] = useState("")
  const [prescriptionsOrRecommendations, setPrescriptionsOrRecommendations] = useState("")
  const [notes, setNotes] = useState("")
  const [editOdontogram, setEditOdontogram] = useState(false)
  const [odontogramState, setOdontogramState] = useState<OdontogramState>(currentData)
  const odontogramChanged = editOdontogram && JSON.stringify(odontogramState) !== JSON.stringify(currentData)

  useEffect(() => {
    if (!editOdontogram) {
      setOdontogramState(currentData)
    }
  }, [currentData, editOdontogram])

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
      toast.success("Cita odontológica guardada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la cita")
    }
  }

  return (
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
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Consultorio">
              <select required className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={clinicId} onChange={(e) => setClinicId(e.target.value)}>
                <option value="">Seleccionar consultorio</option>
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>{clinic.name}</option>
                ))}
              </select>
            </Field>
            <Field label="Número de sesión">
              <Input value="Se asigna automáticamente" disabled />
            </Field>
            <Field label="Diagnóstico y complicaciones">
              <Textarea required value={diagnosisAndComplications} onChange={(e) => setDiagnosisAndComplications(e.target.value)} />
            </Field>
            <Field label="Procedimiento">
              <Textarea required value={procedureText} onChange={(e) => setProcedureText(e.target.value)} />
            </Field>
            <Field label="Prescripciones o recomendaciones">
              <Textarea value={prescriptionsOrRecommendations} onChange={(e) => setPrescriptionsOrRecommendations(e.target.value)} />
            </Field>
            <Field label="Notas">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>
          </div>

          <div className="rounded-md border p-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input type="checkbox" checked={editOdontogram} onChange={(e) => setEditOdontogram(e.target.checked)} />
              Editar odontograma en esta cita
            </label>
            {editOdontogram && (
              <div className="mt-3">
                <OdontogramEditor value={odontogramState} onChange={setOdontogramState} patientAge={patientAge} />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={createDate.isPending || !clinicId}>
              <Stethoscope className="mr-2 h-4 w-4" />
              Guardar cita odontológica
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
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






