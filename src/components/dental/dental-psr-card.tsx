"use client"

import { useState } from "react"
import { AlertCircle, ChevronDown, ChevronUp, Clock, Eye, FileHeart, Plus, Stethoscope, Trash2, User, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PsrGridEditor } from "@/components/dental/psr-grid-editor"
import {
  useCreateDentalDatePsr,
  useCreateDentalRecordPsr,
  useDeleteDentalPsr,
  useDentalRecordPsr,
} from "@/hooks/use-dental"
import type { DentalPsrEvaluation } from "@/adapters/dental.adapter"
import type { DentalPsrScores } from "@/types/dental.model"

interface DentalPsrCardProps {
  dentalRecordId: string
  dentalDateId?: string
  initialPsrEvaluations?: DentalPsrEvaluation[]
  readOnly?: boolean
}

export function DentalPsrCard({
  dentalRecordId,
  dentalDateId,
  initialPsrEvaluations = [],
  readOnly = false,
}: DentalPsrCardProps) {
  const { data: psrEvaluations = initialPsrEvaluations } = useDentalRecordPsr(dentalRecordId)
  const createRecordPsr = useCreateDentalRecordPsr(dentalRecordId)
  const createDatePsr = useCreateDentalDatePsr(dentalDateId ?? "", dentalRecordId)
  const deletePsrMutation = useDeleteDentalPsr(dentalRecordId, dentalDateId)

  const [showForm, setShowForm] = useState(false)
  const [scores, setScores] = useState<DentalPsrScores>({})
  const [notes, setNotes] = useState("")
  const [expandedEvalId, setExpandedEvalId] = useState<string | null>(null)

  function resetForm() {
    setScores({})
    setNotes("")
    setShowForm(false)
  }

  async function handleSave() {
    const toothCount = Object.keys(scores).length
    if (toothCount === 0) {
      toast.error("Debe ingresar al menos un valor en la cuadrícula PSR")
      return
    }

    try {
      const payload = {
        dentalDateId: dentalDateId || undefined,
        scores,
        notes: notes.trim() || undefined,
      }

      if (dentalDateId) {
        await createDatePsr.mutateAsync(payload)
      } else {
        await createRecordPsr.mutateAsync(payload)
      }

      toast.success("Evaluación PSR guardada exitosamente")
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al guardar la evaluación PSR")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Está seguro de eliminar esta evaluación periodontal (PSR)?")) return
    try {
      await deletePsrMutation.mutateAsync(id)
      toast.success("Evaluación eliminada")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al eliminar la evaluación")
    }
  }

  const isSubmitting = createRecordPsr.isPending || createDatePsr.isPending
  const latestEvaluation = psrEvaluations[0] ?? null

  const getBadgeColor = (val?: string | null) => {
    if (!val) return "bg-muted text-muted-foreground"
    const upper = val.trim().toUpperCase()
    if (upper === "X") return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300"
    if (upper.startsWith("0")) return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300"
    if (upper.startsWith("1")) return "bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-950 dark:text-sky-300"
    if (upper.startsWith("2")) return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300"
    if (upper.startsWith("3")) return "bg-orange-100 text-orange-900 border-orange-400 dark:bg-orange-950 dark:text-orange-300"
    if (upper.startsWith("4")) return "bg-rose-100 text-rose-900 border-rose-400 dark:bg-rose-950 dark:text-rose-300"
    return "bg-primary/10 text-primary"
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-5 w-5 text-primary" />
              Evaluación Periodontal (PSR)
            </CardTitle>
            <CardDescription>
              Registro de Evaluación Periodontal por sextantes según sonda OMS.
            </CardDescription>
          </div>

          {!readOnly && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={showForm ? "ghost" : "outline"}
                size="sm"
                className="cursor-pointer"
                onClick={() => setShowForm(!showForm)}
              >
                {showForm ? (
                  <>
                    <X className="mr-1.5 h-4 w-4" />
                    Cancelar
                  </>
                ) : (
                  <>
                    <Plus className="mr-1.5 h-4 w-4" />
                    Nueva evaluación PSR
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Formulario de Nuevo Registro de PSR */}
        {showForm && (
          <div className="rounded-lg border-2 border-primary/30 bg-muted/10 p-4 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <FileHeart className="h-4 w-4 text-primary" />
                Nueva toma de evaluación PSR
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive cursor-pointer"
                onClick={() => setScores({})}
              >
                Limpiar cuadrícula
              </Button>
            </div>

            <PsrGridEditor scores={scores} onChange={setScores} />

            <div className="space-y-1.5 pt-2">
              <Label className="text-xs">Observaciones clínicas o notas periodontales (opcional)</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notas sobre sangrado, higiene, cálculo subgingival o derivación..."
                className="text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button type="button" variant="outline" size="sm" onClick={resetForm} className="cursor-pointer">
                Cancelar
              </Button>
              <Button type="button" size="sm" disabled={isSubmitting} onClick={handleSave} className="cursor-pointer">
                {isSubmitting ? "Guardando..." : "Guardar evaluación PSR"}
              </Button>
            </div>
          </div>
        )}

        {/* Historial de Evaluaciones PSR */}
        {psrEvaluations.length > 0 ? (
          <div className="space-y-4">
            {psrEvaluations.map((evalItem, index) => {
              const isExpanded = expandedEvalId === evalItem.id
              const summaries = evalItem.sextantSummaries || {}

              return (
                <div
                  key={evalItem.id}
                  className="rounded-lg border bg-card p-4 space-y-3 transition-colors hover:border-primary/40 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs font-normal">
                        {index === 0 ? "Más reciente" : `Evaluación #${psrEvaluations.length - index}`}
                      </Badge>
                      {evalItem.dentalDateId ? (
                        <Badge variant="outline" className="text-xs">
                          En cita odontológica
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          Apertura
                        </Badge>
                      )}
                      {evalItem.maxScore && (
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-muted-foreground">Máx:</span>
                          <Badge className={`${getBadgeColor(evalItem.maxScore)} text-xs`}>
                            {evalItem.maxScore}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {evalItem.recordedAtFormatted}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {evalItem.recordedByName}
                      </span>
                      {!readOnly && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive cursor-pointer"
                          onClick={() => handleDelete(evalItem.id)}
                          title="Eliminar evaluación"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Resumen de los 6 Sextantes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                    {["S1", "S2", "S3", "S4", "S5", "S6"].map((sKey) => {
                      const val = summaries[sKey]
                      return (
                        <div key={sKey} className="rounded border bg-muted/20 p-2 text-center">
                          <p className="text-[11px] text-muted-foreground font-medium">{sKey}</p>
                          <p className={`font-bold mt-0.5 ${val ? "text-foreground" : "text-muted-foreground"}`}>
                            {val || "—"}
                          </p>
                        </div>
                      )
                    })}
                  </div>

                  {/* Alerta de Criterio de Periodontograma si aplica */}
                  {evalItem.requiresPeriodontogram && (
                    <div className="rounded border border-orange-300/60 bg-orange-500/10 p-2.5 text-xs text-orange-900 dark:text-orange-200 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0 text-orange-600 dark:text-orange-400" />
                      <span>
                        Criterio para Periodontograma Completo ({evalItem.code3Count} dientes código 3, {evalItem.code4Count} dientes código 4).
                      </span>
                    </div>
                  )}

                  {evalItem.notes && (
                    <p className="text-xs text-muted-foreground italic border-t pt-2">
                      Nota: {evalItem.notes}
                    </p>
                  )}

                  {/* Toggle para ver cuadrícula completa detallada */}
                  <div className="border-t pt-2 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-xs text-primary hover:underline h-7 p-0 cursor-pointer"
                      onClick={() => setExpandedEvalId(isExpanded ? null : evalItem.id)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="mr-1 h-3.5 w-3.5" />
                          Ocultar cuadrícula detallada de piezas
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-3.5 w-3.5" />
                          Ver detalle de las 32 piezas dentales
                        </>
                      )}
                    </Button>
                  </div>

                  {isExpanded && (
                    <div className="pt-2">
                      <PsrGridEditor scores={evalItem.scores as DentalPsrScores} readOnly />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          !showForm && (
            <p className="text-sm text-muted-foreground">
              No hay evaluaciones periodontales (PSR) registradas aún.
            </p>
          )
        )}
      </CardContent>
    </Card>
  )
}
