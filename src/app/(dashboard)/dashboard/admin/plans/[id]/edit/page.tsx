"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from "lucide-react"
import { PlanForm } from "@/components/admin/plan-form"
import { usePlan, useUpdatePlan } from "@/hooks/use-plans"
import type { UpdatePlanRequest } from "@/types/plan.model"

export default function EditPlanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: plan, isLoading } = usePlan(id)
  const updatePlan = useUpdatePlan(id)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
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
          render={<Link href="/dashboard/admin/plans" />}
        >
          Volver a planes
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/dashboard/admin/plans/${id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar plan</h1>
          <p className="text-muted-foreground">{plan.name}</p>
        </div>
      </div>

      <PlanForm
        plan={plan}
        mode="edit"
        onSubmit={async (data) => {
          const result = await updatePlan.mutateAsync(data as UpdatePlanRequest)
          return { id: result.id }
        }}
        isPending={updatePlan.isPending}
      />
    </div>
  )
}
