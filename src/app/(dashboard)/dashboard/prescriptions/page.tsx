"use client"

import { useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { PrescriptionTable } from "@/components/prescriptions/prescription-table"
import { useMyPrescriptions, usePendingPrescriptions } from "@/hooks/use-prescriptions"
import { usePharmacies } from "@/hooks/use-organizations"
import { Pill, Stethoscope, Store } from "lucide-react"

type ViewMode = "my" | "pharmacy"

export default function PrescriptionsPage() {
  const { data: session } = useSession()
  const userRoles = session?.user?.roles ?? []

  const isDoctor = userRoles.includes("DOCTOR") || userRoles.includes("ADMIN")
  const isPharmacist = userRoles.includes("PHARMACIST") || userRoles.includes("ADMIN")

  const [viewMode, setViewMode] = useState<ViewMode>(isDoctor ? "my" : "pharmacy")
  const [selectedPharmacyId, setSelectedPharmacyId] = useState("")

  const myPrescriptions = useMyPrescriptions()
  const pendingPrescriptions = usePendingPrescriptions(selectedPharmacyId)
  const { data: pharmacies = [], isLoading: loadingPharmacies } = usePharmacies()

  const pharmacyItems = useMemo(
    () => Object.fromEntries(pharmacies.map((p) => [p.id, p.name])),
    [pharmacies]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recetas</h1>
          <p className="text-muted-foreground">
            Gestión de recetas médicas y dispensación
          </p>
        </div>
      </div>

      {/* View toggle */}
      {isDoctor && isPharmacist && (
        <div className="flex gap-2">
          <Button
            variant={viewMode === "my" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("my")}
          >
            <Stethoscope className="mr-2 h-4 w-4" />
            Mis recetas
          </Button>
          <Button
            variant={viewMode === "pharmacy" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("pharmacy")}
          >
            <Store className="mr-2 h-4 w-4" />
            Pendientes en farmacia
          </Button>
        </div>
      )}

      {/* My prescriptions view (Doctor) */}
      {viewMode === "my" && isDoctor && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Mis recetas prescritas</h2>
            {myPrescriptions.data && (
              <Badge variant="secondary">
                {myPrescriptions.data.length}
              </Badge>
            )}
          </div>
          <PrescriptionTable
            prescriptions={myPrescriptions.data ?? []}
            isLoading={myPrescriptions.isLoading}
            showPatient
          />
        </div>
      )}

      {/* Pharmacy pending view */}
      {viewMode === "pharmacy" && isPharmacist && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Store className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Recetas pendientes</h2>
          </div>

          {/* Pharmacy selector */}
          <div className="max-w-sm">
            {loadingPharmacies ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={selectedPharmacyId}
                onValueChange={(v) => setSelectedPharmacyId(v ?? "")}
                items={pharmacyItems}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una farmacia" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacies.map((pharmacy) => (
                    <SelectItem key={pharmacy.id} value={pharmacy.id}>
                      {pharmacy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedPharmacyId ? (
            <>
              {pendingPrescriptions.data && (
                <Badge variant="secondary">
                  {pendingPrescriptions.data.length} pendientes
                </Badge>
              )}
              <PrescriptionTable
                prescriptions={pendingPrescriptions.data ?? []}
                isLoading={pendingPrescriptions.isLoading}
                showPatient
                showDoctor
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
              <Pill className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Selecciona una farmacia para ver recetas pendientes
              </p>
            </div>
          )}
        </div>
      )}

      {/* Fallback for non-doctor non-pharmacist */}
      {!isDoctor && !isPharmacist && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Pill className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No tienes permisos para ver recetas
          </p>
        </div>
      )}
    </div>
  )
}
