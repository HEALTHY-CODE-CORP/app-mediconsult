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
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { PatientAllergies } from "@/components/patients/patient-allergies"
import { usePatient, useDeletePatient } from "@/hooks/use-patients"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Shield,
  Briefcase,
} from "lucide-react"
import { toast } from "sonner"

interface PatientDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PatientDetailPage({ params }: PatientDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: patient, isLoading } = usePatient(id)
  const deleteMutation = useDeletePatient()

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar este paciente?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Paciente eliminado")
      router.push("/dashboard/patients")
    } catch {
      toast.error("Error al eliminar el paciente")
    }
  }

  if (isLoading) return <PatientDetailSkeleton />

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
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" render={<Link href="/dashboard/patients" />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{patient.fullName}</h1>
              <Badge variant={patient.isActive ? "default" : "secondary"}>
                {patient.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {patient.idTypeLabel}: {patient.idNumber}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href={`/dashboard/patients/${id}/edit`} />}>
            <Pencil className="mr-1 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Datos personales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Datos personales
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Fecha de nacimiento"
              value={
                patient.birthDateFormatted
                  ? `${patient.birthDateFormatted} (${patient.age} años)`
                  : null
              }
            />
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Género"
              value={patient.genderLabel}
            />
            <InfoRow
              icon={<Heart className="h-4 w-4" />}
              label="Tipo de sangre"
              value={patient.bloodTypeLabel}
            />
            <InfoRow
              icon={<Briefcase className="h-4 w-4" />}
              label="Ocupación"
              value={patient.occupation}
            />
          </CardContent>
        </Card>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Información de contacto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<Phone className="h-4 w-4" />}
              label="Teléfono"
              value={patient.phone}
            />
            <InfoRow
              icon={<Mail className="h-4 w-4" />}
              label="Email"
              value={patient.email}
            />
            <InfoRow
              icon={<MapPin className="h-4 w-4" />}
              label="Dirección"
              value={patient.address}
            />
            <Separator />
            <p className="text-xs font-medium text-muted-foreground uppercase">
              Contacto de emergencia
            </p>
            <InfoRow label="Nombre" value={patient.emergencyContactName} />
            <InfoRow label="Teléfono" value={patient.emergencyContactPhone} />
          </CardContent>
        </Card>

        {/* Seguro */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguro médico
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Aseguradora" value={patient.insuranceProvider} />
            <InfoRow label="Número de póliza" value={patient.insuranceNumber} />
          </CardContent>
        </Card>

        {/* Notas */}
        {patient.notes && (
          <Card>
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{patient.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Alergias */}
      <PatientAllergies patientId={id} />
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
      {icon && (
        <div className="mt-0.5 text-muted-foreground">{icon}</div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? "—"}</p>
      </div>
    </div>
  )
}

function PatientDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-8 w-8" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    </div>
  )
}
