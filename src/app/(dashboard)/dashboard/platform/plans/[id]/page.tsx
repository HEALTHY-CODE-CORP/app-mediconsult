"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmButton } from "@/components/shared/confirm-button"
import { usePlan, useDeletePlan } from "@/hooks/use-plans"
import { ArrowLeft, Pencil, Trash2, Building2, Store, Users, UserCheck, DollarSign } from "lucide-react"
import { toast } from "sonner"

export default function PlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { data: plan, isLoading } = usePlan(id)
  const deletePlan = useDeletePlan()

  async function handleDelete() {
    try {
      await deletePlan.mutateAsync(id)
      toast.success("Plan eliminado exitosamente")
      router.push("/dashboard/platform/plans")
    } catch {
      toast.error("Error al eliminar el plan")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Plan no encontrado</p>
        <Button
          variant="outline"
          className="mt-4"
          render={<Link href="/dashboard/platform/plans" />}
        >
          Volver a planes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/platform/plans" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{plan.name}</h1>
              <Badge variant={plan.isActive ? "default" : "secondary"}>
                {plan.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-sm">{plan.code}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            render={<Link href={`/dashboard/platform/plans/${plan.id}/edit`} />}
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <ConfirmButton
            variant="destructive"
            size="default"
            title="Eliminar plan"
            description="Las organizaciones que usan este plan quedarán sin plan asignado."
            confirmLabel="Eliminar plan"
            loadingLabel="Eliminando..."
            onConfirm={handleDelete}
            disabled={deletePlan.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </ConfirmButton>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Precios
            </CardTitle>
            <CardDescription>Tarifas del plan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Precio mensual</span>
              <span className="font-semibold">{plan.monthlyPriceFormatted}/mes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Precio anual</span>
              <span className="font-semibold">{plan.annualPriceFormatted}/año</span>
            </div>
            <div className="flex justify-between border-t pt-4">
              <span className="text-sm text-muted-foreground">Fee por consulta</span>
              <span className="font-semibold">{plan.consultationFeeFormatted}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Límites
            </CardTitle>
            <CardDescription>Recursos máximos por organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="h-4 w-4" />
                Consultorios
              </span>
              <span className="font-semibold">{plan.maxClinics}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="h-4 w-4" />
                Farmacias
              </span>
              <span className="font-semibold">{plan.maxPharmacies}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCheck className="h-4 w-4" />
                Usuarios
              </span>
              <span className="font-semibold">{plan.maxUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                Pacientes
              </span>
              <span className="font-semibold">{plan.maxPatients}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {plan.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
