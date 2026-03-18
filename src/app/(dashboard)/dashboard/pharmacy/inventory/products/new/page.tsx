"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductForm } from "@/components/inventory/product-form"
import { ArrowLeft } from "lucide-react"

export default function NewProductPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      }
    >
      <NewProductContent />
    </Suspense>
  )
}

function NewProductContent() {
  const searchParams = useSearchParams()
  const pharmacyId = searchParams.get("pharmacyId") ?? ""

  if (!pharmacyId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Farmacia no especificada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/pharmacy/inventory" />}
        >
          Volver al inventario
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
          render={
            <Link
              href={`/dashboard/pharmacy/inventory?pharmacyId=${pharmacyId}`}
            />
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Nuevo producto</h1>
      </div>

      <ProductForm pharmacyId={pharmacyId} />
    </div>
  )
}
