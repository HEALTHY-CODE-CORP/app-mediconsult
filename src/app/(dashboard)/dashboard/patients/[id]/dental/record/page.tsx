"use client"

import { use, useState, FormEvent } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Clock3,
  FileHeart,
  FileText,
  Heart,
  Pencil,
  Save,
  ShieldAlert,
  Stethoscope,
  User,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { SummaryTile } from "@/components/shared/summary-tile"
import { OdontogramEditor } from "@/components/dental/odontogram-editor"
import { DentalVitalSignsCard } from "@/components/dental/dental-vital-signs-card"
import { StomatognathicExamEditor } from "@/components/dental/stomatognathic-exam-editor"
import { usePatient } from "@/hooks/use-patients"
import {
  usePatientOrgDentalRecord,
  useOdontogramVersions,
  useUpdateDentalRecord,
} from "@/hooks/use-dental"
import type { DentalPatientType, OdontogramState } from "@/types/dental.model"

interface DentalRecordPageProps {
  params: Promise<{ id: string }>
}

export default function PatientDentalRecordPage({ params }: DentalRecordPageProps) {
  const { id } = use(params)
  const { data: patient, isLoading: patientLoading } = usePatient(id)
  const { data: dentalRecord, isLoading: recordLoading } = usePatientOrgDentalRecord(id)
  const { data: versions = [] } = useOdontogramVersions(dentalRecord?.id ?? "")
  const updateMutation = useUpdateDentalRecord(dentalRecord?.id ?? "")

  const [isEditing, setIsEditing] = useState(false)
  const [openingReason, setOpeningReason] = useState("")
  const [currentIllness, setCurrentIllness] = useState("")
  const [odontologicalHistory, setOdontologicalHistory] = useState("")
  const [familyHistory, setFamilyHistory] = useState("")
  const [pathologicalHistory, setPathologicalHistory] = useState("")
  const [medicalAlerts, setMedicalAlerts] = useState("")
  const [patientType, setPatientType] = useState<DentalPatientType>("AMBULATORY")
  const [stomatognathicExam, setStomatognathicExam] = useState("")
  const [observations, setObservations] = useState("")
  const [previewInitialOdontogram, setPreviewInitialOdontogram] = useState(false)

  // Versión inicial del odontograma (versión #1)
  const initialVersion = versions.find((v) => v.versionNumber === 1) ?? versions[versions.length - 1] ?? null

  function startEditing() {
    if (!dentalRecord) return
    setOpeningReason(dentalRecord.openingReason)
    setCurrentIllness(dentalRecord.currentIllness ?? "")
    setOdontologicalHistory(dentalRecord.odontologicalHistory ?? "")
    setFamilyHistory(dentalRecord.familyHistory ?? "")
    setPathologicalHistory(dentalRecord.pathologicalHistory ?? "")
    setMedicalAlerts(dentalRecord.medicalAlerts ?? "")
    setPatientType(dentalRecord.patientType)
    setStomatognathicExam(dentalRecord.stomatognathicExam ?? "")
    setObservations(dentalRecord.observations ?? "")
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!dentalRecord) return

    if (!stomatognathicExam.trim()) {
      toast.error("Debe registrar al menos un ítem en el Examen del sistema estomatognático")
      return
    }

    try {
      await updateMutation.mutateAsync({
        openingReason,
        currentIllness: currentIllness || undefined,
        odontologicalHistory: odontologicalHistory || undefined,
        familyHistory: familyHistory || undefined,
        pathologicalHistory: pathologicalHistory || undefined,
        medicalAlerts: medicalAlerts || undefined,
        patientType,
        stomatognathicExam: stomatognathicExam.trim() || undefined,
        observations: observations || undefined,
      })
      toast.success("Datos de apertura de historia actualizados")
      setIsEditing(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al actualizar la historia odontológica")
    }
  }

  if (patientLoading || recordLoading) {
    return <DentalRecordSkeleton />
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

  if (!dentalRecord) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" render={<Link href={`/dashboard/patients/${id}/dental`} />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Apertura de Historia Odontológica</h1>
            <p className="text-muted-foreground">{patient.fullName}</p>
          </div>
        </div>
        <Card className="py-12 text-center">
          <CardContent className="space-y-3">
            <FileHeart className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <p className="text-muted-foreground">Este paciente aún no tiene una historia odontológica registrada.</p>
            <Button render={<Link href={`/dashboard/patients/${id}/dental`} />}>
              Crear historia odontológica
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" render={<Link href={`/dashboard/patients/${id}/dental`} />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold">Apertura de Historia Odontológica</h1>
              <Badge variant={dentalRecord.isActive ? "default" : "secondary"}>
                {dentalRecord.isActive ? "Historia activa" : "Historia inactiva"}
              </Badge>
              <Badge variant="outline">{dentalRecord.patientTypeLabel}</Badge>
            </div>
            <p className="text-muted-foreground">
              {patient.fullName} · {patient.idTypeLabel}: {patient.idNumber} · N° {dentalRecord.recordNumber}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={startEditing} className="cursor-pointer">
                <Pencil className="mr-1.5 h-4 w-4" />
                Editar datos de apertura
              </Button>
              <Button size="sm" render={<Link href={`/dashboard/patients/${id}/dental`} />}>
                <Stethoscope className="mr-1.5 h-4 w-4" />
                Ir a sesiones y citas
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={cancelEditing} className="cursor-pointer">
              <X className="mr-1.5 h-4 w-4" />
              Cancelar edición
            </Button>
          )}
        </div>
      </div>

      {/* Summary Tiles */}
      <Card className="border-border/70">
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              icon={<FileText className="h-4 w-4 text-muted-foreground" />}
              label="N° Historia"
              value={dentalRecord.recordNumber}
            />
            <SummaryTile
              icon={<Clock3 className="h-4 w-4 text-muted-foreground" />}
              label="Fecha de apertura"
              value={dentalRecord.openedAtFormatted}
            />
            <SummaryTile
              icon={<User className="h-4 w-4 text-muted-foreground" />}
              label="Aperturado por"
              value={dentalRecord.openedByName}
            />
            <SummaryTile
              icon={<Stethoscope className="h-4 w-4 text-muted-foreground" />}
              label="Consultorio de apertura"
              value={dentalRecord.clinicName ?? "Sin consultorio asignado"}
            />
          </div>
        </CardContent>
      </Card>

      {!isEditing ? (
        /* Vista de Lectura */
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Motivo inicial y Enfermedad Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-5 w-5 text-primary" />
                Motivo inicial y Enfermedad actual
              </CardTitle>
              <CardDescription>
                Información registrada al momento de la apertura del expediente odontológico.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoBlock label="Motivo inicial de atención" value={dentalRecord.openingReason} isPrimary />
              <InfoBlock label="Enfermedad actual" value={dentalRecord.currentIllness} />
              <InfoBlock label="Tipo de paciente" value={dentalRecord.patientTypeLabel} />
            </CardContent>
          </Card>

          {/* Antecedentes y Alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Heart className="h-5 w-5 text-red-500" />
                Antecedentes y Alertas Médicas
              </CardTitle>
              <CardDescription>
                Historial previo y precauciones clínicas relevantes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <InfoBlock label="Antecedentes patológicos" value={dentalRecord.pathologicalHistory} />
              <InfoBlock label="Antecedentes familiares" value={dentalRecord.familyHistory} />
              <InfoBlock label="Antecedentes odontológicos" value={dentalRecord.odontologicalHistory} />
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">Alertas médicas relevantes</p>
                {dentalRecord.medicalAlerts ? (
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                    <div className="flex items-start gap-2">
                      <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                      <p className="whitespace-pre-wrap">{dentalRecord.medicalAlerts}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin alertas médicas registradas</p>
                )}
              </div>
              <InfoBlock label="Observaciones generales" value={dentalRecord.observations} />
            </CardContent>
          </Card>

          {/* Signos Vitales */}
          <DentalVitalSignsCard dentalRecordId={dentalRecord.id} initialVitalSigns={dentalRecord.vitalSigns} />

          {/* Examen del Sistema Estomatognático */}
          <div className="lg:col-span-2">
            <StomatognathicExamEditor
              value={dentalRecord.stomatognathicExam ?? ""}
              onChange={() => undefined}
              readOnly
            />
          </div>

          {/* Odontograma Inicial */}
          {initialVersion && (
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <FileHeart className="h-5 w-5 text-primary" />
                    Odontograma Inicial (Versión #{initialVersion.versionNumber})
                  </CardTitle>
                  <CardDescription>
                    Estado inicial de la dentición registrado en la apertura ({initialVersion.createdAtFormatted}).
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewInitialOdontogram(true)}
                  className="cursor-pointer"
                >
                  Ver odontograma completo
                </Button>
              </CardHeader>
            </Card>
          )}
        </div>
      ) : (
        /* Formulario de Edición */
        <form onSubmit={handleSave} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Pencil className="h-5 w-5" />
                Editar datos de apertura
              </CardTitle>
              <CardDescription>
                Modifica los antecedentes, alertas o motivo inicial de la historia odontológica.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Tipo de paciente">
                <select
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  value={patientType}
                  onChange={(e) => setPatientType(e.target.value as DentalPatientType)}
                >
                  <option value="AMBULATORY">Ambulatorio</option>
                  <option value="HOSPITALIZATION">Hospitalización</option>
                </select>
              </Field>

              <div className="md:col-span-2">
                <Field label="Motivo inicial de atención">
                  <Textarea
                    required
                    value={openingReason}
                    onChange={(e) => setOpeningReason(e.target.value)}
                    placeholder="Paciente acude por..."
                    rows={3}
                  />
                </Field>
              </div>

              <Field label="Enfermedad actual">
                <Textarea
                  value={currentIllness}
                  onChange={(e) => setCurrentIllness(e.target.value)}
                  placeholder="Resumen del estado actual del paciente"
                  rows={3}
                />
              </Field>

              <Field label="Antecedentes patológicos">
                <Textarea
                  value={pathologicalHistory}
                  onChange={(e) => setPathologicalHistory(e.target.value)}
                  placeholder="Enfermedades sistémicas previas o actuales, cirugías, alergias..."
                  rows={3}
                />
              </Field>

              <Field label="Antecedentes familiares">
                <Textarea
                  value={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.value)}
                  placeholder="Antecedentes médicos y estomatognáticos en familiares directos"
                  rows={3}
                />
              </Field>

              <Field label="Antecedentes odontológicos">
                <Textarea
                  value={odontologicalHistory}
                  onChange={(e) => setOdontologicalHistory(e.target.value)}
                  placeholder="Tratamientos previos, cirugías, ortodoncia, etc."
                  rows={3}
                />
              </Field>

              <Field label="Alertas médicas relevantes">
                <Textarea
                  value={medicalAlerts}
                  onChange={(e) => setMedicalAlerts(e.target.value)}
                  placeholder="Alergias a medicamentos, hipertensión, diabetes, anticoagulantes..."
                  rows={3}
                />
              </Field>

              <Field label="Observaciones generales">
                <Textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Notas y observaciones adicionales"
                  rows={3}
                />
              </Field>
            </CardContent>
          </Card>

          <StomatognathicExamEditor
            value={stomatognathicExam}
            onChange={setStomatognathicExam}
          />

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancelEditing} className="cursor-pointer">
              Cancelar
            </Button>
            <Button type="submit" disabled={updateMutation.isPending} className="cursor-pointer">
              <Save className="mr-2 h-4 w-4" />
              {updateMutation.isPending ? "Guardando..." : "Guardar cambios de apertura"}
            </Button>
          </div>
        </form>
      )}

      {/* Modal para ver el Odontograma Inicial */}
      {previewInitialOdontogram && initialVersion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-auto rounded-lg border bg-background p-5 shadow-lg space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-3">
              <div>
                <h2 className="text-lg font-semibold">Odontograma Inicial (Versión #{initialVersion.versionNumber})</h2>
                <p className="text-sm text-muted-foreground">
                  {initialVersion.createdAtFormatted} · {initialVersion.createdByName}
                </p>
              </div>
              <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setPreviewInitialOdontogram(false)}>
                Cerrar
              </Button>
            </div>
            <OdontogramEditor value={initialVersion.data as OdontogramState} onChange={() => undefined} patientAge={patient.age} readOnly />
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

function InfoBlock({ label, value, isPrimary = false }: { label: string; value?: string | null; isPrimary?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className={`text-sm whitespace-pre-wrap ${isPrimary ? "font-medium text-foreground" : "text-foreground/90"}`}>
        {value || "—"}
      </p>
    </div>
  )
}

function DentalRecordSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  )
}
