"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, ShieldAlert, X } from "lucide-react"
import { usePatientAllergies, useDeactivateAllergy } from "@/hooks/use-patients"
import { AllergyDialog } from "./allergy-dialog"
import { useState } from "react"
import { toast } from "sonner"
import type { Allergy } from "@/adapters/patient.adapter"

interface PatientAllergiesProps {
  patientId: string
}

export function PatientAllergies({ patientId }: PatientAllergiesProps) {
  const { data: allergies, isLoading } = usePatientAllergies(patientId)
  const deactivateMutation = useDeactivateAllergy(patientId)
  const [dialogOpen, setDialogOpen] = useState(false)

  const activeAllergies = allergies?.filter((a) => a.isActive) ?? []

  async function handleDeactivate(allergy: Allergy) {
    try {
      await deactivateMutation.mutateAsync(allergy.id)
      toast.success("Alergia desactivada")
    } catch {
      toast.error("Error al desactivar la alergia")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Alergias
          </CardTitle>
          <CardDescription>
            {activeAllergies.length === 0
              ? "No se han registrado alergias"
              : `${activeAllergies.length} alergia(s) registrada(s)`}
          </CardDescription>
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Agregar
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : activeAllergies.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Alérgeno</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Severidad</TableHead>
                <TableHead>Reacción</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeAllergies.map((allergy) => (
                <TableRow key={allergy.id}>
                  <TableCell className="font-medium">
                    {allergy.allergen}
                  </TableCell>
                  <TableCell>{allergy.allergyTypeLabel}</TableCell>
                  <TableCell>
                    <Badge className={allergy.severityColor} variant="outline">
                      {allergy.severityLabel}
                    </Badge>
                  </TableCell>
                  <TableCell>{allergy.reaction ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDeactivate(allergy)}
                      disabled={deactivateMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>

      <AllergyDialog
        patientId={patientId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  )
}
