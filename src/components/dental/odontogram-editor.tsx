"use client"

import { useMemo, useState } from "react"
import { Info, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import type { OdontogramState } from "@/types/dental.model"

type MarkColor = "ROJO" | "AZUL"
type DentalSurface = "VESTIBULAR" | "LINGUAL" | "MESIAL" | "DISTAL" | "OCLUSAL"
type ToothSymbol =
  | "SEALANT"
  | "EXTRACTION"
  | "LOSS_CARIES"
  | "LOSS_OTHER"
  | "ENDODONTICS"
  | "CROWN"
  | "FILLING"
  | "CARIES"
type SurfaceSymbol = "SEALANT" | "FILLING" | "CARIES"
type ProsthesisType = "FIXED_PROSTHESIS" | "REMOVABLE_PROSTHESIS" | "TOTAL_PROSTHESIS"
type ActiveTool = ToothSymbol | ProsthesisType

type ClinicalMark = { type: ToothSymbol; color: MarkColor }
type SurfaceMark = { symbols?: Array<{ type: SurfaceSymbol; color: MarkColor }> }
type ToothValue = {
  symbols?: ClinicalMark[]
  surfaces?: Partial<Record<DentalSurface, SurfaceMark>>
  mobility?: 1 | 2 | 3 | null
  recession?: 1 | 2 | 3 | null
}
type ProsthesisGroup = {
  id?: string
  type: ProsthesisType
  color: MarkColor
  teeth: string[]
}

interface OdontogramEditorProps {
  value: OdontogramState
  onChange: (value: OdontogramState) => void
  patientAge?: number | null
  readOnly?: boolean
}

const PERMANENT_UPPER_RIGHT = ["18", "17", "16", "15", "14", "13", "12", "11"]
const PERMANENT_UPPER_LEFT = ["21", "22", "23", "24", "25", "26", "27", "28"]
const TEMPORARY_UPPER_RIGHT = ["55", "54", "53", "52", "51"]
const TEMPORARY_UPPER_LEFT = ["61", "62", "63", "64", "65"]
const TEMPORARY_LOWER_RIGHT = ["85", "84", "83", "82", "81"]
const TEMPORARY_LOWER_LEFT = ["71", "72", "73", "74", "75"]
const PERMANENT_LOWER_RIGHT = ["48", "47", "46", "45", "44", "43", "42", "41"]
const PERMANENT_LOWER_LEFT = ["31", "32", "33", "34", "35", "36", "37", "38"]

const ARCHES = [
  PERMANENT_UPPER_RIGHT,
  PERMANENT_UPPER_LEFT,
  TEMPORARY_UPPER_RIGHT,
  TEMPORARY_UPPER_LEFT,
  TEMPORARY_LOWER_RIGHT,
  TEMPORARY_LOWER_LEFT,
  PERMANENT_LOWER_RIGHT,
  PERMANENT_LOWER_LEFT,
]

const SURFACE_SYMBOLS: SurfaceSymbol[] = ["SEALANT", "FILLING", "CARIES"]
const TOOTH_SYMBOLS: ToothSymbol[] = ["EXTRACTION", "LOSS_CARIES", "LOSS_OTHER", "ENDODONTICS", "CROWN"]
const PROSTHESIS_TOOLS: ProsthesisType[] = ["FIXED_PROSTHESIS", "REMOVABLE_PROSTHESIS", "TOTAL_PROSTHESIS"]

const SYMBOL_LABELS: Record<ToothSymbol, string> = {
  SEALANT: "Sellante",
  EXTRACTION: "Extracción indicada",
  LOSS_CARIES: "Pérdida por caries",
  LOSS_OTHER: "Pérdida otra causa",
  ENDODONTICS: "Endodoncia",
  CROWN: "Corona",
  FILLING: "Obturado",
  CARIES: "Caries",
}

const PROSTHESIS_LABELS: Record<ProsthesisType, string> = {
  FIXED_PROSTHESIS: "Prótesis fija",
  REMOVABLE_PROSTHESIS: "Prótesis removible",
  TOTAL_PROSTHESIS: "Prótesis total",
}

function getTeeth(value: OdontogramState): Record<string, ToothValue> {
  return (value.teeth ?? {}) as Record<string, ToothValue>
}

function getGroups(value: OdontogramState): ProsthesisGroup[] {
  return Array.isArray(value.prosthesisGroups) ? (value.prosthesisGroups as ProsthesisGroup[]) : []
}

function isTemporary(tooth: string) {
  return tooth.startsWith("5") || tooth.startsWith("6") || tooth.startsWith("7") || tooth.startsWith("8")
}

function sequenceBetween(start: string, end: string): string[] | null {
  const arch = ARCHES.find((items) => items.includes(start) && items.includes(end))
  if (!arch) return null
  const startIndex = arch.indexOf(start)
  const endIndex = arch.indexOf(end)
  const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex]
  const sequence = arch.slice(from, to + 1)
  return sequence.length >= 2 ? sequence : null
}

function prosthesisArchForTooth(tooth: string): "UPPER" | "LOWER" {
  return ["1", "2", "5", "6"].includes(tooth[0]) ? "UPPER" : "LOWER"
}

function hasBlockingEndpointMark(tooth: string, teeth: Record<string, ToothValue>) {
  const symbolTypes = (teeth[tooth]?.symbols ?? []).map((symbol) => symbol.type)
  return symbolTypes.includes("EXTRACTION") || symbolTypes.includes("LOSS_CARIES") || symbolTypes.includes("LOSS_OTHER")
}

function groupsOverlap(first: string[], second: string[]) {
  const secondSet = new Set(second)
  return first.some((tooth) => secondSet.has(tooth))
}

function surfaceSymbolsForTooth(tooth: ToothValue): Array<{ type: SurfaceSymbol; color: MarkColor; surface: DentalSurface }> {
  return Object.entries(tooth.surfaces ?? {}).flatMap(([surface, mark]) =>
    (mark?.symbols ?? []).map((symbol) => ({ ...symbol, surface: surface as DentalSurface }))
  )
}

function buildWarnings(value: OdontogramState, patientAge?: number | null) {
  const teeth = getTeeth(value)
  const warnings: string[] = []

  if (patientAge != null) {
    Object.keys(teeth).forEach((tooth) => {
      if (patientAge >= 13 && isTemporary(tooth)) {
        warnings.push(`Pieza ${tooth}: revisar, normalmente no corresponde a dentición permanente por edad.`)
      }
    })
  }

  return warnings
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function tone(color: MarkColor) {
  return color === "ROJO" ? "#dc2626" : "#2563eb"
}

function softTone(color: MarkColor) {
  return color === "ROJO" ? "#FAAD9D" : "#88B7F7"
}

function colorButtonClass(item: MarkColor, selected: MarkColor) {
  if (item !== selected) return ""
  return item === "ROJO"
    ? "border-red-600 bg-red-600 text-white hover:bg-red-700 hover:text-white"
    : "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:text-white"
}

function isSurfaceTool(tool: ActiveTool): tool is SurfaceSymbol {
  return SURFACE_SYMBOLS.includes(tool as SurfaceSymbol)
}

function isProsthesisTool(tool: ActiveTool): tool is ProsthesisType {
  return PROSTHESIS_TOOLS.includes(tool as ProsthesisType)
}

function fixedColorForTool(tool: ActiveTool): MarkColor | null {
  if (tool === "CARIES" || tool === "EXTRACTION") return "ROJO"
  if (tool === "FILLING" || tool === "LOSS_CARIES") return "AZUL"
  return null
}

function nextToolForColorChange(tool: ActiveTool, nextColor: MarkColor): ActiveTool {
  if (tool === "CARIES" && nextColor === "AZUL") return "FILLING"
  if (tool === "FILLING" && nextColor === "ROJO") return "CARIES"
  if (tool === "EXTRACTION" && nextColor === "AZUL") return "LOSS_CARIES"
  if (tool === "LOSS_CARIES" && nextColor === "ROJO") return "EXTRACTION"
  return tool
}

export function OdontogramEditor({ value, onChange, patientAge, readOnly = false }: OdontogramEditorProps) {
  const [color, setColor] = useState<MarkColor>("ROJO")
  const [tool, setTool] = useState<ActiveTool>("CARIES")
  const [groupStart, setGroupStart] = useState<string | null>(null)
  const [showRules, setShowRules] = useState(false)

  const activeColor = fixedColorForTool(tool) ?? color
  const teeth = getTeeth(value)
  const groups = getGroups(value)
  const warnings = useMemo(() => buildWarnings(value, patientAge), [value, patientAge])

  function selectTool(nextTool: ActiveTool) {
    setTool(nextTool)
    setGroupStart(null)
    const fixedColor = fixedColorForTool(nextTool)
    if (fixedColor) setColor(fixedColor)
  }

  function selectColor(nextColor: MarkColor) {
    const resolvedTool = nextToolForColorChange(tool, nextColor)
    setColor(nextColor)
    if (resolvedTool !== tool) {
      setTool(resolvedTool)
      setGroupStart(null)
    }
  }

  function commit(next: OdontogramState) {
    if (readOnly) return
    onChange({ ...next, warnings: buildWarnings(next, patientAge) })
  }

  function toggleSurfaceSymbol(tooth: string, surface: DentalSurface) {
    const current = teeth[tooth] ?? {}
    const surfaces = current.surfaces ?? {}
    const currentSurface = surfaces[surface] ?? {}
    const symbols = currentSurface.symbols ?? []
    const exists = symbols.some((symbol) => symbol.type === tool && symbol.color === activeColor)
    const nextSymbols = exists
      ? symbols.filter((symbol) => !(symbol.type === tool && symbol.color === activeColor))
      : [...symbols, { type: tool as SurfaceSymbol, color: activeColor }]

    const surfaceTypes = nextSymbols.map((symbol) => symbol.type)
    const toothTypes = (current.symbols ?? []).map((symbol) => symbol.type)
    if (surfaceTypes.includes("SEALANT") && toothTypes.includes("EXTRACTION")) {
      toast.error("No se puede combinar sellante con extracción en la misma pieza")
      return
    }

    if (tool === "SEALANT" && !exists) {
      const surfaceSymbols = surfaceSymbolsForTooth(current)
      const hasSealant = surfaceSymbols.some((symbol) => symbol.type === "SEALANT")
      const hasEndodontics = toothTypes.includes("ENDODONTICS")
      if (hasSealant || hasEndodontics) {
        toast.error("Solo puede existir un sellante o una endodoncia por pieza")
        return
      }
    }

    commit({
      ...value,
      teeth: {
        ...teeth,
        [tooth]: {
          ...current,
          surfaces: {
            ...surfaces,
            [surface]: { symbols: nextSymbols },
          },
        },
      },
    })
  }

  function toggleToothSymbol(tooth: string) {
    const current = teeth[tooth] ?? {}
    const symbols = current.symbols ?? []
    const exists = symbols.some((symbol) => symbol.type === tool && symbol.color === activeColor)
    const nextSymbols = exists
      ? symbols.filter((symbol) => !(symbol.type === tool && symbol.color === activeColor))
      : [...symbols, { type: tool as ToothSymbol, color: activeColor }]

    const symbolTypes = nextSymbols.map((symbol) => symbol.type)
    const surfaceHasSealant = surfaceSymbolsForTooth(current).some((symbol) => symbol.type === "SEALANT")
    if (symbolTypes.includes("EXTRACTION") && surfaceHasSealant) {
      toast.error("No se puede combinar sellante con extracción en la misma pieza")
      return
    }

    if (tool === "ENDODONTICS" && !exists) {
      const alreadyHasEndodontics = symbols.some((symbol) => symbol.type === "ENDODONTICS")
      if (surfaceHasSealant || alreadyHasEndodontics) {
        toast.error("Solo puede existir un sellante o una endodoncia por pieza")
        return
      }
    }

    commit({
      ...value,
      teeth: {
        ...teeth,
        [tooth]: {
          ...current,
          symbols: nextSymbols,
        },
      },
    })
  }

  function addProsthesis(tooth: string) {
    if (!groupStart) {
      setGroupStart(tooth)
      return
    }

    const sequence = sequenceBetween(groupStart, tooth)
    if (!sequence) {
      toast.error("La prótesis debe iniciar y terminar en piezas secuenciales del mismo grupo dental")
      setGroupStart(null)
      return
    }

    if (hasBlockingEndpointMark(groupStart, teeth) || hasBlockingEndpointMark(tooth, teeth)) {
      toast.error("La prótesis no puede iniciar ni terminar en piezas con extracción o pérdida")
      setGroupStart(null)
      return
    }

    const currentType = tool as ProsthesisType
    const currentArch = prosthesisArchForTooth(groupStart)
    const hasOverlappingGroup = groups.some((group) => groupsOverlap(group.teeth, sequence))
    if (hasOverlappingGroup) {
      toast.error("No se puede crear una prótesis sobre un rango que cruza otra prótesis")
      setGroupStart(null)
      return
    }

    const hasTotalOnSameArch = groups.some(
      (group) => group.type === "TOTAL_PROSTHESIS" && prosthesisArchForTooth(group.teeth[0]) === currentArch
    )
    if (hasTotalOnSameArch || (currentType === "TOTAL_PROSTHESIS" && groups.some((group) => prosthesisArchForTooth(group.teeth[0]) === currentArch))) {
      toast.error("La prótesis total no permite otra prótesis en la misma arcada")
      setGroupStart(null)
      return
    }

    commit({
      ...value,
      prosthesisGroups: [...groups, { id: createId(), type: currentType, color: activeColor, teeth: sequence }],
    })
    setGroupStart(null)
  }

  function handleSurfaceClick(tooth: string, surface: DentalSurface) {
    if (readOnly) return
    if (isProsthesisTool(tool)) {
      addProsthesis(tooth)
      return
    }
    if (isSurfaceTool(tool)) {
      toggleSurfaceSymbol(tooth, surface)
      return
    }
    toggleToothSymbol(tooth)
  }

  function handleToothCenterClick(tooth: string) {
    if (readOnly) return
    if (isProsthesisTool(tool)) {
      addProsthesis(tooth)
      return
    }
    if (isSurfaceTool(tool)) {
      toggleSurfaceSymbol(tooth, "OCLUSAL")
      return
    }
    toggleToothSymbol(tooth)
  }

  function setPeriodontalValue(tooth: string, field: "mobility" | "recession", rawValue: string) {
    if (readOnly) return
    const numericValue = rawValue === "" ? null : Number(rawValue)
    commit({
      ...value,
      teeth: {
        ...teeth,
        [tooth]: {
          ...(teeth[tooth] ?? {}),
          [field]: numericValue as 1 | 2 | 3 | null,
        },
      },
    })
  }

  function removeGroup(index: number) {
    if (readOnly) return
    commit({
      ...value,
      prosthesisGroups: groups.filter((_, groupIndex) => groupIndex !== index),
    })
  }

  function clearOdontogram() {
    if (readOnly) return
    commit({ teeth: {}, prosthesisGroups: [], warnings: [] })
    setGroupStart(null)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Simbología</CardTitle>
          <CardDescription>Rojo: patología actual. Azul: tratamiento realizado.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Legend label="Sellante" symbol="SEALANT" />
            <Legend label="Extracción / pérdida" symbol="EXTRACTION" />
            <Legend label="Endodoncia" symbol="ENDODONTICS" />
            <Legend label="Corona" symbol="CROWN" />
            <Legend label="Obturado / caries" symbol="FILLING" />
            <Legend label="Prótesis" symbol="FIXED_PROSTHESIS" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Odontograma</CardTitle>
            <CardDescription>
              {readOnly
                ? "Vista histórica solo lectura."
                : groupStart
                  ? `Seleccione pieza final para la prótesis iniciada en ${groupStart}`
                  : isSurfaceTool(tool)
                    ? "Seleccione una superficie de la pieza dental."
                    : "Seleccione el centro de la pieza o un rango de prótesis."}
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto px-4 pb-5">
            <div className="min-w-[760px] space-y-4">
              <ToothArch title="Superior permanente" rows={[PERMANENT_UPPER_RIGHT, PERMANENT_UPPER_LEFT]} teeth={teeth} groups={groups} readOnly={readOnly} onSurfaceClick={handleSurfaceClick} onCenterClick={handleToothCenterClick} onPeriodontalChange={setPeriodontalValue} />
              <ToothArch title="Superior temporal" rows={[TEMPORARY_UPPER_RIGHT, TEMPORARY_UPPER_LEFT]} teeth={teeth} groups={groups} readOnly={readOnly} onSurfaceClick={handleSurfaceClick} onCenterClick={handleToothCenterClick} onPeriodontalChange={setPeriodontalValue} compact />
              <ToothArch title="Inferior temporal" rows={[TEMPORARY_LOWER_RIGHT, TEMPORARY_LOWER_LEFT]} teeth={teeth} groups={groups} readOnly={readOnly} onSurfaceClick={handleSurfaceClick} onCenterClick={handleToothCenterClick} onPeriodontalChange={setPeriodontalValue} compact />
              <ToothArch title="Inferior permanente" rows={[PERMANENT_LOWER_RIGHT, PERMANENT_LOWER_LEFT]} teeth={teeth} groups={groups} readOnly={readOnly} onSurfaceClick={handleSurfaceClick} onCenterClick={handleToothCenterClick} onPeriodontalChange={setPeriodontalValue} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!readOnly && (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle>Herramientas</CardTitle>
                    <CardDescription>El centro aplica marcas generales; los bordes aplican superficies.</CardDescription>
                  </div>
                  <Button type="button" variant="outline" size="icon-sm" onClick={() => setShowRules(true)}>
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["ROJO", "AZUL"] as MarkColor[]).map((item) => (
                      <Button key={item} type="button" variant="outline" className={colorButtonClass(item, activeColor)} onClick={() => selectColor(item)}>
                        {item}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Por superficie</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SURFACE_SYMBOLS.map((item) => (
                      <Button key={item} type="button" variant={tool === item ? "default" : "outline"} onClick={() => selectTool(item)} className="justify-start text-sm">
                        {SYMBOL_LABELS[item]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Por pieza</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {TOOTH_SYMBOLS.map((item) => (
                      <Button key={item} type="button" variant={tool === item ? "default" : "outline"} onClick={() => selectTool(item)} className="justify-start text-sm">
                        {SYMBOL_LABELS[item]}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Prótesis por rango</Label>
                  <div className="space-y-2">
                    {PROSTHESIS_TOOLS.map((item) => (
                      <Button key={item} type="button" variant={tool === item ? "default" : "outline"} onClick={() => selectTool(item)} className="w-full justify-start text-sm">
                        {PROSTHESIS_LABELS[item]}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button type="button" variant="outline" className="w-full" onClick={clearOdontogram}>
                  Limpiar odontograma
                </Button>
              </CardContent>
            </Card>
          )}

          {(groups.length > 0 || warnings.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Validaciones</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                {warnings.map((warning) => (
                  <p key={warning}>{warning}</p>
                ))}
                {groups.map((group, index) => (
                  <div key={`${group.type}-${group.teeth.join("-")}-${index}`} className="flex items-center justify-between gap-2 rounded-md border p-2">
                    <span>{PROSTHESIS_LABELS[group.type]}: {group.teeth.join(", ")}</span>
                    {!readOnly && (
                      <Button type="button" variant="ghost" size="icon-sm" onClick={() => removeGroup(index)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {showRules && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4">
          <div className="w-full max-w-lg rounded-lg border bg-background p-5 shadow-lg">
            <div className="space-y-3 text-sm">
              <h3 className="text-lg font-semibold">Reglas del odontograma</h3>
              <p>Movilidad y recesión aceptan valores 1, 2, 3 o vacío.</p>
              <p>Sellante, obturado y caries se registran sobre superficies. Extracción, pérdida, endodoncia y corona se registran sobre la pieza.</p>
              <p>Endodoncia puede combinarse con corona. Prótesis fija o removible puede combinarse con corona o endodoncia.</p>
              <p>Sellante no puede combinarse con extracción. Prótesis no puede aplicarse sobre piezas marcadas como pérdida.</p>
              <p>Para prótesis, seleccione la herramienta, haga clic en pieza inicial y luego en pieza final del mismo grupo dental.</p>
              <p>El odontograma puede guardarse en blanco como versión inicial.</p>
            </div>
            <div className="mt-5 flex justify-end">
              <Button type="button" onClick={() => setShowRules(false)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ToothArch({
  title,
  rows,
  teeth,
  groups,
  compact = false,
  readOnly,
  onSurfaceClick,
  onCenterClick,
  onPeriodontalChange,
}: {
  title: string
  rows: string[][]
  teeth: Record<string, ToothValue>
  groups: ProsthesisGroup[]
  compact?: boolean
  readOnly?: boolean
  onSurfaceClick: (tooth: string, surface: DentalSurface) => void
  onCenterClick: (tooth: string) => void
  onPeriodontalChange: (tooth: string, field: "mobility" | "recession", value: string) => void
}) {
  return (
    <section className="space-y-2 rounded-md border p-3">
      <p className="text-sm font-medium">{title}</p>
      {!compact && <PeriodontalRow label="Recesión" rows={rows} field="recession" teeth={teeth} readOnly={readOnly} onChange={onPeriodontalChange} />}
      {!compact && <PeriodontalRow label="Movilidad" rows={rows} field="mobility" teeth={teeth} readOnly={readOnly} onChange={onPeriodontalChange} />}
      <div className="grid grid-cols-[80px_1fr] items-start gap-2">
        <span aria-hidden="true" />
        <div className="flex justify-center gap-6">
          {rows.map((row, index) => (
            <div key={index} className="relative flex gap-1.5 pb-5">
              <ProsthesisOverlay row={row} groups={groups} />
              {row.map((piece) => (
                <ToothSvg
                  key={piece}
                  piece={piece}
                  temporary={isTemporary(piece)}
                  value={teeth[piece]}
                  readOnly={readOnly}
                  onSurfaceClick={(surface) => onSurfaceClick(piece, surface)}
                  onCenterClick={() => onCenterClick(piece)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function PeriodontalRow({
  label,
  rows,
  field,
  teeth,
  readOnly,
  onChange,
}: {
  label: string
  rows: string[][]
  field: "mobility" | "recession"
  teeth: Record<string, ToothValue>
  readOnly?: boolean
  onChange: (tooth: string, field: "mobility" | "recession", value: string) => void
}) {
  return (
    <div className="grid grid-cols-[80px_1fr] items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex justify-center gap-6 overflow-hidden">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5">
            {row.map((piece) => (
              <select key={piece} value={teeth[piece]?.[field] ?? ""} disabled={readOnly} onChange={(event) => onChange(piece, field, event.target.value)} className="h-7 w-9 rounded border bg-background text-xs">
                <option value=""></option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ToothSvg({
  piece,
  temporary,
  value,
  readOnly,
  onSurfaceClick,
  onCenterClick,
}: {
  piece: string
  temporary: boolean
  value?: ToothValue
  readOnly?: boolean
  onSurfaceClick: (surface: DentalSurface) => void
  onCenterClick: () => void
}) {
  const surfaces = value?.surfaces ?? {}
  const toothMarks = value?.symbols ?? []
  const visibleMarks = [...toothMarks, ...visibleSurfaceMarks(surfaces)]
  const isMissing = toothMarks.some((mark) => mark.type === "LOSS_CARIES" || mark.type === "LOSS_OTHER")
  const cursor = readOnly ? "cursor-default" : "cursor-pointer"

  return (
    <div className="flex w-9 flex-col items-center gap-1 text-xs">
      <span className="font-medium leading-none">{piece}</span>
      <svg viewBox="0 0 44 44" className="h-9 w-9 overflow-visible" role="img" aria-label={`Pieza ${piece}`}>
        {temporary ? (
          <TemporaryTooth surfaces={surfaces} cursor={cursor} onSurfaceClick={onSurfaceClick} onCenterClick={onCenterClick} />
        ) : (
          <PermanentTooth surfaces={surfaces} cursor={cursor} onSurfaceClick={onSurfaceClick} onCenterClick={onCenterClick} />
        )}
        <MarkStack marks={visibleMarks} />
        {isMissing && <line x1="5" y1="5" x2="39" y2="39" stroke="#111827" strokeWidth="2" className="pointer-events-none" />}
      </svg>
    </div>
  )
}

function PermanentTooth({
  surfaces,
  cursor,
  onSurfaceClick,
  onCenterClick,
}: {
  surfaces: Partial<Record<DentalSurface, SurfaceMark>>
  cursor: string
  onSurfaceClick: (surface: DentalSurface) => void
  onCenterClick: () => void
}) {
  return (
    <>
      <SurfacePolygon points="2,2 42,2 32,12 12,12" surface="VESTIBULAR" mark={surfaces.VESTIBULAR} cursor={cursor} onClick={onSurfaceClick} />
      <SurfacePolygon points="2,42 42,42 32,32 12,32" surface="LINGUAL" mark={surfaces.LINGUAL} cursor={cursor} onClick={onSurfaceClick} />
      <SurfacePolygon points="2,2 12,12 12,32 2,42" surface="MESIAL" mark={surfaces.MESIAL} cursor={cursor} onClick={onSurfaceClick} />
      <SurfacePolygon points="42,2 32,12 32,32 42,42" surface="DISTAL" mark={surfaces.DISTAL} cursor={cursor} onClick={onSurfaceClick} />
      <rect x="12" y="12" width="20" height="20" fill={surfaceFill(surfaces.OCLUSAL)} stroke="#111827" className={cursor} onClick={onCenterClick} />
    </>
  )
}

function TemporaryTooth({
  surfaces,
  cursor,
  onSurfaceClick,
  onCenterClick,
}: {
  surfaces: Partial<Record<DentalSurface, SurfaceMark>>
  cursor: string
  onSurfaceClick: (surface: DentalSurface) => void
  onCenterClick: () => void
}) {
  return (
    <>
      <circle cx="22" cy="22" r="19" fill="#ffffff" stroke="#111827" />
      <path d="M22 22 L10 8 A19 19 0 0 1 34 8 Z" fill={surfaceFill(surfaces.VESTIBULAR)} stroke="#111827" className={cursor} onClick={() => onSurfaceClick("VESTIBULAR")} />
      <path d="M22 22 L34 36 A19 19 0 0 1 10 36 Z" fill={surfaceFill(surfaces.LINGUAL)} stroke="#111827" className={cursor} onClick={() => onSurfaceClick("LINGUAL")} />
      <path d="M22 22 L10 8 A19 19 0 0 0 10 36 Z" fill={surfaceFill(surfaces.MESIAL)} stroke="#111827" className={cursor} onClick={() => onSurfaceClick("MESIAL")} />
      <path d="M22 22 L34 8 A19 19 0 0 1 34 36 Z" fill={surfaceFill(surfaces.DISTAL)} stroke="#111827" className={cursor} onClick={() => onSurfaceClick("DISTAL")} />
      <circle cx="22" cy="22" r="8" fill={surfaceFill(surfaces.OCLUSAL)} stroke="#111827" className={cursor} onClick={onCenterClick} />
    </>
  )
}

function SurfacePolygon({
  points,
  surface,
  mark,
  cursor,
  onClick,
}: {
  points: string
  surface: DentalSurface
  mark?: SurfaceMark
  cursor: string
  onClick: (surface: DentalSurface) => void
}) {
  return (
    <polygon
      points={points}
      fill={surfaceFill(mark)}
      stroke="#111827"
      strokeWidth="1"
      className={cursor}
      onClick={() => onClick(surface)}
    />
  )
}

function ProsthesisOverlay({ row, groups }: { row: string[]; groups: ProsthesisGroup[] }) {
  const rowGroups = groups.filter((group) => group.teeth.some((piece) => row.includes(piece)))
  if (rowGroups.length === 0) return null

  return (
    <svg className="pointer-events-none absolute left-0 top-[54px] h-5 w-full overflow-visible" aria-hidden="true">
      {rowGroups.map((group, index) => {
        const includedIndexes = group.teeth.map((piece) => row.indexOf(piece)).filter((item) => item >= 0)
        if (includedIndexes.length < 2) return null
        const from = Math.min(...includedIndexes)
        const to = Math.max(...includedIndexes)
        const x1 = from * 42 + 18
        const x2 = to * 42 + 18
        const y = 6 + index * 5
        return (
          <g key={`${group.type}-${group.teeth.join("-")}-${index}`}>
            {group.type === "TOTAL_PROSTHESIS" ? (
              <>
                <line x1={x1} y1={y - 3} x2={x2} y2={y - 3} stroke={tone(group.color)} strokeWidth="2" />
                <line x1={x1} y1={y + 3} x2={x2} y2={y + 3} stroke={tone(group.color)} strokeWidth="2" />
              </>
            ) : (
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={tone(group.color)} strokeWidth="2" strokeDasharray={group.type === "REMOVABLE_PROSTHESIS" ? "5 3" : undefined} />
            )}
            <circle cx={x1} cy={y} r="2" fill={tone(group.color)} />
            <circle cx={x2} cy={y} r="2" fill={tone(group.color)} />
          </g>
        )
      })}
    </svg>
  )
}

function surfaceFill(mark?: SurfaceMark) {
  const fillSymbol = mark?.symbols?.find((symbol) => symbol.type !== "SEALANT")
  return fillSymbol ? softTone(fillSymbol.color) : "#ffffff"
}

function visibleSurfaceMarks(surfaces: Partial<Record<DentalSurface, SurfaceMark>>): ClinicalMark[] {
  return Object.values(surfaces)
    .flatMap((mark) => mark?.symbols ?? [])
    .filter((symbol) => symbol.type === "SEALANT")
    .map((symbol) => ({ type: symbol.type, color: symbol.color }))
}

function MarkStack({ marks }: { marks: ClinicalMark[] }) {
  const visibleMarks = marks.filter((mark) => mark.type !== "CARIES" && mark.type !== "FILLING")
  if (visibleMarks.length === 0) return null

  const iconSize = visibleMarks.length > 1 ? 13 : 16
  const startX = 22 - ((visibleMarks.length - 1) * 7) / 2

  return (
    <g className="pointer-events-none">
      {visibleMarks.slice(0, 3).map((mark, index) => (
        <g key={`${mark.type}-${mark.color}-${index}`} transform={`translate(${startX + index * 7 - iconSize / 2} ${22 - iconSize / 2})`} color={tone(mark.color)}>
          <SymbolGlyph symbol={mark.type} size={iconSize} />
        </g>
      ))}
    </g>
  )
}

function SymbolGlyph({ symbol, size = 18 }: { symbol: ToothSymbol | ProsthesisType; size?: number }) {
  const scale = size / 24
  return (
    <g transform={`scale(${scale})`}>
      {symbol === "SEALANT" && (
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="4" x2="12" y2="20" />
          <line x1="5.07" y1="8" x2="18.93" y2="16" />
          <line x1="18.93" y1="8" x2="5.07" y2="16" />
        </g>
      )}
      {(symbol === "EXTRACTION" || symbol === "LOSS_CARIES") && (
        <g stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </g>
      )}
      {symbol === "LOSS_OTHER" && (
        <g fill="none" stroke="currentColor">
          <circle cx="12" cy="12" r="8" strokeWidth="1.6" />
          <line x1="7.3" y1="7.3" x2="16.7" y2="16.7" strokeWidth="1.4" />
          <line x1="16.7" y1="7.3" x2="7.3" y2="16.7" strokeWidth="1.4" />
        </g>
      )}
      {symbol === "ENDODONTICS" && (
        <polygon points="12,4 4,20 20,20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      )}
      {symbol === "CROWN" && (
        <g fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="4" y="4" width="16" height="16" />
          <rect x="7.5" y="7.5" width="9" height="9" />
          <rect x="11" y="11" width="2" height="2" fill="currentColor" stroke="none" />
        </g>
      )}
      {symbol === "FIXED_PROSTHESIS" && (
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="2" y="10" width="4" height="4" />
          <rect x="18" y="10" width="4" height="4" />
          <line x1="6" y1="12" x2="18" y2="12" strokeDasharray="2 2" />
        </g>
      )}
      {symbol === "REMOVABLE_PROSTHESIS" && (
        <g fill="none" stroke="currentColor">
          <path d="M9,4 Q4,12 9,20" strokeWidth="1.6" />
          <path d="M15,4 Q20,12 15,20" strokeWidth="1.6" />
          <line x1="9.5" y1="12" x2="14.5" y2="12" strokeWidth="1.4" strokeDasharray="2 2" />
        </g>
      )}
      {symbol === "TOTAL_PROSTHESIS" && (
        <g stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="15" x2="20" y2="15" />
        </g>
      )}
    </g>
  )
}

function Legend({ label, symbol }: { label: string; symbol: ToothSymbol | ProsthesisType }) {
  const isColorOnly = symbol === "FILLING" || symbol === "CARIES"
  return (
    <div className="flex items-center gap-2 rounded-md border px-2 py-1.5">
      <span className="flex h-6 w-8 items-center justify-center rounded border text-xs">
        {isColorOnly ? <span className="h-3 w-5 rounded-sm bg-muted" /> : (
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-foreground">
            <SymbolGlyph symbol={symbol} size={24} />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </div>
  )
}










