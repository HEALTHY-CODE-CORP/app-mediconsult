"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EvolutionNotesCard } from "@/components/clinical/evolution-notes-card"
import { ReferralsCard } from "@/components/clinical/referrals-card"
import { PrescriptionCard } from "@/components/clinical/prescription-card"
import { useConsultation, useCompleteConsultation } from "@/hooks/use-clinical"
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
} from "lucide-react"
import { toast } from "sonner"

interface ConsultationDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ConsultationDetailPage({
  params,
}: ConsultationDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: consultation, isLoading } = useConsultation(id)
  const { data: existingInvoice } = useConsultationInvoice(id)
  const completeMutation = useCompleteConsultation()

  async function handleComplete() {
    if (!confirm("¿Deseas completar esta consulta?")) return
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
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
        <div className="flex gap-2">
          {isActive && (
            <Button
              variant="default"
              size="sm"
              onClick={handleComplete}
              disabled={completeMutation.isPending}
            >
              <CheckCircle2 className="mr-1 h-4 w-4" />
              {completeMutation.isPending ? "Completando..." : "Completar consulta"}
            </Button>
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
        </div>
      </div>

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
