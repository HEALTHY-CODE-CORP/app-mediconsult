"use client"

import { use } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EntityForm } from "@/components/admin/entity-form"
import { useClinic, useUpdateClinic } from "@/hooks/use-organizations"
import { ArrowLeft } from "lucide-react"

interface EditClinicPageProps {
  params: Promise<{ id: string }>
}

export default function EditClinicPage({ params }: EditClinicPageProps) {
  const { id } = use(params)
  const { data: clinic, isLoading } = useClinic(id)
  const mutation = useUpdateClinic(id)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!clinic) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Clínica no encontrada</p>
        <Button variant="link" className="mt-2" render={<Link href="/dashboard/admin/clinics" />}>
          Volver a clínicas
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full px-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon-sm" render={<Link href={`/dashboard/admin/clinics/${id}`} />}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Editar clínica</h1>
          <p className="text-muted-foreground">{clinic.name}</p>
        </div>
      </div>

      <EntityForm
        entity={clinic}
        entityType="clinic"
        mode="edit"
        onSubmit={async (data) => mutation.mutateAsync(data)}
        isPending={mutation.isPending}
        backUrl="/dashboard/admin/clinics"
      />
    </div>
  )
}
