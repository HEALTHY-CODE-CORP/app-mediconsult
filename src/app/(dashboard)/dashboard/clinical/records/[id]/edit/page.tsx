"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { useMedicalRecord, useUpdateMedicalRecord } from "@/hooks/use-clinical"
import { ArrowLeft } from "lucide-react"

interface EditMedicalRecordPageProps {
  params: Promise<{ id: string }>
}

export default function EditMedicalRecordPage({
  params,
}: EditMedicalRecordPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: record, isLoading } = useMedicalRecord(id)
  const mutation = useUpdateMedicalRecord(id)

  const [formData, setFormData] = useState({
    personalHistory: "",
    familyHistory: "",
    surgicalHistory: "",
    currentMedications: "",
  })

  useEffect(() => {
    if (record) {
      setFormData({
        personalHistory: record.personalHistory ?? "",
        familyHistory: record.familyHistory ?? "",
        surgicalHistory: record.surgicalHistory ?? "",
        currentMedications: record.currentMedications ?? "",
      })
    }
  }, [record])

  function updateField(key: keyof typeof formData, value: string) {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await mutation.mutateAsync({
        personalHistory: formData.personalHistory || undefined,
        familyHistory: formData.familyHistory || undefined,
        surgicalHistory: formData.surgicalHistory || undefined,
        currentMedications: formData.currentMedications || undefined,
      })
      toast.success("Antecedentes actualizados")
      router.push(`/dashboard/clinical/records/${id}`)
    } catch {
      toast.error("Error al actualizar los antecedentes")
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Historia clínica no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/clinical/records" />}
        >
          Volver a historias clínicas
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/dashboard/clinical/records/${id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Editar antecedentes
          </h1>
          <p className="text-muted-foreground">
            {record.patientName} — Historia {record.recordNumber}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Antecedentes médicos</CardTitle>
            <CardDescription>
              Actualiza el historial médico del paciente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="personalHistory">Antecedentes personales</Label>
              <Textarea
                id="personalHistory"
                value={formData.personalHistory}
                onChange={(e) =>
                  updateField("personalHistory", e.target.value)
                }
                placeholder="Enfermedades previas, condiciones crónicas, hábitos..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="familyHistory">Antecedentes familiares</Label>
              <Textarea
                id="familyHistory"
                value={formData.familyHistory}
                onChange={(e) =>
                  updateField("familyHistory", e.target.value)
                }
                placeholder="Enfermedades hereditarias, condiciones familiares..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="surgicalHistory">Antecedentes quirúrgicos</Label>
              <Textarea
                id="surgicalHistory"
                value={formData.surgicalHistory}
                onChange={(e) =>
                  updateField("surgicalHistory", e.target.value)
                }
                placeholder="Cirugías previas, procedimientos..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentMedications">Medicamentos actuales</Label>
              <Textarea
                id="currentMedications"
                value={formData.currentMedications}
                onChange={(e) =>
                  updateField("currentMedications", e.target.value)
                }
                placeholder="Medicamentos que el paciente toma actualmente..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={mutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </form>
    </div>
  )
}
