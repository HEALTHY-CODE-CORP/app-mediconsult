"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EntityTable } from "@/components/admin/entity-table"
import { useClinics } from "@/hooks/use-organizations"
import { Plus } from "lucide-react"

export default function ClinicsPage() {
  const { data: clinics = [], isLoading } = useClinics()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Consultorios</h1>
          <p className="text-muted-foreground">
            Gestión de consultorios de la organización
          </p>
        </div>
        <Button render={<Link href="/dashboard/admin/clinics/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo consultorio
        </Button>
      </div>

      <EntityTable
        entities={clinics}
        isLoading={isLoading}
        basePath="/dashboard/admin/clinics"
        entityType="clinic"
      />
    </div>
  )
}
