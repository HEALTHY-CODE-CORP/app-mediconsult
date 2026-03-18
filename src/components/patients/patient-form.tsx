"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toast } from "sonner"
import { useCreatePatient, useUpdatePatient } from "@/hooks/use-patients"
import {
  ID_TYPE_LABELS,
  GENDER_LABELS,
  BLOOD_TYPE_LABELS,
} from "@/adapters/patient.adapter"
import type { Patient } from "@/adapters/patient.adapter"
import type {
  CreatePatientRequest,
  IdType,
  Gender,
  BloodType,
} from "@/types/patient.model"

interface PatientFormProps {
  patient?: Patient
  mode: "create" | "edit"
}

export function PatientForm({ patient, mode }: PatientFormProps) {
  const router = useRouter()
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient(patient?.id ?? "")

  const [formData, setFormData] = useState<CreatePatientRequest>({
    idType: patient?.idType ?? "CEDULA",
    idNumber: patient?.idNumber ?? "",
    firstName: patient?.firstName ?? "",
    lastName: patient?.lastName ?? "",
    birthDate: patient?.birthDate ?? undefined,
    gender: patient?.gender ?? undefined,
    bloodType: patient?.bloodType ?? undefined,
    address: patient?.address ?? undefined,
    phone: patient?.phone ?? undefined,
    email: patient?.email ?? undefined,
    emergencyContactName: patient?.emergencyContactName ?? undefined,
    emergencyContactPhone: patient?.emergencyContactPhone ?? undefined,
    occupation: patient?.occupation ?? undefined,
    insuranceProvider: patient?.insuranceProvider ?? undefined,
    insuranceNumber: patient?.insuranceNumber ?? undefined,
    notes: patient?.notes ?? undefined,
  })

  const isPending = createMutation.isPending || updateMutation.isPending

  function updateField<K extends keyof CreatePatientRequest>(
    key: K,
    value: CreatePatientRequest[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value || undefined }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    try {
      if (mode === "create") {
        const result = await createMutation.mutateAsync(formData)
        toast.success("Paciente creado exitosamente")
        router.push(`/dashboard/patients/${result.id}`)
      } else {
        await updateMutation.mutateAsync(formData)
        toast.success("Paciente actualizado exitosamente")
        router.push(`/dashboard/patients/${patient!.id}`)
      }
    } catch {
      toast.error(
        mode === "create"
          ? "Error al crear el paciente"
          : "Error al actualizar el paciente"
      )
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identificación */}
      <Card>
        <CardHeader>
          <CardTitle>Identificación</CardTitle>
          <CardDescription>Datos de identificación del paciente</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="idType">Tipo de identificación *</Label>
            <Select
              value={formData.idType}
              onValueChange={(v) => updateField("idType", v as IdType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ID_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="idNumber">Número de identificación *</Label>
            <Input
              id="idNumber"
              value={formData.idNumber}
              onChange={(e) => updateField("idNumber", e.target.value)}
              placeholder="0000000000"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombres *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Nombres"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Apellidos"
              required
            />
          </div>
        </CardContent>
      </Card>

      {/* Datos personales */}
      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>Información demográfica</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="birthDate">Fecha de nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate ?? ""}
              onChange={(e) => updateField("birthDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Género</Label>
            <Select
              value={formData.gender ?? ""}
              onValueChange={(v) => updateField("gender", (v || undefined) as Gender | undefined)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GENDER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodType">Tipo de sangre</Label>
            <Select
              value={formData.bloodType ?? ""}
              onValueChange={(v) =>
                updateField("bloodType", (v || undefined) as BloodType | undefined)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BLOOD_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation">Ocupación</Label>
            <Input
              id="occupation"
              value={formData.occupation ?? ""}
              onChange={(e) => updateField("occupation", e.target.value)}
              placeholder="Ocupación"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacto */}
      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
          <CardDescription>Información de contacto</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone ?? ""}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="0999999999"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email ?? ""}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address ?? ""}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Dirección completa"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contacto de emergencia */}
      <Card>
        <CardHeader>
          <CardTitle>Contacto de emergencia</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Nombre del contacto</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName ?? ""}
              onChange={(e) => updateField("emergencyContactName", e.target.value)}
              placeholder="Nombre completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Teléfono del contacto</Label>
            <Input
              id="emergencyContactPhone"
              type="tel"
              value={formData.emergencyContactPhone ?? ""}
              onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
              placeholder="0999999999"
            />
          </div>
        </CardContent>
      </Card>

      {/* Seguro */}
      <Card>
        <CardHeader>
          <CardTitle>Seguro médico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">Aseguradora</Label>
            <Input
              id="insuranceProvider"
              value={formData.insuranceProvider ?? ""}
              onChange={(e) => updateField("insuranceProvider", e.target.value)}
              placeholder="Nombre de la aseguradora"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insuranceNumber">Número de póliza</Label>
            <Input
              id="insuranceNumber"
              value={formData.insuranceNumber ?? ""}
              onChange={(e) => updateField("insuranceNumber", e.target.value)}
              placeholder="Número de póliza"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notas */}
      <Card>
        <CardHeader>
          <CardTitle>Notas adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.notes ?? ""}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Observaciones o notas adicionales..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending
            ? mode === "create"
              ? "Creando..."
              : "Guardando..."
            : mode === "create"
              ? "Crear paciente"
              : "Guardar cambios"}
        </Button>
      </div>
    </form>
  )
}
