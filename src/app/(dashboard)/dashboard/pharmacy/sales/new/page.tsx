"use client"

import { useState, useMemo, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useProducts } from "@/hooks/use-inventory"
import { useCreateSale, usePatientPurchaseSummary } from "@/hooks/use-sales"
import { usePrescription } from "@/hooks/use-prescriptions"
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Trash2,
  FileText,
  User,
  Pill,
  Star,
} from "lucide-react"
import { toast } from "sonner"
import type { PaymentMethod } from "@/types/sales.model"

interface SaleItemForm {
  productId: string
  productName: string
  quantity: string
  unitPrice: number
  discountPercent: string
}

export default function NewSalePage() {
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
      <NewSaleContent />
    </Suspense>
  )
}

function NewSaleContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pharmacyId = searchParams.get("pharmacyId") ?? ""
  const sessionId = searchParams.get("sessionId") ?? ""
  const prescriptionId = searchParams.get("prescriptionId") ?? ""

  const { data: products = [] } = useProducts(pharmacyId)
  const { data: prescription, isLoading: loadingPrescription } = usePrescription(prescriptionId)
  const { data: purchaseSummary } = usePatientPurchaseSummary(prescription?.patientId ?? "")
  const createMutation = useCreateSale()

  const productItems = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, `${p.name} — ${p.sellingPriceFormatted}`])),
    [products]
  )

  const [items, setItems] = useState<SaleItemForm[]>([
    { productId: "", productName: "", quantity: "1", unitPrice: 0, discountPercent: "0" },
  ])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [paymentReference, setPaymentReference] = useState("")
  const [notes, setNotes] = useState("")
  const [prescriptionLoaded, setPrescriptionLoaded] = useState(false)

  // Auto-populate items from prescription
  useEffect(() => {
    if (!prescription || prescriptionLoaded || products.length === 0) return

    const prescriptionItems: SaleItemForm[] = prescription.items
      .filter((rxItem) => rxItem.isPending)
      .map((rxItem) => {
        const product = products.find((p) => p.id === rxItem.productId)
        return {
          productId: rxItem.productId,
          productName: product?.name ?? rxItem.productName,
          quantity: String(rxItem.remainingQuantity),
          unitPrice: product?.sellingPrice ?? 0,
          discountPercent: "0",
        }
      })
      .filter((item) => item.unitPrice > 0) // Only include items that exist in this pharmacy

    if (prescriptionItems.length > 0) {
      setItems(prescriptionItems)
      setNotes(`Receta ${prescription.prescriptionNumber}`)
    }
    setPrescriptionLoaded(true)
  }, [prescription, products, prescriptionLoaded])

  function addItem() {
    setItems((prev) => [
      ...prev,
      { productId: "", productName: "", quantity: "1", unitPrice: 0, discountPercent: "0" },
    ])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof SaleItemForm, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        const updated = { ...item, [field]: value }
        if (field === "productId") {
          const product = products.find((p) => p.id === value)
          updated.productName = product?.name ?? ""
          updated.unitPrice = product?.sellingPrice ?? 0
        }
        return updated
      })
    )
  }

  // Calculate totals
  const subtotal = items.reduce((acc, item) => {
    const qty = parseInt(item.quantity) || 0
    const disc = parseFloat(item.discountPercent) || 0
    const lineTotal = qty * item.unitPrice * (1 - disc / 100)
    return acc + lineTotal
  }, 0)

  // Items from prescription that are NOT available in this pharmacy
  const unavailableItems = useMemo(() => {
    if (!prescription || products.length === 0) return []
    return prescription.items
      .filter((rxItem) => rxItem.isPending)
      .filter((rxItem) => !products.find((p) => p.id === rxItem.productId))
  }, [prescription, products])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const validItems = items.filter((item) => item.productId && parseInt(item.quantity) > 0)
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto")
      return
    }

    try {
      await createMutation.mutateAsync({
        pharmacyId,
        cashSessionId: sessionId || undefined,
        prescriptionId: prescriptionId || undefined,
        patientId: prescription?.patientId || undefined,
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        notes: notes.trim() || undefined,
        items: validItems.map((item) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          discountPercent: parseFloat(item.discountPercent) || 0,
        })),
      })
      toast.success("Venta registrada")
      router.push("/dashboard/pharmacy/sales")
    } catch {
      toast.error("Error al registrar la venta")
    }
  }

  if (!pharmacyId) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Farmacia no especificada</p>
        <Button
          variant="link"
          className="mt-2"
          render={<Link href="/dashboard/pharmacy/sales" />}
        >
          Volver a ventas
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
          render={<Link href="/dashboard/pharmacy/sales" />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Nueva venta</h1>
      </div>

      {/* Prescription info banner */}
      {prescriptionId && (
        loadingPrescription ? (
          <Skeleton className="h-24 w-full" />
        ) : prescription ? (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="py-4">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-blue-900">
                      Venta desde receta {prescription.prescriptionNumber}
                    </p>
                    <Badge className={prescription.statusColor}>
                      {prescription.statusLabel}
                    </Badge>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-800">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {prescription.patientName} ({prescription.patientIdNumber})
                    </span>
                    <span>Dr. {prescription.doctorName}</span>
                    <span>{prescription.prescribedAtFormatted}</span>
                  </div>

                  {/* Prescription items summary */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {prescription.items.filter(i => i.isPending).map((rxItem) => {
                      const inPharmacy = products.some((p) => p.id === rxItem.productId)
                      return (
                        <Badge
                          key={rxItem.id}
                          variant="outline"
                          className={
                            inPharmacy
                              ? "bg-white border-blue-200 text-blue-700"
                              : "bg-white border-amber-200 text-amber-700"
                          }
                        >
                          <Pill className="mr-1 h-3 w-3" />
                          {rxItem.productName} x{rxItem.remainingQuantity}
                          {!inPharmacy && " (sin stock)"}
                        </Badge>
                      )
                    })}
                  </div>

                  {unavailableItems.length > 0 && (
                    <p className="mt-2 text-xs text-amber-700">
                      {unavailableItems.length} producto(s) no disponibles en esta farmacia.
                      Solo se agregarán los que estén en inventario.
                    </p>
                  )}

                  {/* Patient purchase history */}
                  {purchaseSummary && purchaseSummary.totalPurchases > 0 && (
                    <div className="mt-2 flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-1.5">
                      <Star className="h-3.5 w-3.5 text-green-600 shrink-0" />
                      <p className="text-xs text-green-800">
                        <span className="font-semibold">Cliente frecuente:</span>{" "}
                        {purchaseSummary.totalPurchases} compra(s) anteriores por{" "}
                        <span className="font-semibold">{purchaseSummary.totalSpentFormatted}</span>
                        {purchaseSummary.lastPurchaseAtFormatted && (
                          <> · Última: {purchaseSummary.lastPurchaseAtFormatted}</>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : null
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Products */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Productos
                </CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-1 h-3 w-3" />
                  Agregar
                </Button>
              </div>
              {prescriptionId && prescription && (
                <CardDescription>
                  Productos pre-cargados desde la receta. Puedes ajustar cantidades o agregar más.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border p-3 sm:grid-cols-12 items-end"
                >
                  <div className="sm:col-span-5 space-y-1">
                    <Label className="text-xs">Producto *</Label>
                    <Select
                      value={item.productId}
                      onValueChange={(v) => updateItem(index, "productId", v ?? "")}
                      items={productItems}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — {p.sellingPriceFormatted} (Stock: {p.currentStock})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs">Cantidad</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs">P. Unitario</Label>
                    <Input
                      value={`$${item.unitPrice.toFixed(2)}`}
                      disabled
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="text-xs">Desc. %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={item.discountPercent}
                      onChange={(e) => updateItem(index, "discountPercent", e.target.value)}
                    />
                  </div>
                  <div className="sm:col-span-1">
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {/* Subtotal */}
              <div className="flex justify-end border-t pt-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Subtotal estimado</p>
                  <p className="text-xl font-bold">${subtotal.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment */}
          <Card>
            <CardHeader>
              <CardTitle>Pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Método de pago *</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod((v as PaymentMethod) ?? "CASH")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Efectivo</SelectItem>
                      <SelectItem value="CARD">Tarjeta</SelectItem>
                      <SelectItem value="TRANSFER">Transferencia</SelectItem>
                      <SelectItem value="MIXED">Mixto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {paymentMethod !== "CASH" && (
                  <div className="space-y-2">
                    <Label>Referencia de pago</Label>
                    <Input
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="N° transacción, autorización, etc."
                    />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Notas (opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Observaciones de la venta..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  render={<Link href="/dashboard/pharmacy/sales" />}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  {createMutation.isPending ? "Registrando..." : "Registrar venta"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
