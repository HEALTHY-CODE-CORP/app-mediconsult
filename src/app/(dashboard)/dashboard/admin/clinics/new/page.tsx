"use client"

import { EntityForm } from "@/components/admin/entity-form"
import { useCreateClinic } from "@/hooks/use-organizations"

export default function NewClinicPage() {
  const mutation = useCreateClinic()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuevo consultorio</h1>
        <p className="text-muted-foreground">
          Registra un nuevo consultorio en la organización
        </p>
      </div>

      <EntityForm
        entityType="clinic"
        mode="create"
        onSubmit={async (data) => mutation.mutateAsync(data)}
        isPending={mutation.isPending}
        backUrl="/dashboard/admin/clinics"
      />
    </div>
  )
}
