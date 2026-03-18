"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PlanForm } from "@/components/admin/plan-form"
import { useCreatePlan } from "@/hooks/use-plans"
import type { CreatePlanRequest } from "@/types/plan.model"

export default function NewPlanPage() {
  const createPlan = useCreatePlan()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/dashboard/admin/plans" />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo plan</h1>
          <p className="text-muted-foreground">
            Crear un nuevo plan de suscripci&oacute;n
          </p>
        </div>
      </div>

      <PlanForm
        mode="create"
        onSubmit={async (data) => {
          const result = await createPlan.mutateAsync(data as CreatePlanRequest)
          return { id: result.id }
        }}
        isPending={createPlan.isPending}
      />
    </div>
  )
}
