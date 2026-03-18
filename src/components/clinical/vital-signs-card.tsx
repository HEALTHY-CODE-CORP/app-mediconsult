"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useVitalSigns, useCreateVitalSigns } from "@/hooks/use-clinical"
import {
  Activity,
  Plus,
  Heart,
  Wind,
  Thermometer,
  Droplets,
  Weight,
  Ruler,
  User,
} from "lucide-react"
import { toast } from "sonner"

interface VitalSignsCardProps {
  medicalRecordId: string
  canAdd?: boolean
}

export function VitalSignsCard({
  medicalRecordId,
  canAdd = true,
}: VitalSignsCardProps) {
  const { data: vitalSigns = [], isLoading } = useVitalSigns(medicalRecordId)
  const createMutation = useCreateVitalSigns()
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    systolicPressure: "",
    diastolicPressure: "",
    heartRate: "",
    respiratoryRate: "",
    temperature: "",
    oxygenSaturation: "",
    weight: "",
    height: "",
    notes: "",
  })

  function updateField(key: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  function toNumber(val: string): number | undefined {
    const n = Number(val)
    return val && !isNaN(n) ? n : undefined
  }

  async function handleAdd() {
    try {
      await createMutation.mutateAsync({
        medicalRecordId,
        systolicPressure: toNumber(formData.systolicPressure),
        diastolicPressure: toNumber(formData.diastolicPressure),
        heartRate: toNumber(formData.heartRate),
        respiratoryRate: toNumber(formData.respiratoryRate),
        temperature: toNumber(formData.temperature),
        oxygenSaturation: toNumber(formData.oxygenSaturation),
        weight: toNumber(formData.weight),
        height: toNumber(formData.height),
        notes: formData.notes || undefined,
      })
      setFormData({
        systolicPressure: "",
        diastolicPressure: "",
        heartRate: "",
        respiratoryRate: "",
        temperature: "",
        oxygenSaturation: "",
        weight: "",
        height: "",
        notes: "",
      })
      setShowForm(false)
      toast.success("Signos vitales registrados")
    } catch {
      toast.error("Error al registrar los signos vitales")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Signos vitales
            </CardTitle>
            <CardDescription>
              Registro histórico de signos vitales
            </CardDescription>
          </div>
          {canAdd && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Registrar
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Presión sistólica (mmHg)</Label>
                <Input
                  type="number"
                  value={formData.systolicPressure}
                  onChange={(e) =>
                    updateField("systolicPressure", e.target.value)
                  }
                  placeholder="120"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Presión diastólica (mmHg)</Label>
                <Input
                  type="number"
                  value={formData.diastolicPressure}
                  onChange={(e) =>
                    updateField("diastolicPressure", e.target.value)
                  }
                  placeholder="80"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Frecuencia cardíaca (bpm)</Label>
                <Input
                  type="number"
                  value={formData.heartRate}
                  onChange={(e) => updateField("heartRate", e.target.value)}
                  placeholder="72"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Frecuencia respiratoria</Label>
                <Input
                  type="number"
                  value={formData.respiratoryRate}
                  onChange={(e) =>
                    updateField("respiratoryRate", e.target.value)
                  }
                  placeholder="16"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Temperatura (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.temperature}
                  onChange={(e) => updateField("temperature", e.target.value)}
                  placeholder="36.5"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">SpO₂ (%)</Label>
                <Input
                  type="number"
                  value={formData.oxygenSaturation}
                  onChange={(e) =>
                    updateField("oxygenSaturation", e.target.value)
                  }
                  placeholder="98"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => updateField("weight", e.target.value)}
                  placeholder="70"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Talla (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.height}
                  onChange={(e) => updateField("height", e.target.value)}
                  placeholder="170"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notas</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                placeholder="Observaciones sobre los signos vitales"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Guardando..." : "Registrar"}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
          </div>
        ) : vitalSigns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay registros de signos vitales
          </p>
        ) : (
          <div className="space-y-3">
            {vitalSigns.map((vs) => (
              <div
                key={vs.id}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{vs.recordedByName}</span>
                  <span>·</span>
                  <span>{vs.recordedAtFormatted}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {vs.bloodPressure && (
                    <VitalItem
                      icon={<Heart className="h-3.5 w-3.5 text-red-500" />}
                      label="Presión"
                      value={vs.bloodPressure}
                    />
                  )}
                  {vs.heartRate != null && (
                    <VitalItem
                      icon={<Heart className="h-3.5 w-3.5 text-red-500" />}
                      label="FC"
                      value={`${vs.heartRate} bpm`}
                    />
                  )}
                  {vs.respiratoryRate != null && (
                    <VitalItem
                      icon={<Wind className="h-3.5 w-3.5 text-blue-500" />}
                      label="FR"
                      value={`${vs.respiratoryRate} rpm`}
                    />
                  )}
                  {vs.temperature != null && (
                    <VitalItem
                      icon={
                        <Thermometer className="h-3.5 w-3.5 text-orange-500" />
                      }
                      label="Temp"
                      value={`${vs.temperature}°C`}
                    />
                  )}
                  {vs.oxygenSaturation != null && (
                    <VitalItem
                      icon={
                        <Droplets className="h-3.5 w-3.5 text-blue-500" />
                      }
                      label="SpO₂"
                      value={`${vs.oxygenSaturation}%`}
                    />
                  )}
                  {vs.weight != null && (
                    <VitalItem
                      icon={<Weight className="h-3.5 w-3.5 text-purple-500" />}
                      label="Peso"
                      value={`${vs.weight} kg`}
                    />
                  )}
                  {vs.height != null && (
                    <VitalItem
                      icon={<Ruler className="h-3.5 w-3.5 text-green-500" />}
                      label="Talla"
                      value={`${vs.height} cm`}
                    />
                  )}
                  {vs.bmi != null && (
                    <VitalItem
                      icon={<Activity className="h-3.5 w-3.5" />}
                      label="IMC"
                      value={
                        <span className={vs.bmiCategoryColor ?? ""}>
                          {vs.bmi.toFixed(1)} ({vs.bmiCategoryLabel})
                        </span>
                      }
                    />
                  )}
                </div>
                {vs.notes && (
                  <p className="text-xs text-muted-foreground">{vs.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function VitalItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon}
      <div>
        <p className="text-[10px] text-muted-foreground leading-none">{label}</p>
        <p className="text-xs font-medium">{value}</p>
      </div>
    </div>
  )
}
