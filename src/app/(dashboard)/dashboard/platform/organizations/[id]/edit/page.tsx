"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { OrganizationForm } from "@/components/admin/organization-form"
import { useOrganization, useUpdateOrganization } from "@/hooks/use-organizations"
import type { UpdateOrganizationRequest } from "@/types/organization.model"
import { ArrowLeft } from "lucide-react"

interface EditOrganizationPageProps {
  params: Promise<{ id: string }>
}

export default function EditOrganizationPage({
  params,
}: EditOrganizationPageProps) {
  const { id } = use(params)
  const { data: org, isLoading } = useOrganization(id)
  const mutation = useUpdateOrganization(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Organización no encontrada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/platform/organizations" />}
        >
          Volver a organizaciones
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href={`/dashboard/platform/organizations/${id}`} />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Editar organización
          </h1>
          <p className="text-muted-foreground">{org.name}</p>
        </div>
      </div>

      <OrganizationForm
        organization={org}
        mode="edit"
        onSubmit={async (data) =>
          mutation.mutateAsync(data as UpdateOrganizationRequest)
        }
        isPending={mutation.isPending}
      />
    </div>
  )
}
