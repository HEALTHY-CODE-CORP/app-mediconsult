"use client"

import { use, useState } from "react"
import Link from "next/link"
import { ArrowLeft, FileText, Printer, Save, Send, Ban } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  useMedicalCertificate,
  useUpdateMedicalCertificate,
  useIssueMedicalCertificate,
  useVoidMedicalCertificate,
} from "@/hooks/use-clinical"
import type { ApiError } from "@/types/api"

interface MedicalCertificateDetailPageProps {
  params: Promise<{ certificateId: string }>
}

type DraftOverrides = {
  title?: string
  certificateDate?: string
  restDays?: string
  restStartDate?: string
  restEndDate?: string
  diagnosisSummary?: string
  purpose?: string
  content?: string
}

export default function MedicalCertificateDetailPage({ params }: MedicalCertificateDetailPageProps) {
  const { certificateId } = use(params)

  const { data: certificate, isLoading } = useMedicalCertificate(certificateId)
  const updateMutation = useUpdateMedicalCertificate(certificateId)
  const issueMutation = useIssueMedicalCertificate(certificateId)
  const voidMutation = useVoidMedicalCertificate(certificateId)

  const [overrides, setOverrides] = useState<DraftOverrides>({})
  const [voidReason, setVoidReason] = useState("")

  const isDraft = certificate?.status === "DRAFT"
  const isVoided = certificate?.status === "VOID"

  const title = overrides.title ?? certificate?.title ?? ""
  const certificateDate = overrides.certificateDate ?? certificate?.certificateDate ?? ""
  const restDays = overrides.restDays ?? String(certificate?.restDays ?? 0)
  const restStartDate = overrides.restStartDate ?? certificate?.restStartDate ?? ""
  const restEndDate = overrides.restEndDate ?? certificate?.restEndDate ?? ""
  const diagnosisSummary = overrides.diagnosisSummary ?? certificate?.diagnosisSummary ?? ""
  const purpose = overrides.purpose ?? certificate?.purpose ?? ""
  const content = overrides.content ?? toEditorHtml(certificate?.content ?? "")

  function updateField<K extends keyof DraftOverrides>(field: K, value: DraftOverrides[K]) {
    setOverrides((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSaveDraft() {
    if (!certificate || !isDraft) return

    const parsedRestDays = Number(restDays)
    if (Number.isNaN(parsedRestDays) || parsedRestDays < 0 || !Number.isInteger(parsedRestDays)) {
      toast.error("Dias de reposo invalido")
      return
    }

    if (restStartDate && restEndDate && new Date(restEndDate) < new Date(restStartDate)) {
      toast.error("La fecha final de reposo no puede ser menor a la fecha inicial")
      return
    }

    try {
      await updateMutation.mutateAsync({
        title: title.trim(),
        certificateDate,
        restDays: parsedRestDays,
        restStartDate: restStartDate || undefined,
        restEndDate: restEndDate || undefined,
        diagnosisSummary: normalizeOptional(diagnosisSummary),
        purpose: normalizeOptional(purpose),
        content: normalizeOptional(content),
      })
      toast.success("Certificado actualizado")
      setOverrides({})
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Error al guardar certificado")
    }
  }

  async function handleIssue() {
    if (!certificate || !isDraft) return
    try {
      await issueMutation.mutateAsync()
      toast.success("Certificado emitido")
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Error al emitir certificado")
    }
  }

  async function handleVoid() {
    if (!certificate || isVoided) return

    const reason = voidReason.trim()
    if (!reason) {
      toast.error("Debes ingresar el motivo de anulacion")
      return
    }

    try {
      await voidMutation.mutateAsync({ reason })
      toast.success("Certificado anulado")
      setVoidReason("")
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Error al anular certificado")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-72" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">Certificado no encontrado</p>
        <Button variant="outline" render={<Link href="/dashboard/clinical/consultations" />}>
          Volver a consultas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href={`/dashboard/clinical/consultations/${certificate.consultationId}`} />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{certificate.title}</h1>
              <Badge className={certificate.statusColor}>{certificate.statusLabel}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Paciente: {certificate.patientName} · Fecha: {certificate.certificateDateFormatted}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="mr-1 h-4 w-4" />
            Imprimir
          </Button>
          {isDraft && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={updateMutation.isPending}
              >
                <Save className="mr-1 h-4 w-4" />
                {updateMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
              <Button
                type="button"
                onClick={handleIssue}
                disabled={issueMutation.isPending}
              >
                <Send className="mr-1 h-4 w-4" />
                {issueMutation.isPending ? "Emitiendo..." : "Emitir certificado"}
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Detalle del certificado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-title">Titulo</Label>
              <Input
                id="medical-certificate-title"
                value={title}
                onChange={(e) => updateField("title", e.target.value)}
                disabled={!isDraft}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-date">Fecha del certificado</Label>
              <Input
                id="medical-certificate-date"
                type="date"
                value={certificateDate}
                onChange={(e) => updateField("certificateDate", e.target.value)}
                disabled={!isDraft}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-rest-days">Dias de reposo</Label>
              <Input
                id="medical-certificate-rest-days"
                type="number"
                min="0"
                max="365"
                value={restDays}
                onChange={(e) => updateField("restDays", e.target.value)}
                disabled={!isDraft}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-rest-start">Reposo desde</Label>
              <Input
                id="medical-certificate-rest-start"
                type="date"
                value={restStartDate}
                onChange={(e) => updateField("restStartDate", e.target.value)}
                disabled={!isDraft}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-rest-end">Reposo hasta</Label>
              <Input
                id="medical-certificate-rest-end"
                type="date"
                value={restEndDate}
                onChange={(e) => updateField("restEndDate", e.target.value)}
                disabled={!isDraft}
              />
            </div>
            <div className="space-y-2">
              <Label>Plantilla</Label>
              <Input value={certificate.templateName ?? "N/A"} disabled />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-diagnosis">Resumen clinico</Label>
              <Textarea
                id="medical-certificate-diagnosis"
                rows={4}
                value={diagnosisSummary}
                onChange={(e) => updateField("diagnosisSummary", e.target.value)}
                disabled={!isDraft}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-purpose">Observaciones</Label>
              <Textarea
                id="medical-certificate-purpose"
                rows={4}
                value={purpose}
                onChange={(e) => updateField("purpose", e.target.value)}
                disabled={!isDraft}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical-certificate-content">Contenido</Label>
            <RichTextEditor
              value={content}
              onChange={(value) => updateField("content", value)}
              disabled={!isDraft}
              height={500}
            />
          </div>

          {!isVoided && (
            <div className="rounded-md border border-dashed p-4 space-y-3">
              <p className="text-sm font-medium">Anular certificado</p>
              <p className="text-xs text-muted-foreground">
                Usa esta opcion cuando debas invalidar un certificado emitido o borrador por error.
              </p>
              <div className="flex flex-col gap-2 md:flex-row">
                <Input
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Motivo de anulacion"
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleVoid}
                  disabled={voidMutation.isPending}
                >
                  <Ban className="mr-1 h-4 w-4" />
                  {voidMutation.isPending ? "Anulando..." : "Anular"}
                </Button>
              </div>
            </div>
          )}

          {isVoided && certificate.voidReason && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              Motivo de anulacion: {certificate.voidReason}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function normalizeOptional(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function toEditorHtml(content: string): string {
  const normalized = decodeEscapedLineBreaks(content)
  const trimmed = normalized.trim()
  if (!trimmed) return ""
  const seemsHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed)
  if (seemsHtml) return normalized

  return trimmed
    .split(/\n{2,}/)
    .map((block) => `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`)
    .join("")
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function decodeEscapedLineBreaks(input: string): string {
  return input.replaceAll("\\n", "\n").replaceAll("\\t", "\t")
}

function getApiErrorMessage(error: unknown): string | null {
  if (error && typeof error === "object" && "message" in error) {
    const apiError = error as ApiError
    if (typeof apiError.message === "string" && apiError.message.trim().length > 0) {
      return apiError.message
    }
  }
  return null
}
