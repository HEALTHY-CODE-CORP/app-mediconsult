"use client"

import React, { useCallback, useId, useMemo, useRef, useState } from "react"
import { AlertCircle, ChevronDown, ChevronUp, HelpCircle, Info, Sparkles, X as XIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { DentalPsrScores, DentalPsrSextantSummaries } from "@/types/dental.model"

export const PSR_UPPER_ROW = [
  "18", "17", "16", "15", "14", "13", "12", "11", "21", "22", "23", "24", "25", "26", "27", "28",
]

export const PSR_LOWER_ROW = [
  "48", "47", "46", "45", "44", "43", "42", "41", "31", "32", "33", "34", "35", "36", "37", "38",
]

export const PSR_ALL_TEETH = [...PSR_UPPER_ROW, ...PSR_LOWER_ROW]

export const SEXTANT_DEFINITIONS = [
  { id: "S1", name: "Sextante 1", subtitle: "Superior derecho", teeth: ["18", "17", "16", "15", "14"] },
  { id: "S2", name: "Sextante 2", subtitle: "Superior anterior", teeth: ["13", "12", "11", "21", "22", "23"] },
  { id: "S3", name: "Sextante 3", subtitle: "Superior izquierdo", teeth: ["24", "25", "26", "27", "28"] },
  { id: "S4", name: "Sextante 4", subtitle: "Inferior derecho", teeth: ["48", "47", "46", "45", "44"] },
  { id: "S5", name: "Sextante 5", subtitle: "Inferior anterior", teeth: ["43", "42", "41", "31", "32", "33"] },
  { id: "S6", name: "Sextante 6", subtitle: "Inferior izquierdo", teeth: ["34", "35", "36", "37", "38"] },
]

export const PSR_OPTIONS = [
  { value: "0", label: "0", desc: "Banda visible, sin sangrado" },
  { value: "0*", label: "0*", desc: "Banda visible, con furca/movilidad" },
  { value: "1", label: "1", desc: "Banda visible, sangrado al sondaje" },
  { value: "1*", label: "1*", desc: "Banda visible, sangrado + furca/movilidad" },
  { value: "2", label: "2", desc: "Banda visible, cálculo o sobrecontorno" },
  { value: "2*", label: "2*", desc: "Banda visible, cálculo + furca/movilidad" },
  { value: "3", label: "3", desc: "Banda parcialmente visible (3.5 - 5.5 mm)" },
  { value: "3*", label: "3*", desc: "Banda parcialmente visible + furca/movilidad" },
  { value: "4", label: "4", desc: "Banda totalmente oculta (> 5.5 mm)" },
  { value: "4*", label: "4*", desc: "Banda totalmente oculta + furca/movilidad" },
  { value: "X", label: "X", desc: "Diente ausente / No evaluable" },
]

export const PSR_REFERENCE_GUIDE = [
  {
    code: "0",
    characteristics: "Banda negra visible. No hay sangrado después del sondaje. No restauraciones sobrecontorneadas. No cálculo.",
    action: "Motivación y Fisioterapia Oral.",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    code: "1",
    characteristics: "Banda negra visible. Sangrado al sondaje. No cálculo. No restauraciones sobrecontorneadas.",
    action: "Motivación y Fisioterapia Oral. Profilaxis.",
    color: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300",
  },
  {
    code: "2",
    characteristics: "Banda negra visible. Sangrado al sondaje. Hay cálculo. Hay restauraciones sobrecontorneadas.",
    action: "Motivación y Fisioterapia Oral. Profilaxis/Detartraje y eliminación de factores retentivos.",
    color: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    code: "3",
    characteristics: "Banda negra parcialmente visible (Bolsa periodontal 3.5 - 5.5 mm).",
    action: "Motivación y Fisioterapia Oral. Periodontograma. Tratamiento Periodontal.",
    color: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300",
  },
  {
    code: "4",
    characteristics: "Banda negra oculta totalmente (Bolsa profunda > 5.5 mm).",
    action: "Motivación y Fisioterapia Oral. Periodontograma. Remisión a especialidad periodontal.",
    color: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
  },
  {
    code: "*",
    characteristics: "Acompaña a un código numérico: Lesión de furcación, recesión gingival severa o movilidad dentaria.",
    action: "Evaluación complementaria detallada y soporte periodontal.",
    color: "bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300",
  },
  {
    code: "X",
    characteristics: "Diente ausente (o edéntulo / no erupcionado).",
    action: "Registrar diente ausente en el sextante.",
    color: "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  },
]

export function scoreRank(score: string): number {
  const upper = score.trim().toUpperCase()
  if (!upper) return 0
  if (upper === "X") return 1
  const hasAsterisk = upper.endsWith("*")
  const numStr = upper.replace("*", "")
  const num = parseInt(numStr, 10)
  if (isNaN(num)) return 0
  return (num + 1) * 10 + (hasAsterisk ? 5 : 0)
}

export function computePsrSummaries(scores: DentalPsrScores) {
  const sextantSummaries: DentalPsrSextantSummaries = {}
  let overallMaxRank = -1
  let overallMaxScore: string | null = null
  let code3Count = 0
  let code4Count = 0

  for (const tooth of PSR_ALL_TEETH) {
    const raw = scores[tooth]?.trim().toUpperCase()
    if (raw) {
      if (raw.startsWith("3")) code3Count++
      if (raw.startsWith("4")) code4Count++
    }
  }

  for (const sextant of SEXTANT_DEFINITIONS) {
    let sextantMaxRank = -1
    let sextantMaxScore: string | null = null

    for (const tooth of sextant.teeth) {
      const val = scores[tooth]?.trim().toUpperCase()
      if (val) {
        const rank = scoreRank(val)
        if (rank > sextantMaxRank) {
          sextantMaxRank = rank
          sextantMaxScore = val
        }
      }
    }

    sextantSummaries[sextant.id] = sextantMaxScore
    if (sextantMaxScore && sextantMaxRank > overallMaxRank) {
      overallMaxRank = sextantMaxRank
      overallMaxScore = sextantMaxScore
    }
  }

  const requiresPeriodontogram = code3Count >= 3 || code4Count >= 1

  return {
    sextantSummaries,
    maxScore: overallMaxScore,
    code3Count,
    code4Count,
    requiresPeriodontogram,
  }
}

interface PsrGridEditorProps {
  scores: DentalPsrScores
  onChange?: (scores: DentalPsrScores) => void
  readOnly?: boolean
}

export function PsrGridEditor({
  scores,
  onChange,
  readOnly = false,
}: PsrGridEditorProps) {
  const [showGuide, setShowGuide] = useState(false)
  const cellRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [openPopoverTooth, setOpenPopoverTooth] = useState<string | null>(null)

  const { sextantSummaries, maxScore, code3Count, code4Count, requiresPeriodontogram } = useMemo(
    () => computePsrSummaries(scores),
    [scores]
  )

  const handleSetToothScore = useCallback(
    (tooth: string, value: string) => {
      if (readOnly || !onChange) return
      const next = { ...scores }
      if (!value) {
        delete next[tooth]
      } else {
        next[tooth] = value
      }
      onChange(next)
      setOpenPopoverTooth(null)
    },
    [scores, onChange, readOnly]
  )

  const focusTooth = useCallback((tooth: string) => {
    cellRefs.current[tooth]?.focus()
  }, [])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, tooth: string) => {
      if (readOnly) return

      const key = event.key
      const upperKey = key.toUpperCase()

      // Numbers 0, 1, 2, 3, 4
      if (["0", "1", "2", "3", "4"].includes(key)) {
        event.preventDefault()
        handleSetToothScore(tooth, key)
        // Advance to next tooth
        const currIndex = PSR_ALL_TEETH.indexOf(tooth)
        if (currIndex >= 0 && currIndex < PSR_ALL_TEETH.length - 1) {
          focusTooth(PSR_ALL_TEETH[currIndex + 1])
        }
        return
      }

      // Asterisk *
      if (key === "*") {
        event.preventDefault()
        const currentVal = scores[tooth]?.trim().toUpperCase() || ""
        let newVal = "0*"
        if (["0", "1", "2", "3", "4"].includes(currentVal)) {
          newVal = `${currentVal}*`
        } else if (currentVal.endsWith("*")) {
          newVal = currentVal
        }
        handleSetToothScore(tooth, newVal)
        const currIndex = PSR_ALL_TEETH.indexOf(tooth)
        if (currIndex >= 0 && currIndex < PSR_ALL_TEETH.length - 1) {
          focusTooth(PSR_ALL_TEETH[currIndex + 1])
        }
        return
      }

      // X for absent tooth
      if (upperKey === "X") {
        event.preventDefault()
        handleSetToothScore(tooth, "X")
        const currIndex = PSR_ALL_TEETH.indexOf(tooth)
        if (currIndex >= 0 && currIndex < PSR_ALL_TEETH.length - 1) {
          focusTooth(PSR_ALL_TEETH[currIndex + 1])
        }
        return
      }

      // Backspace or Delete
      if (key === "Backspace" || key === "Delete") {
        event.preventDefault()
        if (scores[tooth]) {
          handleSetToothScore(tooth, "")
        } else if (key === "Backspace") {
          const currIndex = PSR_ALL_TEETH.indexOf(tooth)
          if (currIndex > 0) {
            const prevTooth = PSR_ALL_TEETH[currIndex - 1]
            handleSetToothScore(prevTooth, "")
            focusTooth(prevTooth)
          }
        }
        return
      }

      // Arrow navigation
      if (key === "ArrowRight") {
        event.preventDefault()
        const currIndex = PSR_ALL_TEETH.indexOf(tooth)
        if (currIndex >= 0 && currIndex < PSR_ALL_TEETH.length - 1) {
          focusTooth(PSR_ALL_TEETH[currIndex + 1])
        }
      } else if (key === "ArrowLeft") {
        event.preventDefault()
        const currIndex = PSR_ALL_TEETH.indexOf(tooth)
        if (currIndex > 0) {
          focusTooth(PSR_ALL_TEETH[currIndex - 1])
        }
      } else if (key === "ArrowDown") {
        event.preventDefault()
        const upperIndex = PSR_UPPER_ROW.indexOf(tooth)
        if (upperIndex >= 0 && upperIndex < PSR_LOWER_ROW.length) {
          focusTooth(PSR_LOWER_ROW[upperIndex])
        }
      } else if (key === "ArrowUp") {
        event.preventDefault()
        const lowerIndex = PSR_LOWER_ROW.indexOf(tooth)
        if (lowerIndex >= 0 && lowerIndex < PSR_UPPER_ROW.length) {
          focusTooth(PSR_UPPER_ROW[lowerIndex])
        }
      }
    },
    [scores, handleSetToothScore, focusTooth, readOnly]
  )

  const getScoreBadgeClass = (score?: string | null) => {
    if (!score) return "border-border bg-background text-muted-foreground hover:bg-muted/50"
    const upper = score.trim().toUpperCase()
    if (upper === "X") return "border-slate-300 bg-slate-100 text-slate-700 font-bold dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
    if (upper.startsWith("0")) return "border-emerald-300 bg-emerald-50 text-emerald-800 font-bold dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700"
    if (upper.startsWith("1")) return "border-sky-300 bg-sky-50 text-sky-800 font-bold dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-700"
    if (upper.startsWith("2")) return "border-amber-300 bg-amber-50 text-amber-800 font-bold dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700"
    if (upper.startsWith("3")) return "border-orange-400 bg-orange-50 text-orange-900 font-bold dark:bg-orange-950/50 dark:text-orange-300 dark:border-orange-600"
    if (upper.startsWith("4")) return "border-rose-400 bg-rose-50 text-rose-900 font-bold dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-600"
    return "border-primary bg-primary/10 text-primary font-bold"
  }

  return (
    <div className="space-y-4">
      {/* Header con resumen y toggle de guía */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>Máximo global:</span>
            {maxScore ? (
              <Badge className={getScoreBadgeClass(maxScore)}>{maxScore}</Badge>
            ) : (
              <Badge variant="outline">Sin evaluar</Badge>
            )}
          </div>
          {code3Count > 0 && (
            <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-800 text-[11px] dark:bg-orange-950/40 dark:text-orange-300">
              {code3Count} {code3Count === 1 ? "diente código 3" : "dientes código 3"}
            </Badge>
          )}
          {code4Count > 0 && (
            <Badge variant="outline" className="border-rose-300 bg-rose-50 text-rose-800 text-[11px] dark:bg-rose-950/40 dark:text-rose-300">
              {code4Count} {code4Count === 1 ? "diente código 4" : "dientes código 4"}
            </Badge>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          onClick={() => setShowGuide(!showGuide)}
        >
          <HelpCircle className="mr-1.5 h-3.5 w-3.5 text-primary" />
          {showGuide ? "Ocultar guía PSR" : "Ver guía de códigos OMS"}
          {showGuide ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Guía clínica desplegable */}
      {showGuide && (
        <div className="rounded-lg border bg-muted/20 p-3.5 space-y-2 text-xs transition-all">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <Info className="h-4 w-4 text-primary shrink-0" />
            <span>Códigos OMS para Registro de Evaluación Periodontal (PSR)</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PSR_REFERENCE_GUIDE.map((item) => (
              <div key={item.code} className={`rounded-md border p-2.5 space-y-1 ${item.color}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Código {item.code}</span>
                </div>
                <p className="leading-tight opacity-90">{item.characteristics}</p>
                <p className="font-semibold mt-1 text-[11px] border-t border-black/10 dark:border-white/10 pt-1">
                  Acción: {item.action}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alerta de Sugerencia para Periodontograma (Preparación a Futuro) */}
      {requiresPeriodontogram && (
        <div className="rounded-lg border border-orange-400/50 bg-orange-500/10 p-3 text-xs text-orange-900 dark:text-orange-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" />
            <div>
              <p className="font-semibold">Criterio para Periodontograma Completo detectado</p>
              <p className="text-orange-800 dark:text-orange-300 mt-0.5">
                El paciente presenta {code3Count} {code3Count === 1 ? "pieza" : "piezas"} con código 3 y {code4Count} con código 4.
                Se sugiere complementar con un periodontograma completo y tratamiento periodontal especializado.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cuadrícula Visual de 6 Sextantes */}
      <div className="overflow-x-auto rounded-lg border bg-card p-3 shadow-2xs">
        <div className="min-w-[760px] space-y-3">
          {/* Fila Superior: Sextantes 1, 2, 3 */}
          <div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center justify-between px-1">
              <span>Maxilar Superior</span>
              <span className="text-[10px] font-normal text-muted-foreground">
                Usa el teclado (0-4, *, X) o haz clic para abrir el menú desplegable
              </span>
            </div>
            <div className="grid grid-cols-[5fr_6fr_5fr] gap-2">
              {/* Sextante 1 */}
              <SextantBlock
                sextant={SEXTANT_DEFINITIONS[0]}
                scores={scores}
                summary={sextantSummaries["S1"]}
                readOnly={readOnly}
                cellRefs={cellRefs}
                openPopoverTooth={openPopoverTooth}
                setOpenPopoverTooth={setOpenPopoverTooth}
                onSetToothScore={handleSetToothScore}
                onKeyDown={handleKeyDown}
                getScoreBadgeClass={getScoreBadgeClass}
              />
              {/* Sextante 2 */}
              <SextantBlock
                sextant={SEXTANT_DEFINITIONS[1]}
                scores={scores}
                summary={sextantSummaries["S2"]}
                readOnly={readOnly}
                cellRefs={cellRefs}
                openPopoverTooth={openPopoverTooth}
                setOpenPopoverTooth={setOpenPopoverTooth}
                onSetToothScore={handleSetToothScore}
                onKeyDown={handleKeyDown}
                getScoreBadgeClass={getScoreBadgeClass}
              />
              {/* Sextante 3 */}
              <SextantBlock
                sextant={SEXTANT_DEFINITIONS[2]}
                scores={scores}
                summary={sextantSummaries["S3"]}
                readOnly={readOnly}
                cellRefs={cellRefs}
                openPopoverTooth={openPopoverTooth}
                setOpenPopoverTooth={setOpenPopoverTooth}
                onSetToothScore={handleSetToothScore}
                onKeyDown={handleKeyDown}
                getScoreBadgeClass={getScoreBadgeClass}
              />
            </div>
          </div>

          <div className="border-t border-dashed my-2" />

          {/* Fila Inferior: Sextantes 4, 5, 6 */}
          <div>
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 px-1">
              Mandíbula Inferior
            </div>
            <div className="grid grid-cols-[5fr_6fr_5fr] gap-2">
              {/* Sextante 4 */}
              <SextantBlock
                sextant={SEXTANT_DEFINITIONS[3]}
                scores={scores}
                summary={sextantSummaries["S4"]}
                readOnly={readOnly}
                cellRefs={cellRefs}
                openPopoverTooth={openPopoverTooth}
                setOpenPopoverTooth={setOpenPopoverTooth}
                onSetToothScore={handleSetToothScore}
                onKeyDown={handleKeyDown}
                getScoreBadgeClass={getScoreBadgeClass}
              />
              {/* Sextante 5 */}
              <SextantBlock
                sextant={SEXTANT_DEFINITIONS[4]}
                scores={scores}
                summary={sextantSummaries["S5"]}
                readOnly={readOnly}
                cellRefs={cellRefs}
                openPopoverTooth={openPopoverTooth}
                setOpenPopoverTooth={setOpenPopoverTooth}
                onSetToothScore={handleSetToothScore}
                onKeyDown={handleKeyDown}
                getScoreBadgeClass={getScoreBadgeClass}
              />
              {/* Sextante 6 */}
              <SextantBlock
                sextant={SEXTANT_DEFINITIONS[5]}
                scores={scores}
                summary={sextantSummaries["S6"]}
                readOnly={readOnly}
                cellRefs={cellRefs}
                openPopoverTooth={openPopoverTooth}
                setOpenPopoverTooth={setOpenPopoverTooth}
                onSetToothScore={handleSetToothScore}
                onKeyDown={handleKeyDown}
                getScoreBadgeClass={getScoreBadgeClass}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SextantBlockProps {
  sextant: (typeof SEXTANT_DEFINITIONS)[0]
  scores: DentalPsrScores
  summary?: string | null
  readOnly: boolean
  cellRefs: React.MutableRefObject<Record<string, HTMLButtonElement | null>>
  openPopoverTooth: string | null
  setOpenPopoverTooth: (tooth: string | null) => void
  onSetToothScore: (tooth: string, val: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLButtonElement>, tooth: string) => void
  getScoreBadgeClass: (score?: string | null) => string
}

function SextantBlock({
  sextant,
  scores,
  summary,
  readOnly,
  cellRefs,
  openPopoverTooth,
  setOpenPopoverTooth,
  onSetToothScore,
  onKeyDown,
  getScoreBadgeClass,
}: SextantBlockProps) {
  return (
    <div className="rounded-md border bg-muted/10 p-2 space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-foreground">{sextant.name}</span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">Código:</span>
          {summary ? (
            <Badge className={`${getScoreBadgeClass(summary)} text-[11px] h-5 px-1.5`}>{summary}</Badge>
          ) : (
            <span className="text-[11px] text-muted-foreground font-mono">—</span>
          )}
        </div>
      </div>

      {/* Grid de casilleros de dientes */}
      <div className={`grid gap-1.5 ${sextant.teeth.length === 6 ? "grid-cols-6" : "grid-cols-5"}`}>
        {sextant.teeth.map((tooth) => {
          const val = scores[tooth] || ""
          const isOpen = openPopoverTooth === tooth

          return (
            <div key={tooth} className="flex flex-col items-center gap-0.5">
              <span className="text-[10px] font-mono text-muted-foreground font-semibold">{tooth}</span>

              {readOnly ? (
                <div
                  className={`flex h-9 w-full items-center justify-center rounded-md border text-xs font-mono font-bold select-none ${getScoreBadgeClass(
                    val
                  )}`}
                >
                  {val || "—"}
                </div>
              ) : (
                <DropdownMenu open={isOpen} onOpenChange={(open) => setOpenPopoverTooth(open ? tooth : null)}>
                  <DropdownMenuTrigger
                    ref={(el) => {
                      cellRefs.current[tooth] = el
                    }}
                    onKeyDown={(e) => onKeyDown(e, tooth)}
                    className={`flex h-9 w-full items-center justify-center rounded-md border text-xs font-mono font-bold transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none cursor-pointer select-none ${getScoreBadgeClass(
                      val
                    )}`}
                  >
                    {val || <span className="opacity-20">·</span>}
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    side="bottom"
                    align="center"
                    className="w-52 p-1.5 shadow-lg border"
                  >
                    <div className="text-[11px] font-semibold text-muted-foreground px-2 py-1 border-b mb-1">
                      Pieza #{tooth}
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {PSR_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => onSetToothScore(tooth, opt.value)}
                          className={`flex items-center justify-between rounded px-2 py-1.5 text-xs text-left transition-colors cursor-pointer hover:bg-muted ${
                            val === opt.value ? "bg-primary text-primary-foreground font-bold hover:bg-primary/90" : ""
                          }`}
                        >
                          <span className="font-mono font-bold">{opt.label}</span>
                          <span className="text-[10px] opacity-70 truncate max-w-[80px]">{opt.desc}</span>
                        </button>
                      ))}
                    </div>
                    {val && (
                      <>
                        <DropdownMenuSeparator />
                        <button
                          type="button"
                          onClick={() => onSetToothScore(tooth, "")}
                          className="w-full mt-1 pt-1 text-[11px] text-destructive flex items-center justify-center gap-1 hover:underline cursor-pointer"
                        >
                          <XIcon className="h-3 w-3" />
                          Limpiar casillero
                        </button>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
