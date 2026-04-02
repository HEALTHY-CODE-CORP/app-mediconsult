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
import { usePharmacy, useDeletePharmacy } from "@/hooks/use-organizations"
import {
  useCertificatesByOwner,
  useDeactivateCertificate,
} from "@/hooks/use-certificates"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Store,
  Phone,
  Mail,
  MapPin,
  FileKey,
  Upload,
  Calendar,
  Shield,
  Eye,
  XCircle,
  ReceiptText,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

interface PharmacyDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PharmacyDetailPage({ params }: PharmacyDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: pharmacy, isLoading } = usePharmacy(id)
  const deleteMutation = useDeletePharmacy()
  const { data: pharmacyCertificates = [], isLoading: loadingCertificates } =
    useCertificatesByOwner("PHARMACY", id)
  const deactivateCertificateMutation = useDeactivateCertificate()

  const backToPharmacyDetail = `/dashboard/admin/pharmacies/${id}`
  const encodedBack = encodeURIComponent(backToPharmacyDetail)
  const uploadCertificateHref = `/dashboard/admin/certificates/upload?ownerType=PHARMACY&ownerId=${id}&back=${encodedBack}`

  const activeCertificate = pharmacyCertificates.find(
    (cert) => cert.isActive && !cert.isExpired
  )
  const historicalCertificates = pharmacyCertificates.filter(
    (cert) => !cert.isActive || cert.isExpired
  )

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Farmacia eliminada")
      router.push("/dashboard/admin/pharmacies")
    } catch {
      toast.error("Error al eliminar la farmacia")
    }
  }

  async function handleDeactivateCertificate(certificateId: string) {
    try {
      await deactivateCertificateMutation.mutateAsync(certificateId)
      toast.success("Certificado desactivado")
    } catch {
      toast.error("Error al desactivar el certificado")
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

  if (!pharmacy) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Farmacia no encontrada</p>
        <Button variant="link" className="mt-2" render={<Link href="/dashboard/admin/pharmacies" />}>
          Volver a farmacias
        </Button>
      </div>
    )
  }

  const missingBillingFields: string[] = []
  if (!pharmacy.billingRuc) missingBillingFields.push("RUC")
  if (!pharmacy.billingLegalName) missingBillingFields.push("Razón social")
  if (!pharmacy.billingCommercialName) missingBillingFields.push("Nombre comercial")
  if (!pharmacy.billingEstablishmentCode) missingBillingFields.push("Código de establecimiento")
  if (!pharmacy.billingEmissionPointCode) missingBillingFields.push("Punto de emisión")
  if (!pharmacy.billingMatrixAddress) missingBillingFields.push("Dirección matriz")
  if (!pharmacy.address) missingBillingFields.push("Dirección del establecimiento")

  const isBillingProfileReady = missingBillingFields.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" render={<Link href="/dashboard/admin/pharmacies" />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{pharmacy.name}</h1>
              <Badge variant={pharmacy.isActive ? "default" : "secondary"}>
                {pharmacy.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/dashboard/admin/pharmacies/${id}/edit`} />}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Editar
          </Button>
          <ConfirmButton
            variant="destructive"
            size="sm"
            title="Eliminar farmacia"
            description="Esta acción eliminará la farmacia de forma permanente."
            confirmLabel="Eliminar farmacia"
            loadingLabel="Eliminando..."
            onConfirm={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Eliminar
          </ConfirmButton>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow icon={<MapPin className="h-4 w-4" />} label="Dirección" value={pharmacy.address} />
            <InfoRow icon={<Phone className="h-4 w-4" />} label="Teléfono" value={pharmacy.phone} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={pharmacy.email} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ReceiptText className="h-5 w-5" />
              Perfil de facturación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-lg border px-3 py-2">
              <p className="text-sm font-medium">Estado del perfil</p>
              <Badge variant={isBillingProfileReady ? "default" : "secondary"}>
                {isBillingProfileReady ? "Listo para facturar" : "Incompleto"}
              </Badge>
            </div>
            {!isBillingProfileReady && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4" />
                  <div>
                    <p className="text-xs font-medium">Faltan datos para emitir facturas</p>
                    <p className="text-xs">
                      Completa: {missingBillingFields.join(", ")}.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <InfoRow label="RUC" value={pharmacy.billingRuc} />
            <InfoRow label="Razón social" value={pharmacy.billingLegalName} />
            <InfoRow label="Nombre comercial" value={pharmacy.billingCommercialName} />
            <InfoRow label="Código establecimiento" value={pharmacy.billingEstablishmentCode} />
            <InfoRow label="Punto de emisión" value={pharmacy.billingEmissionPointCode} />
            <InfoRow label="Dirección matriz" value={pharmacy.billingMatrixAddress} />
            <InfoRow
              label="Contribuyente especial"
              value={pharmacy.billingSpecialTaxpayerCode}
            />
            <InfoRow
              label="Obligado a contabilidad"
              value={pharmacy.billingAccountingRequired ? "Sí" : "No"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <FileKey className="h-5 w-5" />
                Certificado de facturación
              </CardTitle>
              <Button
                size="sm"
                variant={activeCertificate ? "outline" : "default"}
                render={<Link href={uploadCertificateHref} />}
              >
                <Upload className="mr-1 h-4 w-4" />
                {activeCertificate ? "Reemplazar" : "Subir certificado"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingCertificates ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-40" />
              </div>
            ) : activeCertificate ? (
              <>
                <InfoRow label="Alias" value={activeCertificate.alias} />
                <InfoRow label="Archivo" value={`${activeCertificate.fileName} (${activeCertificate.fileSizeFormatted})`} />
                <InfoRow
                  icon={<Calendar className="h-4 w-4" />}
                  label="Válido hasta"
                  value={
                    activeCertificate.validUntil
                      ? new Date(activeCertificate.validUntil).toLocaleDateString("es-EC")
                      : "Sin fecha"
                  }
                />
                <div>
                  <p className="text-xs text-muted-foreground">Estado de firma</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Listo para firmar facturas de esta farmacia
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    render={
                      <Link
                        href={`/dashboard/admin/certificates/${activeCertificate.id}?back=${encodedBack}`}
                      />
                    }
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    Ver certificado
                  </Button>
                  <ConfirmButton
                    variant="outline"
                    size="sm"
                    title="Desactivar certificado"
                    description="El certificado dejará de usarse para firmar facturas de esta farmacia."
                    confirmLabel="Desactivar"
                    loadingLabel="Desactivando..."
                    onConfirm={() => handleDeactivateCertificate(activeCertificate.id)}
                    disabled={deactivateCertificateMutation.isPending}
                  >
                    <XCircle className="mr-1 h-4 w-4" />
                    Desactivar
                  </ConfirmButton>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-dashed px-4 py-4">
                <p className="text-sm font-medium">Sin certificado activo</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sube un certificado P12 para habilitar la facturación electrónica de esta farmacia.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {historicalCertificates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {historicalCertificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{certificate.alias}</p>
                    <p className="text-xs text-muted-foreground">
                      {certificate.fileName} ·{" "}
                      {certificate.validUntil
                        ? `Expira: ${new Date(certificate.validUntil).toLocaleDateString("es-EC")}`
                        : "Sin fecha"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    render={
                      <Link
                        href={`/dashboard/admin/certificates/${certificate.id}?back=${encodedBack}`}
                      />
                    }
                  >
                    Ver detalle
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
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
