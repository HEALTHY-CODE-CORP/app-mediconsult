"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, Info, Sparkles, Stethoscope, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export interface StomatognathicItem {
  id: number
  label: string
  shortLabel?: string
}

export const STOMATOGNATHIC_ITEMS: StomatognathicItem[] = [
  { id: 1, label: "Labios" },
  { id: 2, label: "Mejillas" },
  { id: 3, label: "Maxilar Superior" },
  { id: 4, label: "Maxilar Inferior" },
  { id: 5, label: "Lengua" },
  { id: 6, label: "Paladar" },
  { id: 7, label: "Piso de la boca" },
  { id: 8, label: "Carrillos" },
  { id: 9, label: "Glándulas Salivales" },
  { id: 10, label: "Oro Faringe" },
  { id: 11, label: "ATM (Articulación temporomandibular)", shortLabel: "ATM" },
  { id: 12, label: "Ganglios" },
  { id: 13, label: "Otro" },
  { id: 14, label: "Sin Alteración" },
]

interface StomatognathicExamEditorProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  error?: string
}

export function StomatognathicExamEditor({
  value,
  onChange,
  readOnly = false,
  error,
}: StomatognathicExamEditorProps) {
  // Parse initial string into map of id -> description
  const initialParsed = useMemo(() => {
    const map = new Map<number, string>()
    if (!value) return map

    const lines = value.split("\n")
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed) continue

      // Match "1. Labios: Description" or "1. Labios" or "14. Sin Alteración"
      const match = trimmed.match(/^(\d+)\.\s*([^:]+)(?::\s*(.*))?$/)
      if (match) {
        const id = parseInt(match[1], 10)
        const desc = match[3]?.trim() ?? ""
        map.set(id, desc)
      }
    }
    return map
  }, [value])

  const [selectedMap, setSelectedMap] = useState<Map<number, string>>(initialParsed)
  const [manualTextMode, setManualTextMode] = useState(false)

  // Sync state when incoming value changes from outside (e.g., initial load)
  useEffect(() => {
    setSelectedMap(initialParsed)
  }, [initialParsed])

  function compileText(map: Map<number, string>): string {
    const sortedKeys = Array.from(map.keys()).sort((a, b) => a - b)
    const lines = sortedKeys.map((id) => {
      const item = STOMATOGNATHIC_ITEMS.find((i) => i.id === id)
      const name = item ? item.label : `Ítem ${id}`
      const desc = map.get(id)?.trim()
      if (id === 14) {
        return desc ? `14. Sin Alteración: ${desc}` : `14. Sin Alteración`
      }
      return desc ? `${id}. ${name}: ${desc}` : `${id}. ${name}`
    })
    return lines.join("\n")
  }

  function handleToggleItem(id: number) {
    if (readOnly) return

    setSelectedMap((prev) => {
      const next = new Map(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (id === 14) {
          // If "Sin Alteración" is selected, clear other items for convenience
          next.clear()
          next.set(14, "")
        } else {
          // If a specific region is selected, remove "Sin Alteración"
          next.delete(14)
          next.set(id, "")
        }
      }
      const compiled = compileText(next)
      onChange(compiled)
      return next
    })
  }

  function handleItemDescriptionChange(id: number, text: string) {
    if (readOnly) return

    setSelectedMap((prev) => {
      const next = new Map(prev)
      next.set(id, text)
      const compiled = compileText(next)
      onChange(compiled)
      return next
    })
  }

  function handleSelectAllNoAlteration() {
    if (readOnly) return
    const next = new Map<number, string>()
    next.set(14, "")
    setSelectedMap(next)
    onChange("14. Sin Alteración")
  }

  const selectedCount = selectedMap.size
  const selectedIds = Array.from(selectedMap.keys()).sort((a, b) => a - b)

  if (readOnly) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Stethoscope className="h-5 w-5 text-primary" />
            Examen del Sistema Estomatognático
          </CardTitle>
          <CardDescription>
            Evaluación clínica de estructuras anatómicas orales y periorales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {value ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {STOMATOGNATHIC_ITEMS.map((item) => {
                  const isSelected = selectedMap.has(item.id)
                  return (
                    <Badge
                      key={item.id}
                      variant={isSelected ? (item.id === 14 ? "secondary" : "default") : "outline"}
                      className={`text-xs ${
                        !isSelected ? "opacity-40" : ""
                      }`}
                    >
                      {item.id}. {item.label}
                    </Badge>
                  )
                })}
              </div>
              <div className="rounded-md border bg-muted/20 p-3 text-sm font-mono whitespace-pre-wrap">
                {value}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Sin registro de examen estomatognático.</p>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={error ? "border-destructive" : ""}>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-5 w-5 text-primary" />
              Examen del Sistema Estomatognático
              <span className="text-destructive font-bold">*</span>
            </CardTitle>
            <CardDescription>
              Seleccione una o varias regiones para registrar hallazgos patológicos o &ldquo;Sin Alteración&rdquo;. Requerido al menos 1 ítem.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs cursor-pointer"
              onClick={handleSelectAllNoAlteration}
            >
              <Check className="mr-1 h-3.5 w-3.5 text-green-600" />
              Marcar &ldquo;14. Sin Alteración&rdquo;
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Grid de 14 botones / casillas seleccionables */}
        <div>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
            Estructuras Anatómicas (Haga clic para seleccionar)
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {STOMATOGNATHIC_ITEMS.map((item) => {
              const isSelected = selectedMap.has(item.id)
              const isSinAlteracion = item.id === 14

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleToggleItem(item.id)}
                  className={`flex flex-col items-start justify-between rounded-lg border p-2.5 text-left transition-all cursor-pointer select-none ${
                    isSelected
                      ? isSinAlteracion
                        ? "border-green-500 bg-green-50 text-green-900 shadow-sm dark:bg-green-950/40 dark:text-green-200 dark:border-green-600"
                        : "border-primary bg-primary/10 text-primary font-medium shadow-sm ring-1 ring-primary/30 dark:bg-primary/20"
                      : "border-border bg-card hover:bg-muted/50 hover:border-muted-foreground/30 text-card-foreground"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-1 mb-1">
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        isSelected
                          ? isSinAlteracion
                            ? "bg-green-600 text-white"
                            : "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {item.id}
                    </span>
                    {isSelected && (
                      <Check
                        className={`h-4 w-4 shrink-0 ${
                          isSinAlteracion ? "text-green-600 dark:text-green-400" : "text-primary"
                        }`}
                      />
                    )}
                  </div>
                  <span className="text-xs leading-tight font-medium line-clamp-2">
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Inputs para describir hallazgos de ítems seleccionados */}
        {selectedCount > 0 ? (
          <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold">
                  Detalle de hallazgos ({selectedCount} {selectedCount === 1 ? "seleccionado" : "seleccionados"})
                </h4>
              </div>
              <Badge variant="outline" className="text-xs">
                Orden secuencial MSP 033
              </Badge>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {selectedIds.map((id) => {
                const item = STOMATOGNATHIC_ITEMS.find((i) => i.id === id)
                const isSinAlteracion = id === 14
                const desc = selectedMap.get(id) ?? ""

                return (
                  <div
                    key={id}
                    className="rounded-md border bg-background p-3 space-y-1.5 shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold flex items-center gap-1.5">
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary text-[10px] font-bold">
                          {id}
                        </span>
                        {item?.label}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={() => handleToggleItem(id)}
                      >
                        ×
                      </Button>
                    </div>
                    <Input
                      value={desc}
                      onChange={(e) => handleItemDescriptionChange(id, e.target.value)}
                      placeholder={
                        isSinAlteracion
                          ? "Observación de sin alteración (opcional)..."
                          : `Descripción de ${item?.label.toLowerCase()} (ej. lesión, color, volumen)...`
                      }
                      className="h-8 text-xs"
                    />
                  </div>
                )
              })}
            </div>

            {/* Vista previa o edición consolidada */}
            <div className="space-y-1.5 pt-2 border-t">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  Texto estructurado generado:
                </Label>
                <button
                  type="button"
                  onClick={() => setManualTextMode(!manualTextMode)}
                  className="text-[11px] text-primary hover:underline cursor-pointer"
                >
                  {manualTextMode ? "Volver a modo automático" : "Editar texto directamente"}
                </button>
              </div>

              {manualTextMode ? (
                <Textarea
                  rows={Math.max(3, selectedCount + 1)}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="1. Labios: ...&#10;6. Paladar: ..."
                  className="font-mono text-xs"
                />
              ) : (
                <div className="rounded-md border bg-background px-3 py-2 text-xs font-mono whitespace-pre-wrap text-foreground/90 max-h-40 overflow-y-auto">
                  {value || <span className="text-muted-foreground italic">Ningún ítem compilado</span>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm text-muted-foreground bg-muted/10">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <p>
              Por favor seleccione al menos una opción anatómica o haga clic en{" "}
              <strong className="text-foreground">&ldquo;Marcar 14. Sin Alteración&rdquo;</strong> para continuar.
            </p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs font-medium">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
