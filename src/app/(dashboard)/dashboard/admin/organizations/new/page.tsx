"use client"

import { OrganizationForm } from "@/components/admin/organization-form"
import { useCreateOrganization } from "@/hooks/use-organizations"
import type { CreateOrganizationRequest } from "@/types/organization.model"

export default function NewOrganizationPage() {
  const mutation = useCreateOrganization()

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nueva organización</h1>
        <p className="text-muted-foreground">
          Registra una nueva organización en el sistema
        </p>
      </div>

      <OrganizationForm
        mode="create"
        onSubmit={async (data) =>
          mutation.mutateAsync(data as CreateOrganizationRequest)
        }
        isPending={mutation.isPending}
      />
    </div>
  )
}
