"use client"

import { useState, useEffect } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useUpdateMedicalRecord, useMedicalRecord } from "@/hooks/use-clinical"
import type { MedicalRecord } from "@/adapters/clinical.adapter"
import {
  FileText,
  ChevronDown,
  ChevronUp,
  Pencil,
  Save,
  X,
  AlertCircle,
} from "lucide-react"
import { toast } from "sonner"

interface MedicalHistoryCardProps {
  medicalRecordId: string
  /** If true, starts expanded in edit mode (for new records) */
  isNew?: boolean
  /** Pre-loaded record data (avoids extra fetch) */
  record?: MedicalRecord | null
}

export function MedicalHistoryCard({
  medicalRecordId,
  isNew = false,
  record: externalRecord,
}: MedicalHistoryCardProps) {
  const { data: fetchedRecord } = useMedicalRecord(
    externalRecord ? "" : medicalRecordId
  )
  const record = externalRecord ?? fetchedRecord
  const updateMutation = useUpdateMedicalRecord(medicalRecordId)

  const hasAntecedents = !!(
    record?.personalHistory ||
    record?.familyHistory ||
    record?.surgicalHistory ||
    record?.currentMedications
  )

  const [expanded, setExpanded] = useState(isNew || !hasAntecedents)
  const [editing, setEditing] = useState(isNew || !hasAntecedents)
  const [formData, setFormData] = useState({
    personalHistory: "",
    familyHistory: "",
    surgicalHistory: "",
    currentMedications: "",
  })

  // Sync form data with record
  useEffect(() => {
    if (record) {
      setFormData({
        personalHistory: record.personalHistory ?? "",
        familyHistory: record.familyHistory ?? "",
        surgicalHistory: record.surgicalHistory ?? "",
        currentMedications: record.currentMedications ?? "",
      })
      // If record has antecedents and it's not new, collapse and show read view
      if (!isNew && hasAntecedents) {
        setEditing(false)
      }
    }
  }, [record?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleEdit() {
    setEditing(true)
    setExpanded(true)
  }

  function handleCancel() {
    if (record) {
      setFormData({
        personalHistory: record.personalHistory ?? "",
        familyHistory: record.familyHistory ?? "",
        surgicalHistory: record.surgicalHistory ?? "",
        currentMedications: record.currentMedications ?? "",
      })
    }
    setEditing(false)
    if (hasAntecedents) {
      setExpanded(true)
    }
  }

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        personalHistory: formData.personalHistory || undefined,
        familyHistory: formData.familyHistory || undefined,
        surgicalHistory: formData.surgicalHistory || undefined,
        currentMedications: formData.currentMedications || undefined,
      })
      setEditing(false)
      toast.success("Antecedentes actualizados")
    } catch {
      toast.error("Error al guardar los antecedentes")
    }
  }

  function handleSkip() {
    setEditing(false)
    setExpanded(false)
  }

  if (!record) return null

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => !editing && setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Antecedentes
            </CardTitle>
            {!hasAntecedents && !editing && (
              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300 bg-amber-50">
                <AlertCircle className="h-3 w-3" />
                Sin completar
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {expanded && !editing && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit()
                }}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            {!editing && (
              expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )
            )}
          </div>
        </div>
        {!expanded && hasAntecedents && (
          <CardDescription className="mt-1">
            {[
              record.personalHistory && "Personales",
              record.familyHistory && "Familiares",
              record.surgicalHistory && "Quirúrgicos",
              record.currentMedications && "Medicamentos",
            ]
              .filter(Boolean)
              .join(" · ")}
          </CardDescription>
        )}
        {!expanded && !hasAntecedents && (
          <CardDescription className="mt-1">
            Toca para completar los antecedentes del paciente
          </CardDescription>
        )}
      </CardHeader>

      {expanded && (
        <CardContent>
          {editing ? (
            <div className="space-y-4">
              {(isNew || !hasAntecedents) && (
                <p className="text-sm text-muted-foreground">
                  Complete los antecedentes médicos del paciente. Puede omitir este paso y completarlos después.
                </p>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="personalHistory">Antecedentes personales</Label>
                  <Textarea
                    id="personalHistory"
                    value={formData.personalHistory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        personalHistory: e.target.value,
                      }))
                    }
                    placeholder="Enfermedades previas, alergias, hábitos..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="familyHistory">Antecedentes familiares</Label>
                  <Textarea
                    id="familyHistory"
                    value={formData.familyHistory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        familyHistory: e.target.value,
                      }))
                    }
                    placeholder="Enfermedades hereditarias, antecedentes familiares..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surgicalHistory">
                    Antecedentes quirúrgicos
                  </Label>
                  <Textarea
                    id="surgicalHistory"
                    value={formData.surgicalHistory}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        surgicalHistory: e.target.value,
                      }))
                    }
                    placeholder="Cirugías previas, procedimientos..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMedications">
                    Medicamentos actuales
                  </Label>
                  <Textarea
                    id="currentMedications"
                    value={formData.currentMedications}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        currentMedications: e.target.value,
                      }))
                    }
                    placeholder="Medicación actual, dosis..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                {(isNew || !hasAntecedents) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                  >
                    Completar después
                  </Button>
                )}
                {!isNew && hasAntecedents && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancelar
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                >
                  <Save className="mr-1 h-4 w-4" />
                  {updateMutation.isPending
                    ? "Guardando..."
                    : "Guardar antecedentes"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              <HistoryField
                label="Antecedentes personales"
                value={record.personalHistory}
              />
              <HistoryField
                label="Antecedentes familiares"
                value={record.familyHistory}
              />
              <HistoryField
                label="Antecedentes quirúrgicos"
                value={record.surgicalHistory}
              />
              <HistoryField
                label="Medicamentos actuales"
                value={record.currentMedications}
              />
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}

function HistoryField({
  label,
  value,
}: {
  label: string
  value: string | null
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm whitespace-pre-wrap">
        {value || (
          <span className="text-muted-foreground italic">No registrado</span>
        )}
      </p>
    </div>
  )
}
