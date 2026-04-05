"use client"

import { useMemo, useState, use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, FileText, Save } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useConsultation,
  useMedicalCertificateTemplates,
  useCreateMedicalCertificate,
} from "@/hooks/use-clinical"
import { usePatient } from "@/hooks/use-patients"
import { toIsoDateEc } from "@/lib/date"
import type { ApiError } from "@/types/api"

interface NewMedicalCertificatePageProps {
  params: Promise<{ id: string }>
}

type FormOverrides = {
  templateId?: string
  title?: string
  certificateDate?: string
  restDays?: string
  restStartDate?: string
  restEndDate?: string
  diagnosisSummary?: string
  purpose?: string
  content?: string
}

const DEFAULT_PURPOSE =
  "Se recomienda reposo y seguimiento medico segun criterio profesional."

export default function NewMedicalCertificatePage({ params }: NewMedicalCertificatePageProps) {
  const { id } = use(params)
  const router = useRouter()

  const { data: consultation, isLoading: loadingConsultation } = useConsultation(id)
  const { data: templates = [], isLoading: loadingTemplates } = useMedicalCertificateTemplates()
  const { data: patient, isLoading: loadingPatient } = usePatient(
    consultation?.patientId ?? ""
  )

  const createMutation = useCreateMedicalCertificate(id)

  const [overrides, setOverrides] = useState<FormOverrides>({})
  const [todayIsoDate] = useState(() => toIsoDateEc(new Date()))

  const defaultTemplateId = templates[0]?.id ?? ""
  const selectedTemplateId = overrides.templateId ?? defaultTemplateId
  const selectedTemplate = useMemo(
    () => templates.find((t) => t.id === selectedTemplateId) ?? null,
    [templates, selectedTemplateId]
  )

  const defaultTitle = consultation
    ? `Certificado medico - ${consultation.patientName}`
    : ""

  const defaultCertificateDate = todayIsoDate
  const selectedCertificateDate = overrides.certificateDate ?? defaultCertificateDate

  const selectedRestDays = overrides.restDays ?? "0"
  const parsedRestDays = Number(selectedRestDays || 0)

  const defaultRestStartDate =
    parsedRestDays > 0 ? selectedCertificateDate : ""
  const selectedRestStartDate = overrides.restStartDate ?? defaultRestStartDate

  const defaultRestEndDate =
    parsedRestDays > 0 && selectedRestStartDate
      ? addDaysIsoDate(selectedRestStartDate, Math.max(parsedRestDays - 1, 0))
      : ""
  const selectedRestEndDate = overrides.restEndDate ?? defaultRestEndDate

  const selectedDiagnosisSummary =
    overrides.diagnosisSummary ??
    consultation?.diagnosisDescription ??
    consultation?.reasonForVisit ??
    ""

  const selectedPurpose = overrides.purpose ?? DEFAULT_PURPOSE

  const autoContent = useMemo(() => {
    if (!selectedTemplate) return ""

    const patientName = patient?.fullName ?? consultation?.patientName ?? "Paciente"
    const patientIdTypeLabel = patient ? mapIdTypeToLabel(patient.idType) : "Documento"
    const patientIdNumber = patient?.idNumber ?? "-"
    const patientAge = patient?.age != null ? String(patient.age) : "-"

    return renderTemplate(selectedTemplate.contentTemplate, {
      currentDate: formatDateForCertificate(defaultCertificateDate),
      certificateDate: formatDateForCertificate(selectedCertificateDate),
      consultationDate: formatDateForCertificate(
        consultation ? toIsoDateEc(consultation.consultationDate, defaultCertificateDate) : defaultCertificateDate
      ),
      patientName,
      patientIdTypeLabel,
      patientIdNumber,
      patientAge,
      doctorName: consultation?.doctorName ?? "Doctor",
      clinicName: consultation?.clinicName ?? "Clinica",
      clinicLogo: "{{clinicLogo}}",
      diagnosisSummary: selectedDiagnosisSummary || "Sin novedad.",
      restDays: String(Math.max(parsedRestDays, 0)),
      restStartDate: selectedRestStartDate
        ? formatDateForCertificate(selectedRestStartDate)
        : "-",
      restEndDate: selectedRestEndDate
        ? formatDateForCertificate(selectedRestEndDate)
        : "-",
      purpose: selectedPurpose || "-",
    })
  }, [
    selectedTemplate,
    patient,
    consultation,
    selectedCertificateDate,
    defaultCertificateDate,
    selectedDiagnosisSummary,
    parsedRestDays,
    selectedRestStartDate,
    selectedRestEndDate,
    selectedPurpose,
  ])

  const autoEditorContent = useMemo(() => toEditorHtml(autoContent), [autoContent])
  const selectedContent = overrides.content ?? autoEditorContent

  function setField<K extends keyof FormOverrides>(field: K, value: FormOverrides[K]) {
    setOverrides((prev) => ({ ...prev, [field]: value }))
  }

  function handleTemplateChange(nextTemplateId: string) {
    setOverrides((prev) => {
      const next = { ...prev, templateId: nextTemplateId }
      // Always rehydrate editor content from selected template when template changes.
      delete next.content
      return next
    })
  }

  function resetField(field: keyof FormOverrides) {
    setOverrides((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  function handleContentChange(nextValue: string, meta?: { hasFocus: boolean }) {
    // TinyMCE can emit change events while syncing external value updates.
    // We ignore those so template variables remain reactive until user edits manually.
    if (!meta?.hasFocus) return

    const normalizedIncoming = normalizeEditorHtml(nextValue)
    const normalizedAuto = normalizeEditorHtml(autoEditorContent)

    if (normalizedIncoming === normalizedAuto) {
      resetField("content")
      return
    }

    setField("content", nextValue)
  }

  async function handleSubmit() {
    if (!consultation) return

    if (!selectedTemplateId) {
      toast.error("Selecciona una plantilla")
      return
    }

    if (!selectedCertificateDate) {
      toast.error("La fecha del certificado es requerida")
      return
    }

    if (Number.isNaN(parsedRestDays) || parsedRestDays < 0 || !Number.isInteger(parsedRestDays)) {
      toast.error("Dias de reposo invalido")
      return
    }

    if (selectedRestStartDate && selectedRestEndDate && selectedRestEndDate < selectedRestStartDate) {
      toast.error("La fecha final de reposo no puede ser menor a la fecha inicial")
      return
    }

    try {
      const result = await createMutation.mutateAsync({
        templateId: selectedTemplateId,
        title: selectedTitleOrDefault(overrides.title, defaultTitle),
        certificateDate: selectedCertificateDate,
        restDays: parsedRestDays,
        restStartDate: selectedRestStartDate || undefined,
        restEndDate: selectedRestEndDate || undefined,
        diagnosisSummary: normalizeOptional(selectedDiagnosisSummary),
        purpose: normalizeOptional(selectedPurpose),
        content: normalizeOptional(selectedContent),
      })

      toast.success("Certificado medico creado")
      router.push(`/dashboard/clinical/certificates/${result.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Error al crear certificado medico")
    }
  }

  if (loadingConsultation || loadingTemplates || (consultation && loadingPatient)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-60" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="space-y-3">
        <p className="text-muted-foreground">Consulta no encontrada</p>
        <Button variant="outline" render={<Link href="/dashboard/clinical/consultations" />}>
          Volver a consultas
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/dashboard/clinical/consultations/${id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Nuevo certificado medico</h1>
          <p className="text-sm text-muted-foreground">
            Se autocompleta con datos del paciente y de la consulta. Puedes editar cualquier campo.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Datos del certificado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-template">Plantilla</Label>
              <Select
                value={selectedTemplateId}
                onValueChange={(value) => handleTemplateChange(value ?? "")}
                disabled={templates.length === 0}
              >
                <SelectTrigger id="medical-certificate-template">
                  <SelectValue placeholder="Selecciona plantilla">
                    {selectedTemplate?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem
                      key={template.id}
                      value={template.id}
                      label={template.name}
                    >
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-title">Titulo</Label>
              <Input
                id="medical-certificate-title"
                value={overrides.title ?? defaultTitle}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Certificado medico"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-date">Fecha del certificado</Label>
              <Input
                id="medical-certificate-date"
                type="date"
                value={selectedCertificateDate}
                onChange={(e) => setField("certificateDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-rest-days">Dias de reposo</Label>
              <Input
                id="medical-certificate-rest-days"
                type="number"
                min="0"
                max="365"
                value={selectedRestDays}
                onChange={(e) => setField("restDays", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-rest-start">Reposo desde</Label>
              <Input
                id="medical-certificate-rest-start"
                type="date"
                value={selectedRestStartDate}
                onChange={(e) => setField("restStartDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-rest-end">Reposo hasta</Label>
              <Input
                id="medical-certificate-rest-end"
                type="date"
                value={selectedRestEndDate}
                onChange={(e) => setField("restEndDate", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-diagnosis">Resumen clinico</Label>
              <Textarea
                id="medical-certificate-diagnosis"
                rows={4}
                value={selectedDiagnosisSummary}
                onChange={(e) => setField("diagnosisSummary", e.target.value)}
                placeholder="Resumen del estado clinico del paciente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medical-certificate-purpose">Observaciones</Label>
              <Textarea
                id="medical-certificate-purpose"
                rows={4}
                value={selectedPurpose}
                onChange={(e) => setField("purpose", e.target.value)}
                placeholder="Indicaciones y observaciones"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="medical-certificate-content">Contenido del certificado</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => resetField("content")}
              >
                Restaurar plantilla
              </Button>
            </div>
            <RichTextEditor
              value={selectedContent}
              onChange={handleContentChange}
              height={460}
            />
            <p className="text-xs text-muted-foreground">
              Este texto queda guardado como snapshot del certificado para auditoria.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              render={<Link href={`/dashboard/clinical/consultations/${id}`} />}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              <Save className="mr-1 h-4 w-4" />
              {createMutation.isPending ? "Guardando..." : "Guardar borrador"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function normalizeOptional(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
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

function selectedTitleOrDefault(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim()
  return trimmed || fallback
}

function addDaysIsoDate(isoDate: string, days: number): string {
  const [yearStr, monthStr, dayStr] = isoDate.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return isoDate
  }

  const base = new Date(Date.UTC(year, month - 1, day))
  base.setUTCDate(base.getUTCDate() + days)
  const nextYear = base.getUTCFullYear()
  const nextMonth = `${base.getUTCMonth() + 1}`.padStart(2, "0")
  const nextDay = `${base.getUTCDate()}`.padStart(2, "0")
  return `${nextYear}-${nextMonth}-${nextDay}`
}

function formatDateForCertificate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-")
  if (!year || !month || !day) return isoDate
  return `${day}/${month}/${year}`
}

function mapIdTypeToLabel(idType: string): string {
  switch (idType) {
    case "CEDULA":
      return "Cedula"
    case "RUC":
      return "RUC"
    case "PASSPORT":
      return "Pasaporte"
    default:
      return idType
  }
}

function renderTemplate(template: string, values: Record<string, string>): string {
  let output = template
  Object.entries(values).forEach(([key, value]) => {
    output = output.replaceAll(`{{${key}}}`, value)
  })
  return decodeEscapedLineBreaks(output)
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

function normalizeEditorHtml(input: string): string {
  return input
    .replaceAll("&nbsp;", " ")
    .replaceAll(/\s+/g, " ")
    .trim()
}

function decodeEscapedLineBreaks(input: string): string {
  return input.replaceAll("\\n", "\n").replaceAll("\\t", "\t")
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
