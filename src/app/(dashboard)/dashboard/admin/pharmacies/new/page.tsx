"use client"

import { EntityForm } from "@/components/admin/entity-form"
import { useCreatePharmacy } from "@/hooks/use-organizations"

export default function NewPharmacyPage() {
  const mutation = useCreatePharmacy()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva farmacia</h1>
        <p className="text-muted-foreground">
          Registra una nueva farmacia en la organización
        </p>
      </div>

      <EntityForm
        entityType="pharmacy"
        mode="create"
        onSubmit={async (data) => mutation.mutateAsync(data)}
        isPending={mutation.isPending}
        backUrl="/dashboard/admin/pharmacies"
      />
    </div>
  )
}
