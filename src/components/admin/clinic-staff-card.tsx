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
  useClinicStaff,
  useAssignStaffToClinic,
  useUnassignStaffFromClinic,
  useSetPrimaryClinic,
} from "@/hooks/use-organizations"
import { useUsers } from "@/hooks/use-users"
import { ROLE_LABELS } from "@/adapters/user.adapter"
import { Users, Plus, Star, Unlink } from "lucide-react"
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
  const [selectedUserId, setSelectedUserId] = useState("")

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
      await assignMutation.mutateAsync({ userId: selectedUserId })
      setSelectedUserId("")
      toast.success("Personal asignado")
    } catch {
      toast.error("Error al asignar personal")
    }
  }

  async function handleUnassign(userId: string) {
    if (!confirm("¿Desasignar este usuario de la clínica?")) return
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
      toast.success("Clínica establecida como principal para este usuario")
    } catch {
      toast.error("Error al establecer como principal")
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
          Doctores y enfermeros asignados a esta clínica
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
                className="flex items-center justify-between rounded-lg border p-3"
              >
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
                      title="Establecer como clínica principal"
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleUnassign(cs.user.id)}
                    disabled={unassignMutation.isPending}
                    title="Desasignar"
                  >
                    <Unlink className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {availableUsers.length > 0 && (
          <div className="flex items-end gap-2 border-t pt-4">
            <div className="flex-1 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Asignar personal
              </p>
              <Select
                value={selectedUserId}
                onValueChange={(v) => setSelectedUserId(v ?? "")}
                items={userItems}
              >
                <SelectTrigger className="w-full">
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
        )}
      </CardContent>
    </Card>
  )
}
