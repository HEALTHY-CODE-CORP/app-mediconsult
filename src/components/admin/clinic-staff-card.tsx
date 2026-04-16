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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmButton } from "@/components/shared/confirm-button"
import {
  useClinicStaff,
  useAssignStaffToClinic,
  useUnassignStaffFromClinic,
  useSetPrimaryClinic,
  useUpdateClinicStaff,
} from "@/hooks/use-organizations"
import { useUsers } from "@/hooks/use-users"
import { ROLE_LABELS } from "@/adapters/user.adapter"
import { Users, Plus, Star, Unlink, DollarSign, Pencil, Check, X } from "lucide-react"
import { toast } from "sonner"
import type { Role } from "@/types/auth.model"

interface ClinicStaffCardProps {
  clinicId: string
}

const CLINICAL_ROLES: Role[] = ["DOCTOR", "NURSE"]

export function ClinicStaffCard({ clinicId }: ClinicStaffCardProps) {
  const { data: assignedStaff = [], isLoading } = useClinicStaff(clinicId)
  const { data: allUsers = [] } = useUsers()
  const assignMutation = useAssignStaffToClinic(clinicId)
  const unassignMutation = useUnassignStaffFromClinic(clinicId)
  const setPrimaryMutation = useSetPrimaryClinic(clinicId)
  const updateStaffMutation = useUpdateClinicStaff(clinicId)
  const [selectedUserId, setSelectedUserId] = useState("")
  const [assignPrice, setAssignPrice] = useState("")
  const [assignPercentage, setAssignPercentage] = useState("")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editPrice, setEditPrice] = useState("")
  const [editPercentage, setEditPercentage] = useState("")

  const assignedIds = new Set(assignedStaff.map((s) => s.user.id))
  const availableUsers = allUsers.filter(
    (u) =>
      !assignedIds.has(u.id) &&
      u.isActive &&
      u.roles.some((r) => CLINICAL_ROLES.includes(r as Role))
  )

  const userItems = useMemo(
    () => Object.fromEntries(availableUsers.map((u) => [u.id, u.fullName])),
    [availableUsers]
  )

  async function handleAssign() {
    if (!selectedUserId) return
    try {
      await assignMutation.mutateAsync({
        userId: selectedUserId,
        consultationPrice: assignPrice ? parseFloat(assignPrice) : undefined,
        consultationPercentage: assignPercentage ? parseFloat(assignPercentage) : undefined,
      })
      setSelectedUserId("")
      setAssignPrice("")
      setAssignPercentage("")
      toast.success("Personal asignado")
    } catch {
      toast.error("Error al asignar personal")
    }
  }

  async function handleUnassign(userId: string) {
    try {
      await unassignMutation.mutateAsync(userId)
      toast.success("Personal desasignado")
    } catch {
      toast.error("Error al desasignar")
    }
  }

  async function handleSetPrimary(userId: string) {
    try {
      await setPrimaryMutation.mutateAsync(userId)
      toast.success("Consultorio establecido como principal para este usuario")
    } catch {
      toast.error("Error al establecer como principal")
    }
  }

  function startEditing(userId: string, currentPrice: number | null, currentPercentage: number | null) {
    setEditingUserId(userId)
    setEditPrice(currentPrice?.toString() ?? "")
    setEditPercentage(currentPercentage?.toString() ?? "")
  }

  function cancelEditing() {
    setEditingUserId(null)
    setEditPrice("")
    setEditPercentage("")
  }

  async function handleUpdatePrice(userId: string) {
    try {
      await updateStaffMutation.mutateAsync({
        userId,
        consultationPrice: editPrice ? parseFloat(editPrice) : undefined,
        consultationPercentage: editPercentage ? parseFloat(editPercentage) : undefined,
      })
      setEditingUserId(null)
      toast.success("Precio de consulta actualizado")
    } catch {
      toast.error("Error al actualizar precio")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Personal asignado
        </CardTitle>
        <CardDescription>
          Doctores y enfermeros asignados a este consultorio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : assignedStaff.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay personal asignado
          </p>
        ) : (
          <div className="space-y-2">
            {assignedStaff.map((cs) => (
              <div
                key={cs.id}
                className="rounded-lg border p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{cs.user.fullName}</p>
                      <div className="flex gap-1">
                        {cs.user.roles.map((role) => (
                          <span key={role} className="text-xs text-muted-foreground">
                            {ROLE_LABELS[role as Role] ?? role}
                          </span>
                        ))}
                      </div>
                    </div>
                    {cs.isPrimary && (
                      <Badge variant="default" className="ml-2">
                        <Star className="mr-1 h-3 w-3" />
                        Principal
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {!cs.isPrimary && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleSetPrimary(cs.user.id)}
                        disabled={setPrimaryMutation.isPending}
                        title="Establecer como consultorio principal"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <ConfirmButton
                      variant="ghost"
                      size="icon-sm"
                      title="Desasignar usuario"
                      description="El usuario dejará de estar asignado a este consultorio."
                      confirmLabel="Desasignar"
                      loadingLabel="Desasignando..."
                      onConfirm={() => handleUnassign(cs.user.id)}
                      disabled={unassignMutation.isPending}
                      titleAttribute="Desasignar"
                    >
                      <Unlink className="h-4 w-4 text-destructive" />
                    </ConfirmButton>
                  </div>
                </div>

                {/* Pricing row */}
                {editingUserId === cs.user.id ? (
                  <div className="flex items-end gap-2 pl-7">
                    <div className="space-y-1">
                      <Label className="text-xs">Precio consulta (USD)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        placeholder="Usar precio de consultorio"
                        className="h-8 w-36 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">% consultorio</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={editPercentage}
                        onChange={(e) => setEditPercentage(e.target.value)}
                        placeholder="Opcional"
                        className="h-8 w-28 text-sm"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleUpdatePrice(cs.user.id)}
                      disabled={updateStaffMutation.isPending}
                      title="Guardar"
                    >
                      <Check className="h-4 w-4 text-green-600" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={cancelEditing}
                      title="Cancelar"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 pl-7">
                    <DollarSign className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {cs.effectiveConsultationPriceFormatted}
                    </span>
                    {cs.consultationPrice !== null ? (
                      <Badge variant="secondary" className="text-xs">
                        Precio propio
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Precio de consultorio
                      </Badge>
                    )}
                    {cs.consultationPercentage !== null && (
                      <Badge variant="outline" className="text-xs">
                        {cs.consultationPercentage}% consultorio
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => startEditing(cs.user.id, cs.consultationPrice, cs.consultationPercentage)}
                      title="Editar precio"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {availableUsers.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">
              Asignar personal
            </p>
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label className="text-xs" htmlFor="clinic-staff-user-select">
                  Usuario
                </Label>
                <Select
                  value={selectedUserId}
                  onValueChange={(v) => setSelectedUserId(v ?? "")}
                  items={userItems}
                >
                  <SelectTrigger id="clinic-staff-user-select" className="w-full">
                    <SelectValue placeholder="Seleccionar usuario..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.fullName} — {u.roleLabels.join(", ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                onClick={handleAssign}
                disabled={!selectedUserId || assignMutation.isPending}
              >
                <Plus className="mr-1 h-4 w-4" />
                Asignar
              </Button>
            </div>
            {selectedUserId && (
              <div className="flex items-end gap-2">
                <div className="space-y-1">
                  <Label className="text-xs">Precio consulta (USD)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={assignPrice}
                    onChange={(e) => setAssignPrice(e.target.value)}
                    placeholder="Usar precio de consultorio"
                    className="h-8 w-40 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">% consultorio</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={assignPercentage}
                    onChange={(e) => setAssignPercentage(e.target.value)}
                    placeholder="Opcional"
                    className="h-8 w-28 text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
