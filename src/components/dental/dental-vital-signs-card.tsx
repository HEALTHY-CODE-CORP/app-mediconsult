"use client"

import { useState } from "react"
import { Activity, Heart, Plus, Ruler, Thermometer, User, Weight, Wind, X } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  useCreateDentalDateVitalSigns,
  useCreateDentalRecordVitalSigns,
  useDentalRecordVitalSigns,
} from "@/hooks/use-dental"
import type { DentalVitalSigns } from "@/adapters/dental.adapter"

interface DentalVitalSignsCardProps {
  dentalRecordId: string
  dentalDateId?: string
  initialVitalSigns?: DentalVitalSigns[]
  readOnly?: boolean
}

export function DentalVitalSignsCard({
  dentalRecordId,
  dentalDateId,
  initialVitalSigns = [],
  readOnly = false,
}: DentalVitalSignsCardProps) {
  const { data: vitalSigns = initialVitalSigns, isLoading } = useDentalRecordVitalSigns(dentalRecordId)
  const createRecordVitalSigns = useCreateDentalRecordVitalSigns(dentalRecordId)
  const createDateVitalSigns = useCreateDentalDateVitalSigns(dentalDateId ?? "", dentalRecordId)

  const [showForm, setShowForm] = useState(false)
  const [systolicPressure, setSystolicPressure] = useState("")
  const [diastolicPressure, setDiastolicPressure] = useState("")
  const [heartRate, setHeartRate] = useState("")
  const [respiratoryRate, setRespiratoryRate] = useState("")
  const [temperature, setTemperature] = useState("")
  const [oxygenSaturation, setOxygenSaturation] = useState("")
  const [weight, setWeight] = useState("")
  const [height, setHeight] = useState("")
  const [notes, setNotes] = useState("")

  function parseNumber(val: string): number | undefined {
    const trimmed = val.trim()
    if (!trimmed) return undefined
    const num = Number(trimmed)
    return isNaN(num) ? undefined : num
  }

  function resetForm() {
    setSystolicPressure("")
    setDiastolicPressure("")
    setHeartRate("")
    setRespiratoryRate("")
    setTemperature("")
    setOxygenSaturation("")
    setWeight("")
    setHeight("")
    setNotes("")
    setShowForm(false)
  }

  async function handleAdd() {
    try {
      const payload = {
        dentalDateId: dentalDateId || undefined,
        systolicPressure: parseNumber(systolicPressure),
        diastolicPressure: parseNumber(diastolicPressure),
        heartRate: parseNumber(heartRate),
        respiratoryRate: parseNumber(respiratoryRate),
        temperature: parseNumber(temperature),
        oxygenSaturation: parseNumber(oxygenSaturation),
        weight: parseNumber(weight),
        height: parseNumber(height),
        notes: notes.trim() || undefined,
      }

      if (dentalDateId) {
        await createDateVitalSigns.mutateAsync(payload)
      } else {
        await createRecordVitalSigns.mutateAsync(payload)
      }

      toast.success("Signos vitales registrados")
      resetForm()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al registrar los signos vitales")
    }
  }

  const isSubmitting = createRecordVitalSigns.isPending || createDateVitalSigns.isPending

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Activity className="h-5 w-5 text-primary" />
              Signos vitales
            </CardTitle>
            <CardDescription>
              Historial de signos vitales basales y de control del paciente.
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
                    Registrar signos
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {showForm && (
          <div className="rounded-lg border bg-muted/20 p-4 space-y-4">
            <h4 className="text-sm font-semibold">Nuevo registro de signos vitales</h4>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1">
                <Label className="text-xs">Presión sistólica (mmHg)</Label>
                <Input
                  type="number"
                  value={systolicPressure}
                  onChange={(e) => setSystolicPressure(e.target.value)}
                  placeholder="120"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Presión diastólica (mmHg)</Label>
                <Input
                  type="number"
                  value={diastolicPressure}
                  onChange={(e) => setDiastolicPressure(e.target.value)}
                  placeholder="80"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Frecuencia cardíaca (lpm)</Label>
                <Input
                  type="number"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  placeholder="72"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Frecuencia respiratoria (rpm)</Label>
                <Input
                  type="number"
                  value={respiratoryRate}
                  onChange={(e) => setRespiratoryRate(e.target.value)}
                  placeholder="16"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Temperatura (°C)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="36.5"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Saturación SpO₂ (%)</Label>
                <Input
                  type="number"
                  value={oxygenSaturation}
                  onChange={(e) => setOxygenSaturation(e.target.value)}
                  placeholder="98"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Peso (kg)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Talla (cm)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Notas u observaciones</Label>
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones de la toma..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
              <Button type="button" size="sm" disabled={isSubmitting} onClick={handleAdd}>
                {isSubmitting ? "Guardando..." : "Guardar signos vitales"}
              </Button>
            </div>
          </div>
        )}

        {vitalSigns.length > 0 ? (
          <div className="space-y-4">
            {vitalSigns.map((item, index) => (
              <div
                key={item.id}
                className="rounded-lg border bg-card p-4 space-y-3 transition-colors hover:border-primary/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs font-normal">
                      {index === 0 ? "Más reciente" : `Registro #${vitalSigns.length - index}`}
                    </Badge>
                    {item.dentalDateId ? (
                      <Badge variant="outline" className="text-xs">
                        En cita odontológica
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Apertura
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{item.recordedAtFormatted}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {item.recordedByName}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8 text-xs">
                  <div className="rounded border bg-muted/20 p-2 text-center">
                    <p className="text-muted-foreground font-medium">Presión</p>
                    <p className="font-semibold text-foreground mt-0.5">{item.bloodPressure ?? "—"}</p>
                  </div>
                  <div className="rounded border bg-muted/20 p-2 text-center">
                    <p className="text-muted-foreground font-medium">F.C.</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {item.heartRate ? `${item.heartRate} lpm` : "—"}
                    </p>
                  </div>
                  <div className="rounded border bg-muted/20 p-2 text-center">
                    <p className="text-muted-foreground font-medium">F.R.</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {item.respiratoryRate ? `${item.respiratoryRate} rpm` : "—"}
                    </p>
                  </div>
                  <div className="rounded border bg-muted/20 p-2 text-center">
                    <p className="text-muted-foreground font-medium">Temp.</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {item.temperature ? `${item.temperature} °C` : "—"}
                    </p>
                  </div>
                  <div className="rounded border bg-muted/20 p-2 text-center">
                    <p className="text-muted-foreground font-medium">SpO₂</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {item.oxygenSaturation ? `${item.oxygenSaturation} %` : "—"}
                    </p>
                  </div>
                  <div className="rounded border bg-muted/20 p-2 text-center">
                    <p className="text-muted-foreground font-medium">Peso</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {item.weight ? `${item.weight} kg` : "—"}
                    </p>
                  </div>
                  <div className="rounded border bg-muted/20 p-2 text-center">
                    <p className="text-muted-foreground font-medium">Talla</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {item.height ? `${item.height} cm` : "—"}
                    </p>
                  </div>
                  <div className="rounded border bg-muted/20 p-2 text-center">
                    <p className="text-muted-foreground font-medium">IMC</p>
                    <p className="font-semibold text-foreground mt-0.5">
                      {item.bmi ? `${item.bmi} kg/m²` : "—"}
                    </p>
                  </div>
                </div>

                {item.notes && (
                  <p className="text-xs text-muted-foreground italic border-t pt-2">
                    Nota: {item.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          !showForm && (
            <p className="text-sm text-muted-foreground">
              No hay registros de signos vitales aún.
            </p>
          )
        )}
      </CardContent>
    </Card>
  )
}
