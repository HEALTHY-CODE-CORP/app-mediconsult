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
import { ConfirmButton } from "@/components/shared/confirm-button"
import { ClinicPharmaciesCard } from "@/components/admin/clinic-pharmacies"
import { ClinicStaffCard } from "@/components/admin/clinic-staff-card"
import { useClinic, useDeleteClinic } from "@/hooks/use-organizations"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  FileKey,
} from "lucide-react"
import { toast } from "sonner"

interface ClinicDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ClinicDetailPage({ params }: ClinicDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: clinic, isLoading } = useClinic(id)
  const deleteMutation = useDeleteClinic()

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Clínica eliminada")
      router.push("/dashboard/admin/clinics")
    } catch {
      toast.error("Error al eliminar la clínica")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Clínica no encontrada</p>
        <Button variant="link" className="mt-2" render={<Link href="/dashboard/admin/clinics" />}>
          Volver a clínicas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" render={<Link href="/dashboard/admin/clinics" />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{clinic.name}</h1>
              <Badge variant={clinic.isActive ? "default" : "secondary"}>
                {clinic.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/dashboard/admin/clinics/${id}/edit`} />}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Editar
          </Button>
          <ConfirmButton
            variant="destructive"
            size="sm"
            title="Eliminar clínica"
            description="Esta acción eliminará la clínica de forma permanente."
            confirmLabel="Eliminar clínica"
            loadingLabel="Eliminando..."
            onConfirm={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Eliminar
          </ConfirmButton>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Dirección" value={clinic.address} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Teléfono" value={clinic.phone} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={clinic.email} />
            <InfoRow
              icon={<DollarSign className="h-4 w-4" />}
              label="Precio de consulta"
              value={clinic.consultationPriceFormatted}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2">
              <FileKey className="h-5 w-5" />
              Facturación del consultorio
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              render={
                <Link
                  href={`/dashboard/admin/certificates/upload?ownerType=CLINIC&ownerId=${id}&back=${encodeURIComponent(`/dashboard/admin/clinics/${id}`)}`}
                />
              }
            >
              Subir certificado
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Razón social" value={clinic.billingLegalName} />
            <InfoRow label="Nombre comercial" value={clinic.billingCommercialName} />
            <InfoRow label="RUC" value={clinic.billingRuc} />
            <InfoRow label="Ambiente SRI" value={clinic.sriEnvironmentLabel} />
            <InfoRow label="Establecimiento" value={clinic.billingEstablishmentCode} />
            <InfoRow label="Punto de emisión" value={clinic.billingEmissionPointCode} />
            <InfoRow label="Dirección matriz" value={clinic.billingMatrixAddress} />
            <InfoRow
              label="Contribuyente especial"
              value={clinic.billingSpecialTaxpayerCode}
            />
            <InfoRow
              label="Obligado a contabilidad"
              value={clinic.billingAccountingRequired ? "Sí" : "No"}
            />
          </CardContent>
        </Card>

        <ClinicPharmaciesCard clinicId={id} />
        <ClinicStaffCard clinicId={id} />
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
