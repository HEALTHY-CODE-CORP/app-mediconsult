"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import type { AxiosError } from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useConsultation } from "@/hooks/use-clinical"
import { usePatient } from "@/hooks/use-patients"
import { useCreateConsultationInvoice } from "@/hooks/use-billing"
import {
  ArrowLeft,
  Receipt,
  User,
  Stethoscope,
  DollarSign,
  Building2,
} from "lucide-react"
import { toast } from "sonner"
import type { ConsultationIssuerType, TipoIdentificacion } from "@/types/billing.model"

function mapIdTypeToSri(idType: string): TipoIdentificacion {
  switch (idType) {
    case "RUC":
      return "04"
    case "CEDULA":
      return "05"
    case "PASSPORT":
      return "06"
    default:
      return "07"
  }
}

export function NewConsultationInvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const consultationId = searchParams.get("consultationId") ?? ""

  const { data: consultation, isLoading: loadingConsultation } =
    useConsultation(consultationId)
  const { data: patient, isLoading: loadingPatient } = usePatient(
    consultation?.patientId ?? ""
  )

  const createInvoiceMutation = useCreateConsultationInvoice()

  const [buyerOverrides, setBuyerOverrides] = useState<{
    tipoId?: TipoIdentificacion
    identificacion?: string
    razonSocial?: string
    direccion?: string
    email?: string
    telefono?: string
  }>({})
  const [formaPago, setFormaPago] = useState("01")
  const [issuerType, setIssuerType] = useState<ConsultationIssuerType>("CLINIC")
  const [consultationPriceOverride, setConsultationPriceOverride] = useState<string | null>(null)

  function getApiErrorMessage(error: unknown): string | null {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>
    const data = axiosError.response?.data
    if (typeof data?.message === "string" && data.message.trim().length > 0) {
      return data.message
    }
    if (typeof data?.error === "string" && data.error.trim().length > 0) {
      return data.error
    }
    return null
  }

  const pacienteDefault = {
    tipoId: (patient ? mapIdTypeToSri(patient.idType) : "05") as TipoIdentificacion,
    identificacion: patient?.idNumber ?? "",
    razonSocial: patient?.fullName ?? "",
    direccion: patient?.address ?? "",
    email: patient?.email ?? "",
    telefono: patient?.phone ?? "",
  }

  const compradorTipoId = buyerOverrides.tipoId ?? pacienteDefault.tipoId
  const compradorIdentificacion =
    buyerOverrides.identificacion ?? pacienteDefault.identificacion
  const compradorRazonSocial =
    buyerOverrides.razonSocial ?? pacienteDefault.razonSocial
  const compradorDireccion = buyerOverrides.direccion ?? pacienteDefault.direccion
  const compradorEmail = buyerOverrides.email ?? pacienteDefault.email
  const compradorTelefono = buyerOverrides.telefono ?? pacienteDefault.telefono

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!compradorIdentificacion || !compradorRazonSocial) {
      toast.error("Identificación y razón social son obligatorios")
      return
    }

    const effectivePrice = consultationPriceOverride ?? (consultation?.cost?.toString() ?? "0")
    const trimmedPrice = effectivePrice.trim()
    let parsedConsultationPrice: number | undefined
    if (trimmedPrice.length > 0) {
      parsedConsultationPrice = Number(trimmedPrice)
      if (!Number.isFinite(parsedConsultationPrice) || parsedConsultationPrice < 0) {
        toast.error("El precio de la consulta debe ser un valor numérico mayor o igual a 0")
        return
      }
    }

    try {
      const result = await createInvoiceMutation.mutateAsync({
        consultationId,
        issuerType,
        compradorTipoId,
        compradorIdentificacion,
        compradorRazonSocial,
        compradorDireccion: compradorDireccion || undefined,
        compradorEmail: compradorEmail || undefined,
        compradorTelefono: compradorTelefono || undefined,
        consultationPrice: parsedConsultationPrice,
        formaPago,
      })
      toast.success("Factura creada exitosamente")
      router.push(`/dashboard/clinical/billing/${result.id}`)
    } catch (error) {
      toast.error(getApiErrorMessage(error) ?? "Error al crear la factura")
    }
  }

  if (!consultationId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">No se especificó la consulta</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/clinical/consultations" />}
        >
          Ir a consultas
        </Button>
      </div>
    )
  }

  if (loadingConsultation || loadingPatient) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!consultation) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Consulta no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/clinical/consultations" />}
        >
          Volver a consultas
        </Button>
      </div>
    )
  }

  if (consultation.status !== "COMPLETED") {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">
          Solo se pueden facturar consultas completadas
        </p>
        <Button
          variant="link"
          className="mt-2"
          render={
            <Link
              href={`/dashboard/clinical/consultations/${consultationId}`}
            />
          }
        >
          Volver a la consulta
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={
            <Link
              href={`/dashboard/clinical/consultations/${consultationId}`}
            />
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Nueva Factura de Consulta
          </h1>
          <p className="text-muted-foreground">
            Crear factura electrónica SRI para consulta médica
          </p>
        </div>
      </div>

      {/* Consultation summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Resumen de la consulta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Paciente</p>
              <p className="text-sm font-medium">{consultation.patientName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Doctor</p>
              <p className="text-sm font-medium">{consultation.doctorName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fecha</p>
              <p className="text-sm font-medium">
                {consultation.consultationDateFormatted}
              </p>
            </div>
          </div>
          {consultation.diagnosisDescription && (
            <div>
              <p className="text-xs text-muted-foreground">Diagnóstico</p>
              <p className="text-sm">
                {consultation.diagnosisCode && (
                  <span className="font-mono mr-2">
                    [{consultation.diagnosisCode}]
                  </span>
                )}
                {consultation.diagnosisDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Emisor de la factura
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-w-md space-y-2">
              <Label htmlFor="consultation-invoice-issuer-type">
                Facturar a nombre de
              </Label>
              <Select
                value={issuerType}
                onValueChange={(v) => {
                  if (v) setIssuerType(v as ConsultationIssuerType)
                }}
                items={{ CLINIC: "Consultorio / Clínica", DOCTOR: "Médico tratante" }}
              >
                <SelectTrigger id="consultation-invoice-issuer-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLINIC">Consultorio / Clínica</SelectItem>
                  <SelectItem value="DOCTOR">Médico tratante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Debe existir perfil tributario completo y certificado P12 activo para el emisor seleccionado.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Datos del comprador
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="consultation-invoice-id-type">
                  Tipo de identificación *
                </Label>
                <Select
                  value={compradorTipoId}
                  onValueChange={(v) => {
                    if (v) {
                      setBuyerOverrides((prev) => ({
                        ...prev,
                        tipoId: v as TipoIdentificacion,
                      }))
                    }
                  }}
                  items={{ "04": "RUC", "05": "Cédula", "06": "Pasaporte", "07": "Consumidor Final" }}
                >
                  <SelectTrigger id="consultation-invoice-id-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="04">RUC</SelectItem>
                    <SelectItem value="05">Cédula</SelectItem>
                    <SelectItem value="06">Pasaporte</SelectItem>
                    <SelectItem value="07">Consumidor Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Identificación *</Label>
                <Input
                  value={compradorIdentificacion}
                  onChange={(e) =>
                    setBuyerOverrides((prev) => ({
                      ...prev,
                      identificacion: e.target.value,
                    }))
                  }
                  placeholder="Número de identificación"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Razón social / Nombre *</Label>
                <Input
                  value={compradorRazonSocial}
                  onChange={(e) =>
                    setBuyerOverrides((prev) => ({
                      ...prev,
                      razonSocial: e.target.value,
                    }))
                  }
                  placeholder="Nombre completo o razón social"
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label>Dirección</Label>
                <Input
                  value={compradorDireccion}
                  onChange={(e) =>
                    setBuyerOverrides((prev) => ({
                      ...prev,
                      direccion: e.target.value,
                    }))
                  }
                  placeholder="Dirección del comprador"
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={compradorEmail}
                  onChange={(e) =>
                    setBuyerOverrides((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="email@ejemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input
                  value={compradorTelefono}
                  onChange={(e) =>
                    setBuyerOverrides((prev) => ({
                      ...prev,
                      telefono: e.target.value,
                    }))
                  }
                  placeholder="Número de teléfono"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cobro de consulta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="consultation-invoice-payment-method">
                  Método de pago
                </Label>
                <Select
                  value={formaPago}
                  onValueChange={(v) => {
                    if (v) setFormaPago(v)
                  }}
                  items={{ "01": "Efectivo", "16": "Tarjeta de débito", "19": "Tarjeta de crédito", "20": "Otros / Transferencia" }}
                >
                  <SelectTrigger id="consultation-invoice-payment-method">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="01">Efectivo</SelectItem>
                    <SelectItem value="16">Tarjeta de débito</SelectItem>
                    <SelectItem value="19">Tarjeta de crédito</SelectItem>
                    <SelectItem value="20">Otros / Transferencia</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="consultation-invoice-custom-price">
                  Precio de consulta
                </Label>
                <Input
                  id="consultation-invoice-custom-price"
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  value={consultationPriceOverride ?? consultation.cost.toString()}
                  onChange={(e) => setConsultationPriceOverride(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Precio asignado al crear la consulta. Puedes ajustarlo si es necesario.
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            render={
              <Link
                href={`/dashboard/clinical/consultations/${consultationId}`}
              />
            }
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createInvoiceMutation.isPending}
          >
            <Receipt className="mr-2 h-4 w-4" />
            {createInvoiceMutation.isPending
              ? "Creando factura..."
              : "Crear factura"}
          </Button>
        </div>
      </form>
    </div>
  )
}
