"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { ConfirmButton } from "@/components/shared/confirm-button"
import {
  useManageMedicalCertificateTemplates,
  useCreateMedicalCertificateTemplate,
  useToggleMedicalCertificateTemplateActive,
  useUpdateMedicalCertificateTemplate,
} from "@/hooks/use-clinical"
import type { MedicalCertificateTemplate } from "@/adapters/clinical.adapter"
import type { ApiError } from "@/types/api"
import { Copy, Pencil, Plus, Power, RefreshCw } from "lucide-react"

interface TemplateFormState {
  name: string
  description: string
  contentTemplate: string
}

const DEFAULT_TEMPLATE_CONTENT = `<h2>CERTIFICADO MEDICO</h2>
<p><strong>Fecha:</strong> {{certificateDate}}</p>
<p>
Yo, Dr./Dra. {{doctorName}}, certifico que el/la paciente {{patientName}}
({{patientIdTypeLabel}} {{patientIdNumber}}) fue atendido/a el {{consultationDate}} en {{clinicName}}.
</p>
<p><strong>Resumen clinico:</strong><br />{{diagnosisSummary}}</p>
<p>
<strong>Reposo recomendado:</strong> {{restDays}} dia(s), desde {{restStartDate}} hasta {{restEndDate}}.
</p>
<p><strong>Observaciones:</strong><br />{{purpose}}</p>
<p>Atentamente,<br />{{doctorName}}</p>`

const TEMPLATE_VARIABLES = [
  "{{certificateDate}}",
  "{{consultationDate}}",
  "{{patientName}}",
  "{{patientIdTypeLabel}}",
  "{{patientIdNumber}}",
  "{{doctorName}}",
  "{{clinicName}}",
  "{{clinicLogo}}",
  "{{diagnosisSummary}}",
  "{{restDays}}",
  "{{restStartDate}}",
  "{{restEndDate}}",
  "{{purpose}}",
]

function emptyForm(): TemplateFormState {
  return {
    name: "",
    description: "",
    contentTemplate: DEFAULT_TEMPLATE_CONTENT,
  }
}

function hasMeaningfulContent(value: string): boolean {
  const normalized = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  return normalized.length > 0
}

function getApiErrorMessage(error: unknown): string | null {
  if (!error || typeof error !== "object") return null
  if (!("message" in error)) return null

  const apiError = error as ApiError
  if (typeof apiError.message === "string" && apiError.message.trim().length > 0) {
    return apiError.message
  }

  return null
}

function toFormState(template: MedicalCertificateTemplate): TemplateFormState {
  return {
    name: template.name,
    description: template.description ?? "",
    contentTemplate: normalizeTemplateContentForEditor(template.contentTemplate),
  }
}

function normalizeTemplateContentForEditor(value: string): string {
  return value
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
}

export default function MedicalCertificateTemplatesPage() {
  const { data: templates = [], isLoading } = useManageMedicalCertificateTemplates()
  const createMutation = useCreateMedicalCertificateTemplate()
  const updateMutation = useUpdateMedicalCertificateTemplate()
  const toggleMutation = useToggleMedicalCertificateTemplateActive()

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null)
  const [form, setForm] = useState<TemplateFormState>(emptyForm)

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const isToggling = toggleMutation.isPending

  const templateStats = useMemo(() => {
    const active = templates.filter((template) => template.isActive).length
    const system = templates.filter((template) => template.isSystem).length
    const custom = templates.length - system

    return { active, system, custom }
  }, [templates])

  const editingTemplate = useMemo(
    () => templates.find((template) => template.id === editingTemplateId) ?? null,
    [templates, editingTemplateId]
  )

  function setField<K extends keyof TemplateFormState>(field: K, value: TemplateFormState[K]) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetToNewTemplate() {
    setEditingTemplateId(null)
    setForm(emptyForm())
  }

  function startEditingTemplate(template: MedicalCertificateTemplate) {
    if (template.isSystem) {
      toast.error("Las plantillas del sistema no se pueden editar")
      return
    }

    setEditingTemplateId(template.id)
    setForm(toFormState(template))
  }

  function duplicateTemplate(template: MedicalCertificateTemplate) {
    setEditingTemplateId(null)
    setForm({
      name: `${template.name} (copia)`,
      description: template.description ?? "",
      contentTemplate: normalizeTemplateContentForEditor(template.contentTemplate),
    })
    toast.success("Plantilla cargada como copia. Puedes ajustarla y guardar.")
  }

  async function submitForm(event: React.FormEvent) {
    event.preventDefault()

    const name = form.name.trim()
    const description = form.description.trim()

    if (!name) {
      toast.error("El nombre de la plantilla es obligatorio")
      return
    }

    if (!hasMeaningfulContent(form.contentTemplate)) {
      toast.error("El contenido de la plantilla no puede estar vacío")
      return
    }

    const payload = {
      name,
      description: description || undefined,
      contentTemplate: form.contentTemplate,
    }

    try {
      if (editingTemplateId) {
        await updateMutation.mutateAsync({ id: editingTemplateId, payload })
        toast.success("Plantilla actualizada")
      } else {
        await createMutation.mutateAsync(payload)
        toast.success("Plantilla creada")
      }
      resetToNewTemplate()
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "No se pudo guardar la plantilla")
    }
  }

  async function toggleTemplate(template: MedicalCertificateTemplate) {
    try {
      await toggleMutation.mutateAsync(template.id)
      toast.success(
        template.isActive
          ? "Plantilla desactivada"
          : "Plantilla activada"
      )

      if (editingTemplateId === template.id) {
        setEditingTemplateId(null)
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "No se pudo cambiar el estado")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plantillas de certificados</h1>
          <p className="text-muted-foreground">
            Crea y administra tus plantillas personales para certificados médicos.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={resetToNewTemplate}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva plantilla
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plantillas activas</CardDescription>
            <CardTitle className="text-2xl">{templateStats.active}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plantillas personalizadas</CardDescription>
            <CardTitle className="text-2xl">{templateStats.custom}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Plantillas del sistema</CardDescription>
            <CardTitle className="text-2xl">{templateStats.system}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Listado de plantillas</CardTitle>
            <CardDescription>
              Las plantillas del sistema son de solo lectura. Puedes duplicarlas para personalizarlas en tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              isLoading={isLoading}
              isEmpty={templates.length === 0}
              emptyMessage="No hay plantillas registradas"
              emptyDescription="Crea la primera plantilla para agilizar la emisión de certificados."
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow
                      key={template.id}
                      className={!template.isActive ? "opacity-60" : undefined}
                    >
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant={template.isSystem ? "secondary" : "outline"}>
                          {template.isSystem ? "Sistema" : "Personalizada"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={template.isActive ? "default" : "secondary"}>
                          {template.isActive ? "Activa" : "Inactiva"}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate text-sm text-muted-foreground">
                        {template.description ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => duplicateTemplate(template)}
                          >
                            <Copy className="mr-1.5 h-4 w-4" />
                            {template.isSystem ? "Usar como base" : "Duplicar"}
                          </Button>

                          {!template.isSystem && (
                            <>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => startEditingTemplate(template)}
                              >
                                <Pencil className="mr-1.5 h-4 w-4" />
                                Editar
                              </Button>
                              <ConfirmButton
                                title={
                                  template.isActive
                                    ? "Desactivar plantilla"
                                    : "Activar plantilla"
                                }
                                description={
                                  template.isActive
                                    ? "La plantilla no aparecerá en el flujo de creación de certificados."
                                    : "La plantilla volverá a estar disponible para emitir certificados."
                                }
                                confirmLabel={template.isActive ? "Desactivar" : "Activar"}
                                loadingLabel="Guardando..."
                                confirmVariant={template.isActive ? "destructive" : "default"}
                                disabled={isToggling}
                                onConfirm={() => toggleTemplate(template)}
                                variant="outline"
                                size="sm"
                              >
                                <Power className="mr-1.5 h-4 w-4" />
                                {template.isActive ? "Desactivar" : "Activar"}
                              </ConfirmButton>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DataTable>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {editingTemplate ? "Editar plantilla" : "Nueva plantilla"}
            </CardTitle>
            <CardDescription>
              Define un formato base con variables para autocompletar desde paciente y consulta.
            </CardDescription>
            {editingTemplate && (
              <div className="pt-1 text-sm text-muted-foreground">
                Editando: <span className="font-medium text-foreground">{editingTemplate.name}</span>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={submitForm} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Nombre *</Label>
                <Input
                  id="template-name"
                  value={form.name}
                  onChange={(event) => setField("name", event.target.value)}
                  placeholder="Ej: Certificado reposo laboral"
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-description">Descripción</Label>
                <Textarea
                  id="template-description"
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                  placeholder="Uso recomendado, alcance y observaciones de esta plantilla"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-content">Contenido *</Label>
                <RichTextEditor
                  value={form.contentTemplate}
                  onChange={(value) => setField("contentTemplate", value)}
                  disabled={isSubmitting}
                  height={360}
                />
              </div>

              <div className="rounded-md border bg-muted/20 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                  Variables disponibles
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {TEMPLATE_VARIABLES.map((token) => (
                    <Badge key={token} variant="outline" className="font-mono text-[11px]">
                      {token}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2">
                {editingTemplate && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetToNewTemplate}
                    disabled={isSubmitting}
                  >
                    Cancelar edición
                  </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : editingTemplate ? (
                    "Guardar cambios"
                  ) : (
                    "Crear plantilla"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
