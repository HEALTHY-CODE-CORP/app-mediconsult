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
import {
  useCertificate,
  useDeactivateCertificate,
  useDeleteCertificate,
} from "@/hooks/use-certificates"
import {
  ArrowLeft,
  FileKey,
  Shield,
  Calendar,
  Trash2,
  XCircle,
  Download,
} from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/axios"

export default function CertificateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: cert, isLoading } = useCertificate(id)
  const deactivate = useDeactivateCertificate()
  const deleteCert = useDeleteCertificate()

  async function handleDeactivate() {
    if (!confirm("¿Desactivar este certificado? Ya no se usará para firmar.")) return
    try {
      await deactivate.mutateAsync(id)
      toast.success("Certificado desactivado")
    } catch {
      toast.error("Error al desactivar")
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar este certificado? Se eliminará también del almacenamiento.")) return
    try {
      await deleteCert.mutateAsync(id)
      toast.success("Certificado eliminado")
      router.push("/dashboard/admin/certificates")
    } catch {
      toast.error("Error al eliminar")
    }
  }

  async function handleDownload() {
    try {
      const response = await api.get(`/certificates/${id}/download`, {
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", cert?.fileName ?? "certificate.p12")
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error("Error al descargar")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!cert) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Certificado no encontrado</p>
        <Button variant="link" className="mt-2" render={<Link href="/dashboard/admin/certificates" />}>
          Volver a certificados
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/admin/certificates" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{cert.alias}</h1>
              <Badge
                variant={
                  cert.statusLabel === "Activo"
                    ? "default"
                    : cert.statusLabel === "Expirado"
                      ? "destructive"
                      : "secondary"
                }
              >
                {cert.statusLabel}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {cert.ownerTypeLabel} &middot; {cert.fileName} ({cert.fileSizeFormatted})
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-1 h-4 w-4" />
            Descargar
          </Button>
          {cert.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeactivate}
              disabled={deactivate.isPending}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Desactivar
            </Button>
          )}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteCert.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileKey className="h-5 w-5" />
              Informaci&oacute;n del certificado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Sujeto (CN)" value={cert.subjectCn} />
            <InfoRow label="Emisor (CN)" value={cert.issuerCn} />
            <InfoRow label="N&uacute;mero de serie" value={cert.serialNumber} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Vigencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              label="V&aacute;lido desde"
              value={cert.validFrom ? new Date(cert.validFrom).toLocaleDateString("es-EC") : null}
            />
            <InfoRow
              label="V&aacute;lido hasta"
              value={cert.validUntil ? new Date(cert.validUntil).toLocaleDateString("es-EC") : null}
            />
            <div>
              <p className="text-xs text-muted-foreground">Estado de firma</p>
              <div className="mt-1 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {cert.isExpired
                    ? "Certificado expirado — no válido para firmar"
                    : cert.isActive
                      ? "Listo para firmar documentos"
                      : "Desactivado — no se usa para firmar"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  )
}
