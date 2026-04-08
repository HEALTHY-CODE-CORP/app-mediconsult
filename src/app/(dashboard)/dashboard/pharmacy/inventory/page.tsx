"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/ui/data-table"
import { PharmacySelector } from "@/components/inventory/pharmacy-selector"
import { useProducts, useSearchProducts } from "@/hooks/use-inventory"
import {
  Plus,
  Search,
  Eye,
  Package,
  AlertTriangle,
  BarChart3,
} from "lucide-react"

const SEARCH_PAGE_SIZE = 20

export default function InventoryPage() {
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
      <InventoryContent />
    </Suspense>
  )
}

function InventoryContent() {
  const searchParams = useSearchParams()
  const [pharmacyId, setPharmacyId] = useState(
    searchParams.get("pharmacyId") ?? ""
  )
  const [searchQuery, setSearchQuery] = useState("")
  const [searchPage, setSearchPage] = useState(0)
  const normalizedQuery = searchQuery.trim()
  const isSearching = normalizedQuery.length >= 2

  const productsQuery = useProducts(pharmacyId)
  const searchProductsQuery = useSearchProducts(
    pharmacyId,
    normalizedQuery,
    searchPage,
    SEARCH_PAGE_SIZE
  )

  function handlePharmacyChange(value: string) {
    setPharmacyId(value)
    setSearchPage(0)
  }

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setSearchPage(0)
  }

  const activeIsLoading = isSearching
    ? searchProductsQuery.isLoading
    : productsQuery.isLoading
  const products = isSearching
    ? searchProductsQuery.data?.items ?? []
    : productsQuery.data ?? []
  const searchPageData = searchProductsQuery.data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
          <p className="text-muted-foreground">
            Gestión de productos y stock farmacéutico
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            render={
              <Link
                href={`/dashboard/pharmacy/inventory/alerts?pharmacyId=${pharmacyId}`}
              />
            }
            disabled={!pharmacyId}
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alertas
          </Button>
          <Button
            variant="outline"
            render={
              <Link
                href={`/dashboard/pharmacy/inventory/movements?pharmacyId=${pharmacyId}`}
              />
            }
            disabled={!pharmacyId}
          >
            <BarChart3 className="mr-2 h-4 w-4" />
            Movimientos
          </Button>
          {pharmacyId && (
            <Button
              render={
                <Link
                  href={`/dashboard/pharmacy/inventory/products/new?pharmacyId=${pharmacyId}`}
                />
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Nuevo producto
            </Button>
          )}
        </div>
      </div>

      {/* Pharmacy selector */}
      <PharmacySelector value={pharmacyId} onChange={handlePharmacyChange} />

      {!pharmacyId ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Package className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Selecciona una farmacia para ver su inventario
          </p>
        </div>
      ) : (
        <>
          {/* Search */}
          <div className="max-w-sm space-y-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o código de barras..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            {normalizedQuery.length === 1 && (
              <p className="text-xs text-muted-foreground">
                Escribe al menos 2 caracteres para buscar
              </p>
            )}
          </div>

          {/* Products table */}
          <DataTable
            isLoading={activeIsLoading}
            isEmpty={products.length === 0}
            emptyIcon={<Package className="h-10 w-10 text-muted-foreground" />}
            emptyMessage={
              isSearching
                ? "No se encontraron productos"
                : "No hay productos registrados"
            }
            emptyAction={
              !isSearching ? (
                <Button
                  variant="link"
                  render={
                    <Link
                      href={`/dashboard/pharmacy/inventory/products/new?pharmacyId=${pharmacyId}`}
                    />
                  }
                >
                  Agregar primer producto
                </Button>
              ) : undefined
            }
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Presentación</TableHead>
                  <TableHead className="text-right">P. Venta</TableHead>
                  <TableHead className="text-center">Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{p.name}</p>
                        {p.activeIngredient && (
                          <p className="text-xs text-muted-foreground">
                            {p.activeIngredient}
                            {p.concentration ? ` ${p.concentration}` : ""}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.barcode ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {p.presentation ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {p.sellingPriceFormatted}
                    </TableCell>
                    <TableCell className="text-center">
                      <span
                        className={
                          p.isLowStock
                            ? "font-bold text-red-600"
                            : "font-medium"
                        }
                      >
                        {p.currentStock}
                      </span>
                      {p.isLowStock && (
                        <AlertTriangle className="ml-1 inline h-3 w-3 text-red-500" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {p.isActive ? (
                          <Badge variant="outline" className="text-green-700 border-green-300 bg-green-50">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-500">
                            Inactivo
                          </Badge>
                        )}
                        {p.requiresPrescription && (
                          <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                            Rx
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={
                          <Link
                            href={`/dashboard/pharmacy/inventory/products/${p.id}?pharmacyId=${pharmacyId}`}
                          />
                        }
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {isSearching && searchPageData && (
              <div className="mt-4 flex flex-col gap-2 border-t pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Mostrando {searchPageData.numberOfElements} de{" "}
                  {searchPageData.totalElements} resultados
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={searchPageData.first || searchProductsQuery.isFetching}
                    onClick={() => setSearchPage((prev) => Math.max(prev - 1, 0))}
                  >
                    Anterior
                  </Button>
                  <span className="text-xs text-muted-foreground">
                    Página {searchPageData.page + 1} de {searchPageData.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={searchPageData.last || searchProductsQuery.isFetching}
                    onClick={() => setSearchPage((prev) => prev + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </DataTable>
        </>
      )}
    </div>
  )
}
