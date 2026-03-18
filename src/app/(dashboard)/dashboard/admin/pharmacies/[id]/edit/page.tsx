"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EntityForm } from "@/components/admin/entity-form"
import { usePharmacy, useUpdatePharmacy } from "@/hooks/use-organizations"
import { ArrowLeft } from "lucide-react"

interface EditPharmacyPageProps {
  params: Promise<{ id: string }>
}

export default function EditPharmacyPage({ params }: EditPharmacyPageProps) {
  const { id } = use(params)
  const { data: pharmacy, isLoading } = usePharmacy(id)
  const mutation = useUpdatePharmacy(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!pharmacy) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Farmacia no encontrada</p>
        <Button variant="link" className="mt-2" render={<Link href="/dashboard/admin/pharmacies" />}>
          Volver a farmacias
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/dashboard/admin/pharmacies/${id}`} />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar farmacia</h1>
          <p className="text-muted-foreground">{pharmacy.name}</p>
        </div>
      </div>

      <EntityForm
        entity={pharmacy}
        entityType="pharmacy"
        mode="edit"
        onSubmit={async (data) => mutation.mutateAsync(data)}
        isPending={mutation.isPending}
        backUrl="/dashboard/admin/pharmacies"
      />
    </div>
  )
}
