"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { useCreateAllergy } from "@/hooks/use-patients"
import {
  ALLERGY_TYPE_LABELS,
  ALLERGY_SEVERITY_LABELS,
} from "@/adapters/patient.adapter"
import type { CreateAllergyRequest, AllergyType, AllergySeverity } from "@/types/patient.model"

interface AllergyDialogProps {
  patientId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

const INITIAL_STATE: CreateAllergyRequest = {
  allergyType: "MEDICATION",
  allergen: "",
  severity: "MODERATE",
  reaction: undefined,
  diagnosedDate: undefined,
  notes: undefined,
}

export function AllergyDialog({
  patientId,
  open,
  onOpenChange,
}: AllergyDialogProps) {
  const createMutation = useCreateAllergy(patientId)
  const [formData, setFormData] = useState<CreateAllergyRequest>(INITIAL_STATE)

  function updateField<K extends keyof CreateAllergyRequest>(
    key: K,
    value: CreateAllergyRequest[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value || undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createMutation.mutateAsync(formData)
      toast.success("Alergia registrada exitosamente")
      setFormData(INITIAL_STATE)
      onOpenChange(false)
    } catch {
      toast.error("Error al registrar la alergia")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar alergia</DialogTitle>
          <DialogDescription>
            Agrega una nueva alergia al historial del paciente
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="allergy-type-select">Tipo de alergia *</Label>
              <Select
                value={formData.allergyType}
                onValueChange={(v) =>
                  updateField("allergyType", v as AllergyType)
                }
                items={ALLERGY_TYPE_LABELS as Record<string, string>}
              >
                <SelectTrigger id="allergy-type-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALLERGY_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergy-severity-select">Severidad *</Label>
              <Select
                value={formData.severity}
                onValueChange={(v) =>
                  updateField("severity", v as AllergySeverity)
                }
                items={ALLERGY_SEVERITY_LABELS as Record<string, string>}
              >
                <SelectTrigger id="allergy-severity-select" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALLERGY_SEVERITY_LABELS).map(
                    ([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Alérgeno *</Label>
            <Input
              value={formData.allergen}
              onChange={(e) => updateField("allergen", e.target.value)}
              placeholder="Ej: Penicilina, Maní..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Reacción</Label>
            <Input
              value={formData.reaction ?? ""}
              onChange={(e) => updateField("reaction", e.target.value)}
              placeholder="Descripción de la reacción"
            />
          </div>

          <div className="space-y-2">
            <Label>Fecha de diagnóstico</Label>
            <Input
              type="date"
              value={formData.diagnosedDate ?? ""}
              onChange={(e) => updateField("diagnosedDate", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea
              value={formData.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
