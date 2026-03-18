"use client"

import { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useClinicPharmacies,
  useLinkPharmacyToClinic,
  useUnlinkPharmacyFromClinic,
  useSetPrimaryPharmacy,
  usePharmacies,
} from "@/hooks/use-organizations"
import { Store, Plus, Star, Unlink } from "lucide-react"
import { toast } from "sonner"

interface ClinicPharmaciesCardProps {
  clinicId: string
}

export function ClinicPharmaciesCard({ clinicId }: ClinicPharmaciesCardProps) {
  const { data: linkedPharmacies = [], isLoading } = useClinicPharmacies(clinicId)
  const { data: allPharmacies = [] } = usePharmacies()
  const linkMutation = useLinkPharmacyToClinic(clinicId)
  const unlinkMutation = useUnlinkPharmacyFromClinic(clinicId)
  const setPrimaryMutation = useSetPrimaryPharmacy(clinicId)
  const [selectedPharmacyId, setSelectedPharmacyId] = useState("")

  const linkedIds = new Set(linkedPharmacies.map((lp) => lp.pharmacy.id))
  const availablePharmacies = allPharmacies.filter((p) => !linkedIds.has(p.id))

  const pharmacyItems = useMemo(
    () => Object.fromEntries(availablePharmacies.map((p) => [p.id, p.name])),
    [availablePharmacies]
  )

  async function handleLink() {
    if (!selectedPharmacyId) return
    try {
      await linkMutation.mutateAsync({ pharmacyId: selectedPharmacyId })
      setSelectedPharmacyId("")
      toast.success("Farmacia vinculada")
    } catch {
      toast.error("Error al vincular farmacia")
    }
  }

  async function handleUnlink(pharmacyId: string) {
    if (!confirm("¿Desvincular esta farmacia?")) return
    try {
      await unlinkMutation.mutateAsync(pharmacyId)
      toast.success("Farmacia desvinculada")
    } catch {
      toast.error("Error al desvincular")
    }
  }

  async function handleSetPrimary(pharmacyId: string) {
    try {
      await setPrimaryMutation.mutateAsync(pharmacyId)
      toast.success("Farmacia establecida como principal")
    } catch {
      toast.error("Error al establecer como principal")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Farmacias vinculadas
        </CardTitle>
        <CardDescription>
          Farmacias asociadas a esta clínica
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : linkedPharmacies.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay farmacias vinculadas
          </p>
        ) : (
          <div className="space-y-2">
            {linkedPharmacies.map((lp) => (
              <div
                key={lp.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <Store className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{lp.pharmacy.name}</p>
                    {lp.pharmacy.address && (
                      <p className="text-xs text-muted-foreground">
                        {lp.pharmacy.address}
                      </p>
                    )}
                  </div>
                  {lp.isPrimary && (
                    <Badge variant="default" className="ml-2">
                      <Star className="mr-1 h-3 w-3" />
                      Principal
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {!lp.isPrimary && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleSetPrimary(lp.pharmacy.id)}
                      disabled={setPrimaryMutation.isPending}
                      title="Establecer como principal"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleUnlink(lp.pharmacy.id)}
                    disabled={unlinkMutation.isPending}
                    title="Desvincular"
                  >
                    <Unlink className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {availablePharmacies.length > 0 && (
          <div className="flex items-end gap-2 border-t pt-4">
            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Vincular farmacia
              </p>
              <Select
                value={selectedPharmacyId}
                onValueChange={(v) => setSelectedPharmacyId(v ?? "")}
                items={pharmacyItems}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar farmacia..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePharmacies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              size="sm"
              onClick={handleLink}
              disabled={!selectedPharmacyId || linkMutation.isPending}
            >
              <Plus className="mr-1 h-4 w-4" />
              Vincular
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
