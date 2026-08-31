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
  MARITAL_STATUS_LABELS,
  EDUCATION_LEVEL_LABELS,
} from "@/adapters/patient.adapter"
import type { Patient } from "@/adapters/patient.adapter"
import type {
  CreatePatientRequest,
  IdType,
  Gender,
  BloodType,
  MaritalStatus,
  EducationLevel,
} from "@/types/patient.model"
import { ClipboardCheck, Info } from "lucide-react"

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
    maritalStatus: patient?.maritalStatus ?? undefined,
    numberOfChildren: patient?.numberOfChildren ?? undefined,
    birthCountry: patient?.birthCountry ?? undefined,
    birthProvince: patient?.birthProvince ?? undefined,
    birthCity: patient?.birthCity ?? undefined,
    residencePlace: patient?.residencePlace ?? undefined,
    currentOccupation: patient?.currentOccupation ?? patient?.occupation ?? undefined,
    educationLevel: patient?.educationLevel ?? undefined,
    insuranceProvider: patient?.insuranceProvider ?? undefined,
    insuranceNumber: patient?.insuranceNumber ?? undefined,
    notes: patient?.notes ?? undefined,
  })
  const [submitAttempted, setSubmitAttempted] = useState(false)

  const isPending = createMutation.isPending || updateMutation.isPending
  const requiredChecklist = [
    { label: "Tipo de identificación", ok: Boolean(formData.idType) },
    { label: "Número de identificación", ok: Boolean(formData.idNumber.trim()) },
    { label: "Nombres", ok: Boolean(formData.firstName.trim()) },
    { label: "Apellidos", ok: Boolean(formData.lastName.trim()) },
  ]
  const completedRequired = requiredChecklist.filter((item) => item.ok).length
  const progressPercent = Math.round(
    (completedRequired / requiredChecklist.length) * 100
  )
  const emailValue = formData.email?.trim() ?? ""
  const fieldErrors = {
    idNumber: formData.idNumber?.trim() ? "" : "El número de identificación es obligatorio.",
    firstName: formData.firstName?.trim() ? "" : "Los nombres son obligatorios.",
    lastName: formData.lastName?.trim() ? "" : "Los apellidos son obligatorios.",
    email:
      emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)
        ? "Ingresa un correo electrónico válido."
        : "",
    numberOfChildren:
      formData.numberOfChildren != null && formData.numberOfChildren < 0
        ? "El número de hijos no puede ser negativo."
        : "",
  }
  const hasValidationErrors = Object.values(fieldErrors).some(Boolean)

  function updateField<K extends keyof CreatePatientRequest>(
    key: K,
    value: CreatePatientRequest[K]
  ) {
    setFormData((prev) => ({ ...prev, [key]: value || undefined }))
  }

  function updateNumberField(key: "numberOfChildren", value: string) {
    setFormData((prev) => ({
      ...prev,
      [key]: value === "" ? undefined : Number(value),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)

    if (hasValidationErrors) {
      toast.error("Revisa los campos obligatorios del formulario")
      return
    }

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
      <Card className="border-border/70">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardCheck className="h-4 w-4" />
            Progreso del registro
          </CardTitle>
          <CardDescription>
            Completa los campos obligatorios para continuar.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Campos obligatorios completados
            </span>
            <span className="font-medium">
              {completedRequired}/{requiredChecklist.length}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-2 rounded-md bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Puedes completar los datos opcionales ahora o editarlos más tarde.
          </div>
        </CardContent>
      </Card>

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
              items={ID_TYPE_LABELS as Record<string, string>}
            >
              <SelectTrigger id="idType" className="w-full">
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
              aria-invalid={submitAttempted && Boolean(fieldErrors.idNumber)}
            />
            {submitAttempted && fieldErrors.idNumber && (
              <p className="text-xs text-destructive">{fieldErrors.idNumber}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="firstName">Nombres *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              placeholder="Nombres"
              required
              aria-invalid={submitAttempted && Boolean(fieldErrors.firstName)}
            />
            {submitAttempted && fieldErrors.firstName && (
              <p className="text-xs text-destructive">{fieldErrors.firstName}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              placeholder="Apellidos"
              required
              aria-invalid={submitAttempted && Boolean(fieldErrors.lastName)}
            />
            {submitAttempted && fieldErrors.lastName && (
              <p className="text-xs text-destructive">{fieldErrors.lastName}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Datos personales</CardTitle>
          <CardDescription>Información demográfica general</CardDescription>
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
              items={GENDER_LABELS as Record<string, string>}
            >
              <SelectTrigger id="gender" className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GENDER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bloodType">Tipo de sangre</Label>
            <Select
              value={formData.bloodType ?? ""}
              onValueChange={(v) => updateField("bloodType", (v || undefined) as BloodType | undefined)}
              items={BLOOD_TYPE_LABELS as Record<string, string>}
            >
              <SelectTrigger id="bloodType" className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(BLOOD_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="maritalStatus">Estado civil</Label>
            <Select
              value={formData.maritalStatus ?? ""}
              onValueChange={(v) => updateField("maritalStatus", (v || undefined) as MaritalStatus | undefined)}
              items={MARITAL_STATUS_LABELS as Record<string, string>}
            >
              <SelectTrigger id="maritalStatus" className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(MARITAL_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numberOfChildren">Número de hijos</Label>
            <Input
              id="numberOfChildren"
              type="number"
              min="0"
              value={formData.numberOfChildren ?? ""}
              onChange={(e) => updateNumberField("numberOfChildren", e.target.value)}
              aria-invalid={submitAttempted && Boolean(fieldErrors.numberOfChildren)}
            />
            {submitAttempted && fieldErrors.numberOfChildren && (
              <p className="text-xs text-destructive">{fieldErrors.numberOfChildren}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Nacimiento y residencia</CardTitle>
          <CardDescription>Datos complementarios del paciente</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="birthCountry">País de nacimiento</Label>
            <Input id="birthCountry" value={formData.birthCountry ?? ""} onChange={(e) => updateField("birthCountry", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthProvince">Provincia de nacimiento</Label>
            <Input id="birthProvince" value={formData.birthProvince ?? ""} onChange={(e) => updateField("birthProvince", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="birthCity">Ciudad de nacimiento</Label>
            <Input id="birthCity" value={formData.birthCity ?? ""} onChange={(e) => updateField("birthCity", e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2 lg:col-span-3">
            <Label htmlFor="residencePlace">Lugar de residencia</Label>
            <Input id="residencePlace" value={formData.residencePlace ?? ""} onChange={(e) => updateField("residencePlace", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ocupación e instrucción</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="currentOccupation">Ocupación actual</Label>
            <Input
              id="currentOccupation"
              value={formData.currentOccupation ?? ""}
              onChange={(e) => updateField("currentOccupation", e.target.value)}
              placeholder="Ocupación actual"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="educationLevel">Nivel de instrucción</Label>
            <Select
              value={formData.educationLevel ?? ""}
              onValueChange={(v) => updateField("educationLevel", (v || undefined) as EducationLevel | undefined)}
              items={EDUCATION_LEVEL_LABELS as Record<string, string>}
            >
              <SelectTrigger id="educationLevel" className="w-full">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EDUCATION_LEVEL_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto</CardTitle>
          <CardDescription>Información de contacto</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input id="phone" type="tel" value={formData.phone ?? ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="0999999999" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input id="email" type="email" value={formData.email ?? ""} onChange={(e) => updateField("email", e.target.value)} placeholder="correo@ejemplo.com" aria-invalid={submitAttempted && Boolean(fieldErrors.email)} />
            {submitAttempted && fieldErrors.email ? (
              <p className="text-xs text-destructive">{fieldErrors.email}</p>
            ) : (
              <p className="text-xs text-muted-foreground">Opcional, pero recomendado para comunicación del consultorio.</p>
            )}
          </div>
          <div className="col-span-full space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input id="address" value={formData.address ?? ""} onChange={(e) => updateField("address", e.target.value)} placeholder="Dirección completa" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto de emergencia</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Nombre del contacto</Label>
            <Input id="emergencyContactName" value={formData.emergencyContactName ?? ""} onChange={(e) => updateField("emergencyContactName", e.target.value)} placeholder="Nombre completo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Teléfono del contacto</Label>
            <Input id="emergencyContactPhone" type="tel" value={formData.emergencyContactPhone ?? ""} onChange={(e) => updateField("emergencyContactPhone", e.target.value)} placeholder="0999999999" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguro médico</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="insuranceProvider">Aseguradora</Label>
            <Input id="insuranceProvider" value={formData.insuranceProvider ?? ""} onChange={(e) => updateField("insuranceProvider", e.target.value)} placeholder="Nombre de la aseguradora" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="insuranceNumber">Número de póliza</Label>
            <Input id="insuranceNumber" value={formData.insuranceNumber ?? ""} onChange={(e) => updateField("insuranceNumber", e.target.value)} placeholder="Número de póliza" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas adicionales</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea value={formData.notes ?? ""} onChange={(e) => updateField("notes", e.target.value)} placeholder="Observaciones o notas adicionales..." rows={3} />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending} className="w-full sm:w-auto">
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
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
