"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { EntityTable } from "@/components/admin/entity-table"
import { usePharmacies } from "@/hooks/use-organizations"
import { Plus } from "lucide-react"

export default function PharmaciesPage() {
  const { data: pharmacies = [], isLoading } = usePharmacies()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Farmacias</h1>
          <p className="text-muted-foreground">
            Gestión de farmacias de la organización
          </p>
        </div>
        <Button render={<Link href="/dashboard/admin/pharmacies/new" />}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva farmacia
        </Button>
      </div>

      <EntityTable
        entities={pharmacies}
        isLoading={isLoading}
        basePath="/dashboard/admin/pharmacies"
        entityType="pharmacy"
      />
    </div>
  )
}
