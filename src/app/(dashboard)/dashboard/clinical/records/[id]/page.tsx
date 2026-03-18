"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { VitalSignsCard } from "@/components/clinical/vital-signs-card"
import { MedicalHistoryCard } from "@/components/clinical/medical-history-card"
import {
  useMedicalRecord,
  useRecordConsultations,
} from "@/hooks/use-clinical"
import {
  ArrowLeft,
  FileHeart,
  Building2,
  User,
  Calendar,
  Eye,
  ClipboardList,
} from "lucide-react"

interface MedicalRecordDetailPageProps {
  params: Promise<{ id: string }>
}

export default function MedicalRecordDetailPage({
  params,
}: MedicalRecordDetailPageProps) {
  const { id } = use(params)
  const { data: record, isLoading } = useMedicalRecord(id)
  const { data: consultations = [], isLoading: loadingConsultations } =
    useRecordConsultations(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-7 w-64" />
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Historia clínica no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/clinical/records" />}
        >
          Volver a historias clínicas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/clinical/records" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Historia {record.recordNumber}
              </h1>
            </div>
            <p className="text-muted-foreground">
              {record.patientName}{record.clinicName ? ` · ${record.clinicName}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* General info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileHeart className="h-5 w-5" />
            Información
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="Paciente"
            value={`${record.patientName} (${record.patientIdNumber})`}
          />
          <InfoRow
            icon={<Building2 className="h-4 w-4" />}
            label="Clínica de apertura"
            value={record.clinicName ?? "—"}
          />
          <InfoRow
            icon={<Calendar className="h-4 w-4" />}
            label="Fecha de apertura"
            value={record.openedAtFormatted}
          />
          <InfoRow label="Abierto por" value={record.openedByName} />
        </CardContent>
      </Card>

      {/* Medical history — inline editable */}
      <MedicalHistoryCard medicalRecordId={id} record={record} />

      {/* Vital Signs */}
      <VitalSignsCard medicalRecordId={id} />

      {/* Consultations history */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Consultas
          </CardTitle>
          <CardDescription>
            Historial de consultas de esta historia clínica
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingConsultations ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : consultations.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay consultas registradas
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Diagnóstico</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consultations.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {c.consultationDateFormatted}
                    </TableCell>
                    <TableCell>{c.doctorName}</TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {c.reasonForVisit}
                    </TableCell>
                    <TableCell className="max-w-[180px] truncate">
                      {c.diagnosisDescription ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={c.statusColor}>
                        {c.statusLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={
                          <Link
                            href={`/dashboard/clinical/consultations/${c.id}`}
                          />
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
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
