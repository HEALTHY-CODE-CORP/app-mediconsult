"use client"

import { use, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ProductForm } from "@/components/inventory/product-form"
import { useProduct } from "@/hooks/use-inventory"
import { ArrowLeft } from "lucide-react"

interface EditProductPageProps {
  params: Promise<{ productId: string }>
}

export default function EditProductPage({ params }: EditProductPageProps) {
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
      <EditProductContent params={params} />
    </Suspense>
  )
}

function EditProductContent({ params }: EditProductPageProps) {
  const { productId } = use(params)
  const searchParams = useSearchParams()
  const pharmacyId = searchParams.get("pharmacyId") ?? ""

  const { data: product, isLoading } = useProduct(pharmacyId, productId)

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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Producto no encontrado</p>
        <Button
          variant="link"
          className="mt-2"
          render={
            <Link
              href={`/dashboard/pharmacy/inventory?pharmacyId=${pharmacyId}`}
            />
          }
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
              href={`/dashboard/pharmacy/inventory/products/${productId}?pharmacyId=${pharmacyId}`}
            />
          }
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Editar: {product.name}</h1>
      </div>

      <ProductForm pharmacyId={pharmacyId} product={product} />
    </div>
  )
}
