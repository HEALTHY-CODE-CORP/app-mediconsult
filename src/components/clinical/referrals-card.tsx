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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useConsultationReferrals,
  useCreateReferral,
} from "@/hooks/use-clinical"
import { ExternalLink, Plus, Building2, Stethoscope } from "lucide-react"
import { toast } from "sonner"

interface ReferralsCardProps {
  consultationId: string
  canAdd?: boolean
}

export function ReferralsCard({
  consultationId,
  canAdd = true,
}: ReferralsCardProps) {
  const { data: referrals = [], isLoading } =
    useConsultationReferrals(consultationId)
  const createMutation = useCreateReferral(consultationId)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    destinationFacility: "",
    destinationService: "",
    reason: "",
    clinicalSummary: "",
  })

  function updateField(key: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleAdd() {
    if (
      !formData.destinationFacility.trim() ||
      !formData.destinationService.trim() ||
      !formData.reason.trim()
    ) {
      toast.error("Completa los campos requeridos")
      return
    }

    try {
      await createMutation.mutateAsync({
        destinationFacility: formData.destinationFacility,
        destinationService: formData.destinationService,
        reason: formData.reason,
        clinicalSummary: formData.clinicalSummary || undefined,
      })
      setFormData({
        destinationFacility: "",
        destinationService: "",
        reason: "",
        clinicalSummary: "",
      })
      setShowForm(false)
      toast.success("Referencia creada")
    } catch {
      toast.error("Error al crear la referencia")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Referencias
            </CardTitle>
            <CardDescription>
              Referencias a otros establecimientos o servicios
            </CardDescription>
          </div>
          {canAdd && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Nueva referencia
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Establecimiento destino *</Label>
                <Input
                  value={formData.destinationFacility}
                  onChange={(e) =>
                    updateField("destinationFacility", e.target.value)
                  }
                  placeholder="Nombre del establecimiento"
                />
              </div>
              <div className="space-y-2">
                <Label>Servicio destino *</Label>
                <Input
                  value={formData.destinationService}
                  onChange={(e) =>
                    updateField("destinationService", e.target.value)
                  }
                  placeholder="Ej: Cardiología"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Motivo de referencia *</Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => updateField("reason", e.target.value)}
                placeholder="Razón por la cual se refiere al paciente"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Resumen clínico</Label>
              <Textarea
                value={formData.clinicalSummary}
                onChange={(e) => updateField("clinicalSummary", e.target.value)}
                placeholder="Resumen del estado clínico del paciente"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setFormData({
                    destinationFacility: "",
                    destinationService: "",
                    reason: "",
                    clinicalSummary: "",
                  })
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Guardando..." : "Crear referencia"}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full" />
          </div>
        ) : referrals.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay referencias registradas
          </p>
        ) : (
          <div className="space-y-3">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {ref.destinationFacility}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {ref.destinationService}
                    </div>
                  </div>
                  <Badge className={ref.statusColor}>
                    {ref.statusLabel}
                  </Badge>
                </div>
                <p className="text-sm">{ref.reason}</p>
                {ref.clinicalSummary && (
                  <p className="text-xs text-muted-foreground">
                    {ref.clinicalSummary}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {ref.doctorName} · {ref.createdAtFormatted}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
