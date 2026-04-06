"use client"

import { X } from "lucide-react"
import { toast } from "sonner"
import type { DiagnosisType, DiagnosisRole } from "@/types/clinical.model"

export interface DiagnosisItem {
  cie10Id: string
  cie10Code: string
  cie10Description: string
  diagnosisType: DiagnosisType
  diagnosisRole: DiagnosisRole
  notes?: string
}

interface Props {
  diagnoses: DiagnosisItem[]
  onChange: (diagnoses: DiagnosisItem[]) => void
}

const DIAGNOSIS_TYPE_OPTIONS: { value: DiagnosisType; label: string }[] = [
  { value: "PRESUMPTIVE", label: "Presuntivo" },
  { value: "DEFINITIVE", label: "Definitivo" },
]

function DiagnosisTypeSelect({
  value,
  onChange,
}: {
  value: DiagnosisType
  onChange: (v: DiagnosisType) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as DiagnosisType)}
      className="h-7 rounded border border-input bg-background px-2 py-0.5 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      {DIAGNOSIS_TYPE_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}

function typeVariantClasses(type: DiagnosisType) {
  return type === "DEFINITIVE"
    ? "bg-blue-100 text-blue-800"
    : "bg-yellow-100 text-yellow-800"
}

function roleVariantClasses(role: DiagnosisRole) {
  return role === "PRIMARY"
    ? "bg-green-100 text-green-800"
    : "bg-slate-100 text-slate-700"
}

export function DiagnosisList({ diagnoses, onChange }: Props) {
  function handleRemove(index: number) {
    onChange(diagnoses.filter((_, i) => i !== index))
  }

  function handleTypeChange(index: number, type: DiagnosisType) {
    onChange(diagnoses.map((d, i) => (i === index ? { ...d, diagnosisType: type } : d)))
  }

  function handleRoleToggle(index: number) {
    const target = diagnoses[index]
    if (target.diagnosisRole === "PRIMARY") {
      // Demote to secondary
      onChange(diagnoses.map((d, i) => (i === index ? { ...d, diagnosisRole: "SECONDARY" } : d)))
      return
    }
    // Promote to primary — check if another already holds PRIMARY
    const existingPrimary = diagnoses.findIndex((d, i) => i !== index && d.diagnosisRole === "PRIMARY")
    if (existingPrimary >= 0) {
      toast.warning("Ya existe un diagnóstico principal. Cambia el rol del actual primero.")
      return
    }
    onChange(diagnoses.map((d, i) => (i === index ? { ...d, diagnosisRole: "PRIMARY" } : d)))
  }

  if (diagnoses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          No hay diagnósticos agregados. Busca y selecciona un código CIE-10.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        {diagnoses.length} diagnóstico{diagnoses.length !== 1 ? "s" : ""} agregado{diagnoses.length !== 1 ? "s" : ""}
      </p>
      <ul className="space-y-2">
        {diagnoses.map((d, index) => (
          <li
            key={`${d.cie10Id}-${index}`}
            className="flex flex-wrap items-center gap-2 rounded-lg border bg-card p-3"
          >
            {/* Code badge */}
            <span className="font-mono font-bold text-blue-600 text-sm shrink-0">
              {d.cie10Code}
            </span>

            {/* Description */}
            <span className="text-sm text-foreground flex-1 min-w-0 truncate">
              {d.cie10Description}
            </span>

            {/* Type select */}
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0 ${typeVariantClasses(d.diagnosisType)}`}
            >
              <DiagnosisTypeSelect
                value={d.diagnosisType}
                onChange={(v) => handleTypeChange(index, v)}
              />
            </span>

            {/* Role toggle button */}
            <button
              type="button"
              onClick={() => handleRoleToggle(index)}
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shrink-0 transition-colors hover:opacity-80 ${roleVariantClasses(d.diagnosisRole)}`}
              title="Haz clic para cambiar entre Principal / Secundario"
            >
              {d.diagnosisRole === "PRIMARY" ? "Principal" : "Secundario"}
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="rounded p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0"
              title="Eliminar diagnóstico"
            >
              <X className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
