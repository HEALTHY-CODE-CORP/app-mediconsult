"use client"

import { use, useState, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmButton } from "@/components/shared/confirm-button"
import {
  useProduct,
  useProductLots,
  useProductMovements,
  useCreateProductLot,
  useDeleteProduct,
} from "@/hooks/use-inventory"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Package,
  Layers,
  BarChart3,
  Plus,
  AlertTriangle,
} from "lucide-react"
import { toast } from "sonner"

interface ProductDetailPageProps {
  params: Promise<{ productId: string }>
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
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
      <ProductDetailContent params={params} />
    </Suspense>
  )
}

function ProductDetailContent({ params }: ProductDetailPageProps) {
  const { productId } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const pharmacyId = searchParams.get("pharmacyId") ?? ""

  const { data: product, isLoading } = useProduct(pharmacyId, productId)
  const { data: lots = [], isLoading: lotsLoading } = useProductLots(
    pharmacyId,
    productId
  )
  const { data: movements = [], isLoading: movementsLoading } =
    useProductMovements(pharmacyId, productId)
  const deleteMutation = useDeleteProduct(pharmacyId)
  const createLotMutation = useCreateProductLot(pharmacyId, productId)

  // Add lot form
  const [showLotForm, setShowLotForm] = useState(false)
  const [lotForm, setLotForm] = useState({
    lotNumber: "",
    quantity: "",
    expirationDate: "",
    purchasePrice: "",
  })

  async function handleDelete() {
    try {
      await deleteMutation.mutateAsync(productId)
      toast.success("Producto eliminado")
      router.push(`/dashboard/pharmacy/inventory?pharmacyId=${pharmacyId}`)
    } catch {
      toast.error("Error al eliminar el producto")
    }
  }

  async function handleAddLot(e: React.FormEvent) {
    e.preventDefault()
    if (!lotForm.lotNumber.trim() || !lotForm.quantity || !lotForm.expirationDate) {
      toast.error("Completa los campos obligatorios del lote")
      return
    }
    try {
      await createLotMutation.mutateAsync({
        lotNumber: lotForm.lotNumber.trim(),
        quantity: parseInt(lotForm.quantity),
        expirationDate: lotForm.expirationDate,
        purchasePrice: lotForm.purchasePrice
          ? parseFloat(lotForm.purchasePrice)
          : undefined,
      })
      toast.success("Lote agregado")
      setLotForm({ lotNumber: "", quantity: "", expirationDate: "", purchasePrice: "" })
      setShowLotForm(false)
    } catch {
      toast.error("Error al agregar lote")
    }
  }

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
          <Skeleton className="h-7 w-64" />
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
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
      {/* Header */}
      <div className="flex items-start justify-between">
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
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{product.name}</h1>
              {product.isLowStock && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="mr-1 h-3 w-3" />
                  Stock bajo
                </Badge>
              )}
              {product.requiresPrescription && (
                <Badge variant="outline" className="text-purple-700 border-purple-300 bg-purple-50">
                  Requiere receta
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {product.displayName}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            render={
              <Link
                href={`/dashboard/pharmacy/inventory/products/${productId}/edit?pharmacyId=${pharmacyId}`}
              />
            }
          >
            <Pencil className="mr-1 h-4 w-4" />
            Editar
          </Button>
          <ConfirmButton
            variant="destructive"
            size="sm"
            title="Eliminar producto"
            description="Esta acción eliminará el producto y no se puede deshacer."
            confirmLabel="Eliminar producto"
            loadingLabel="Eliminando..."
            onConfirm={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Eliminar
          </ConfirmButton>
        </div>
      </div>

      {/* Info cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Información del producto
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Nombre genérico" value={product.genericName} />
            <InfoRow label="Principio activo" value={product.activeIngredient} />
            <InfoRow label="Presentación" value={product.presentation} />
            <InfoRow label="Concentración" value={product.concentration} />
            <InfoRow label="Código de barras" value={product.barcode} />
            <InfoRow label="Estado" value={product.statusLabel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precios y stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <InfoRow label="Precio de venta" value={product.sellingPriceFormatted} />
            <InfoRow label="Stock actual" value={String(product.currentStock)} />
            <InfoRow label="Stock mínimo" value={String(product.minStock)} />
          </CardContent>
        </Card>
      </div>

      {/* Lots */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Lotes ({lots.length})
            </CardTitle>
            {!showLotForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLotForm(true)}
              >
                <Plus className="mr-1 h-4 w-4" />
                Agregar lote
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showLotForm && (
            <form
              onSubmit={handleAddLot}
              className="space-y-3 rounded-lg border bg-muted/30 p-4"
            >
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <Label className="text-xs">N° Lote *</Label>
                  <Input
                    value={lotForm.lotNumber}
                    onChange={(e) =>
                      setLotForm((p) => ({ ...p, lotNumber: e.target.value }))
                    }
                    placeholder="Ej: LOT-2024-001"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cantidad *</Label>
                  <Input
                    type="number"
                    min="1"
                    value={lotForm.quantity}
                    onChange={(e) =>
                      setLotForm((p) => ({ ...p, quantity: e.target.value }))
                    }
                    placeholder="0"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Fecha vencimiento *</Label>
                  <Input
                    type="date"
                    value={lotForm.expirationDate}
                    onChange={(e) =>
                      setLotForm((p) => ({
                        ...p,
                        expirationDate: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Precio compra</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={lotForm.purchasePrice}
                    onChange={(e) =>
                      setLotForm((p) => ({
                        ...p,
                        purchasePrice: e.target.value,
                      }))
                    }
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLotForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createLotMutation.isPending}
                >
                  {createLotMutation.isPending ? "Guardando..." : "Guardar lote"}
                </Button>
              </div>
            </form>
          )}

          {lotsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : lots.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay lotes registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Lote</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Precio compra</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Recibido</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-mono text-sm">
                      {lot.lotNumber}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {lot.quantity}
                    </TableCell>
                    <TableCell>{lot.expirationDateFormatted}</TableCell>
                    <TableCell>
                      {lot.purchasePriceFormatted ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge className={lot.expirationColor}>
                        {lot.expirationLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {lot.receivedAtFormatted}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Movements (Kardex) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Movimientos (Kardex)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {movementsLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : movements.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay movimientos registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">Cantidad</TableHead>
                  <TableHead>Lote</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {m.createdAtFormatted}
                    </TableCell>
                    <TableCell>
                      <Badge className={m.movementTypeColor}>
                        {m.movementTypeLabel}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {m.movementType === "OUT" ? `-${m.quantity}` : `+${m.quantity}`}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {m.lotNumber ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">
                      {m.reason ?? m.notes ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{m.userName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  )
}
