"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTable } from "@/components/ui/data-table"
import { useCertificates } from "@/hooks/use-certificates"
import { Plus, Eye, FileKey } from "lucide-react"

function statusVariant(statusLabel: string) {
  if (statusLabel === "Activo") return "default" as const
  if (statusLabel === "Expirado") return "destructive" as const
  return "secondary" as const
}

export default function CertificatesPage() {
  const { data: certificates = [], isLoading } = useCertificates()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Certificados digitales</h1>
          <p className="text-muted-foreground">
            Certificados P12 para firma electr&oacute;nica de recetas y facturas
          </p>
        </div>
        <Button render={<Link href="/dashboard/admin/certificates/upload" />}>
          <Plus className="mr-2 h-4 w-4" />
          Subir certificado
        </Button>
      </div>

      <DataTable
        isLoading={isLoading}
        isEmpty={certificates.length === 0}
        loadingRows={3}
        emptyIcon={<FileKey className="h-10 w-10 text-muted-foreground" />}
        emptyMessage="No hay certificados registrados"
        emptyDescription="Sube un certificado P12 para empezar a firmar documentos"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Alias</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Sujeto</TableHead>
              <TableHead>V&aacute;lido hasta</TableHead>
              <TableHead>Archivo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {certificates.map((cert) => (
              <TableRow key={cert.id}>
                <TableCell className="font-medium">{cert.alias}</TableCell>
                <TableCell>
                  <Badge variant="outline">{cert.ownerTypeLabel}</Badge>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {cert.subjectCn ?? "\u2014"}
                </TableCell>
                <TableCell>
                  {cert.validUntil
                    ? new Date(cert.validUntil).toLocaleDateString("es-EC")
                    : "\u2014"}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {cert.fileName} ({cert.fileSizeFormatted})
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant(cert.statusLabel)}>
                    {cert.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    render={<Link href={`/dashboard/admin/certificates/${cert.id}`} />}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  )
}
