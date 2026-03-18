"use client"

import { use, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PrescriptionItemsTable } from "@/components/prescriptions/prescription-items-table"
import { StockCheckTable } from "@/components/prescriptions/stock-check-table"
import {
  usePrescription,
  useCancelPrescription,
  useAssignPharmacy,
  useStockCheck,
} from "@/hooks/use-prescriptions"
import { usePharmacies } from "@/hooks/use-organizations"
import {
  ArrowLeft,
  User,
  Stethoscope,
  Calendar,
  Store,
  FileText,
  Package,
  XCircle,
  Pill,
} from "lucide-react"
import { toast } from "sonner"

interface PrescriptionDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PrescriptionDetailPage({
  params,
}: PrescriptionDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: session } = useSession()
  const userRoles = session?.user?.roles ?? []

  const isDoctor = userRoles.includes("DOCTOR") || userRoles.includes("ADMIN")
  const isPharmacist = userRoles.includes("PHARMACIST") || userRoles.includes("ADMIN")

  const { data: prescription, isLoading } = usePrescription(id)
  const { data: pharmacies = [] } = usePharmacies()
  const cancelMutation = useCancelPrescription()
  const assignPharmacyMutation = useAssignPharmacy(id)

  const [assignPharmacyId, setAssignPharmacyId] = useState("")

  const pharmacyItems = useMemo(
    () => Object.fromEntries(pharmacies.map((p) => [p.id, p.name])),
    [pharmacies]
  )

  // Stock check — only when pharmacy is assigned
  const stockCheck = useStockCheck(
    id,
    prescription?.pharmacyId ?? ""
  )

  async function handleCancel() {
    if (!confirm("¿Deseas cancelar esta receta? Esta acción no se puede deshacer.")) return
    try {
      await cancelMutation.mutateAsync(id)
      toast.success("Receta cancelada")
    } catch {
      toast.error("Error al cancelar la receta")
    }
  }

  async function handleAssignPharmacy() {
    if (!assignPharmacyId) return
    try {
      await assignPharmacyMutation.mutateAsync(assignPharmacyId)
      toast.success("Farmacia asignada correctamente")
      setAssignPharmacyId("")
    } catch {
      toast.error("Error al asignar farmacia")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    )
  }

  if (!prescription) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Receta no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/prescriptions" />}
        >
          Volver a recetas
        </Button>
      </div>
    )
  }

  const isPending = prescription.status === "PENDING"
  const isPartial = prescription.status === "PARTIALLY_DISPENSED"
  const isCancelled = prescription.status === "CANCELLED"
  const isDispensed = prescription.status === "DISPENSED"
  const canCancel = (isPending || isPartial) && isDoctor
  const canAssignPharmacy = !prescription.pharmacyId && isDoctor && !isCancelled && !isDispensed

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/prescriptions" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">
                Receta {prescription.prescriptionNumber}
              </h1>
              <Badge className={prescription.statusColor}>
                {prescription.statusLabel}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              {prescription.patientName} · {prescription.prescribedAtFormatted}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {canCancel && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
            >
              <XCircle className="mr-1 h-4 w-4" />
              {cancelMutation.isPending ? "Cancelando..." : "Cancelar"}
            </Button>
          )}
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* General info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información general
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow
              icon={<User className="h-4 w-4" />}
              label="Paciente"
              value={`${prescription.patientName} (${prescription.patientIdNumber})`}
            />
            <InfoRow
              icon={<Stethoscope className="h-4 w-4" />}
              label="Doctor"
              value={prescription.doctorName}
            />
            <InfoRow
              icon={<Calendar className="h-4 w-4" />}
              label="Fecha de prescripción"
              value={prescription.prescribedAtFormatted}
            />
            {prescription.dispensedAt && (
              <InfoRow
                icon={<Pill className="h-4 w-4" />}
                label="Dispensado"
                value={`${prescription.dispensedAtFormatted} por ${prescription.dispensedByName}`}
              />
            )}
            {prescription.notes && (
              <div>
                <p className="text-xs text-muted-foreground">Notas</p>
                <p className="text-sm whitespace-pre-wrap">{prescription.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pharmacy info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Farmacia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prescription.pharmacyId ? (
              <InfoRow
                icon={<Store className="h-4 w-4" />}
                label="Farmacia asignada"
                value={prescription.pharmacyName}
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                Sin farmacia asignada
              </p>
            )}

            {canAssignPharmacy && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">
                  Asignar farmacia
                </p>
                <div className="flex gap-2">
                  <Select
                    value={assignPharmacyId}
                    onValueChange={(v) => setAssignPharmacyId(v ?? "")}
                    items={pharmacyItems}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar farmacia" />
                    </SelectTrigger>
                    <SelectContent>
                      {pharmacies.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleAssignPharmacy}
                    disabled={!assignPharmacyId || assignPharmacyMutation.isPending}
                  >
                    {assignPharmacyMutation.isPending ? "Asignando..." : "Asignar"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prescription items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos recetados ({prescription.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PrescriptionItemsTable items={prescription.items} />
        </CardContent>
      </Card>

      {/* Stock check */}
      {prescription.pharmacyId && isPharmacist && (isPending || isPartial) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Verificación de stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StockCheckTable
              items={stockCheck.data ?? []}
              isLoading={stockCheck.isLoading}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string | null
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? "—"}</p>
      </div>
    </div>
  )
}
