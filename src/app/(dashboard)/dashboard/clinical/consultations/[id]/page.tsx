"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmButton } from "@/components/shared/confirm-button"
import { SummaryTile } from "@/components/shared/summary-tile"
import { EvolutionNotesCard } from "@/components/clinical/evolution-notes-card"
import { ReferralsCard } from "@/components/clinical/referrals-card"
import { PrescriptionCard } from "@/components/clinical/prescription-card"
import {
  useConsultation,
  useCompleteConsultation,
  useConsultationMedicalCertificates,
} from "@/hooks/use-clinical"
import { useConsultationInvoice } from "@/hooks/use-billing"
import {
  ArrowLeft,
  CheckCircle2,
  User,
  Stethoscope,
  Calendar,
  ClipboardList,
  FileText,
  Pill,
  MessageSquare,
  Receipt,
  Building2,
  ClipboardCheck,
  CircleDashed,
} from "lucide-react"
import { toast } from "sonner"

interface ConsultationDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ConsultationDetailPage({
  params,
}: ConsultationDetailPageProps) {
  const { id } = use(params)
  const { data: consultation, isLoading } = useConsultation(id)
  const { data: existingInvoice } = useConsultationInvoice(id)
  const {
    data: medicalCertificates = [],
    isLoading: loadingMedicalCertificates,
  } = useConsultationMedicalCertificates(id)
  const completeMutation = useCompleteConsultation()

  async function handleComplete() {
    try {
      await completeMutation.mutateAsync(id)
      toast.success("Consulta completada")
    } catch {
      toast.error("Error al completar la consulta")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Consulta no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/clinical/consultations" />}
        >
          Volver a consultas
        </Button>
      </div>
    )
  }

  const isActive = consultation.status === "IN_PROGRESS"
  const billingStatus = existingInvoice
    ? "Facturada"
    : consultation.status === "COMPLETED"
      ? "Pendiente de facturar"
      : "No disponible"
  const diagnosisStatus =
    consultation.diagnosisCode || consultation.diagnosisDescription
      ? "Registrado"
      : "Pendiente"
  const treatmentStatus =
    consultation.procedures || consultation.treatment ? "Registrado" : "Pendiente"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/clinical/consultations" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">Consulta</h1>
              <Badge className={consultation.statusColor}>
                {consultation.statusLabel}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {consultation.patientName} · {consultation.consultationDateFormatted}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isActive && (
            <ConfirmButton
              variant="default"
              size="sm"
              title="Completar consulta"
              description="La consulta pasará a estado completada."
              confirmLabel="Completar"
              confirmVariant="default"
              loadingLabel="Completando..."
              onConfirm={handleComplete}
              disabled={completeMutation.isPending}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              Completar consulta
            </ConfirmButton>
          )}
          {consultation.status === "COMPLETED" && !existingInvoice && (
            <Button
              variant="outline"
              size="sm"
              render={
                <Link
                  href={`/dashboard/clinical/billing/new?consultationId=${id}`}
                />
              }
            >
              <Receipt className="mr-1 h-4 w-4" />
              Facturar consulta
            </Button>
          )}
          {existingInvoice && (
            <Button
              variant="outline"
              size="sm"
              render={
                <Link
                  href={`/dashboard/clinical/billing/${existingInvoice.id}`}
                />
              }
            >
              <Receipt className="mr-1 h-4 w-4" />
              Ver factura
            </Button>
          )}
          {consultation.status !== "CANCELLED" && (
            <Button
              variant="outline"
              size="sm"
              render={
                <Link
                  href={`/dashboard/clinical/consultations/${id}/certificates/new`}
                />
              }
            >
              <FileText className="mr-1 h-4 w-4" />
              Generar certificado
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/70">
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
              label="Clínica"
              value={consultation.clinicName}
            />
            <SummaryTile
              icon={<Receipt className="h-4 w-4 text-muted-foreground" />}
              label="Facturación"
              value={billingStatus}
            />
            <SummaryTile
              icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
              label="Diagnóstico"
              value={diagnosisStatus}
            />
            <SummaryTile
              icon={<CircleDashed className="h-4 w-4 text-muted-foreground" />}
              label="Tratamiento"
              value={treatmentStatus}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/70">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Certificados medicos
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Documentos emitidos para esta consulta.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            render={
              <Link href={`/dashboard/clinical/consultations/${id}/certificates/new`} />
            }
          >
            <FileText className="mr-1 h-4 w-4" />
            Nuevo
          </Button>
        </CardHeader>
        <CardContent>
          {loadingMedicalCertificates ? (
            <div className="space-y-2">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : medicalCertificates.length === 0 ? (
            <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              No hay certificados medicos para esta consulta.
            </div>
          ) : (
            <div className="space-y-2">
              {medicalCertificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{certificate.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {certificate.certificateDateFormatted} · {certificate.patientName}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={certificate.statusColor}>
                      {certificate.statusLabel}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      render={
                        <Link href={`/dashboard/clinical/certificates/${certificate.id}`} />
                      }
                    >
                      Ver detalle
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Paciente"
              value={consultation.patientName}
            />
            <InfoRow
              icon={<Stethoscope className="h-4 w-4" />}
              label="Doctor"
              value={consultation.doctorName}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Fecha"
              value={consultation.consultationDateFormatted}
            />
          </CardContent>
        </Card>

        {/* Reason & illness */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Motivo de consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Motivo</p>
              <p className="text-sm whitespace-pre-wrap">
                {consultation.reasonForVisit}
              </p>
            </div>
            {consultation.currentIllness && (
              <div>
                <p className="text-xs text-muted-foreground">
                  Enfermedad actual
                </p>
                <p className="text-sm whitespace-pre-wrap">
                  {consultation.currentIllness}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Examination */}
        {consultation.physicalExamination && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Examen físico
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">
                {consultation.physicalExamination}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Diagnosis */}
        {(consultation.diagnosisCode || consultation.diagnosisDescription) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Diagnóstico
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {consultation.diagnosisCode && (
                <div>
                  <p className="text-xs text-muted-foreground">Código CIE-10</p>
                  <Badge variant="outline">{consultation.diagnosisCode}</Badge>
                </div>
              )}
              {consultation.diagnosisDescription && (
                <div>
                  <p className="text-xs text-muted-foreground">Descripción</p>
                  <p className="text-sm">{consultation.diagnosisDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Treatment */}
        {(consultation.procedures || consultation.treatment) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Tratamiento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {consultation.procedures && (
                <div>
                  <p className="text-xs text-muted-foreground">Procedimientos</p>
                  <p className="text-sm whitespace-pre-wrap">
                    {consultation.procedures}
                  </p>
                </div>
              )}
              {consultation.treatment && (
                <div>
                  <p className="text-xs text-muted-foreground">
                    Plan de tratamiento
                  </p>
                  <p className="text-sm whitespace-pre-wrap">
                    {consultation.treatment}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Notes */}
        {consultation.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{consultation.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Prescriptions */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold tracking-tight">Seguimiento clínico</h2>
        <p className="text-sm text-muted-foreground">
          Gestiona recetas, evolución y derivaciones relacionadas a esta consulta.
        </p>
      </div>
      <PrescriptionCard
        consultationId={id}
        canAdd={isActive}
      />

      {/* Evolution Notes & Referrals */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EvolutionNotesCard
          consultationId={id}
          canAdd={isActive}
        />
        <ReferralsCard
          consultationId={id}
          canAdd={isActive}
        />
      </div>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string | null
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? "—"}</p>
      </div>
    </div>
  )
}
