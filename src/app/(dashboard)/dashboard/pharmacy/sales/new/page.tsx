"use client"

import { useState, useMemo, Suspense } from "react"
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
import { ProductSearchInput } from "@/components/pharmacy/product-search-input"
import { CustomerSearchInput } from "@/components/pharmacy/customer-search-input"
import { SummaryTile } from "@/components/shared/summary-tile"
import { useProducts } from "@/hooks/use-inventory"
import { useCreateSale, usePatientPurchaseSummary } from "@/hooks/use-sales"
import { useCreateCustomer } from "@/hooks/use-customers"
import { usePrescription } from "@/hooks/use-prescriptions"
import type { CustomerSearchResult } from "@/adapters/customer.adapter"
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Trash2,
  FileText,
  User,
  UserPlus,
  Pill,
  Star,
  Store,
  DollarSign,
  Package2,
  CircleUserRound,
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

const EMPTY_SALE_ITEM: SaleItemForm = {
  productId: "",
  productName: "",
  quantity: "1",
  unitPrice: 0,
  discountPercent: "0",
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
  const createMutation = useCreateSale()
  const createCustomerMutation = useCreateCustomer()

  const prescriptionDefaultCustomer = useMemo<CustomerSearchResult | null>(() => {
    if (!prescription?.patientId) return null

    return {
      id: `patient-${prescription.patientId}`,
      type: "PATIENT",
      customerId: null,
      patientId: prescription.patientId,
      idNumber: prescription.patientIdNumber ?? null,
      firstName: prescription.patientName?.split(" ")[0] ?? "",
      lastName: prescription.patientName?.split(" ").slice(1).join(" ") ?? "",
      fullName: prescription.patientName ?? "",
      phone: null,
      email: null,
    }
  }, [prescription])
  const [selectedCustomerOverride, setSelectedCustomerOverride] = useState<
    CustomerSearchResult | null | undefined
  >(undefined)
  const selectedCustomer =
    selectedCustomerOverride === undefined
      ? prescriptionDefaultCustomer
      : selectedCustomerOverride

  const [showCreateCustomer, setShowCreateCustomer] = useState(false)
  const [newCustomerFirstName, setNewCustomerFirstName] = useState("")
  const [newCustomerLastName, setNewCustomerLastName] = useState("")
  const [newCustomerPhone, setNewCustomerPhone] = useState("")
  const [newCustomerIdNumber, setNewCustomerIdNumber] = useState("")

  // Determine the effective patientId for purchase summary
  const effectivePatientId = selectedCustomer?.patientId ?? prescription?.patientId ?? ""
  const { data: purchaseSummary } = usePatientPurchaseSummary(effectivePatientId)

  const prescriptionItems = useMemo<SaleItemForm[]>(() => {
    if (!prescription || products.length === 0) return []

    return prescription.items
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
      .filter((item) => item.unitPrice > 0)
  }, [prescription, products])
  const defaultItems = useMemo<SaleItemForm[]>(
    () => (prescriptionItems.length > 0 ? prescriptionItems : [{ ...EMPTY_SALE_ITEM }]),
    [prescriptionItems]
  )
  const [itemsOverride, setItemsOverride] = useState<SaleItemForm[] | null>(null)
  const items = itemsOverride ?? defaultItems

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH")
  const [paymentReference, setPaymentReference] = useState("")
  const defaultNotes = prescription?.prescriptionNumber
    ? `Receta ${prescription.prescriptionNumber}`
    : ""
  const [notesOverride, setNotesOverride] = useState<string | null>(null)
  const notes = notesOverride ?? defaultNotes
  const [submitAttempted, setSubmitAttempted] = useState(false)

  function updateItems(
    updater: (currentItems: SaleItemForm[]) => SaleItemForm[]
  ) {
    setItemsOverride((prev) => updater(prev ?? defaultItems))
  }

  function addItem() {
    updateItems((prev) => [
      ...prev,
      { ...EMPTY_SALE_ITEM },
    ])
  }

  function removeItem(index: number) {
    updateItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof SaleItemForm, value: string | number) {
    updateItems((prev) =>
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
  const selectedProductsCount = items.filter((item) => item.productId).length
  const customerLabel = selectedCustomer?.fullName ?? "Sin cliente seleccionado"
  const hasValidItems = items.some(
    (item) => item.productId && parseInt(item.quantity) > 0
  )
  const canManageInventorySelection = products.length > 0

  // Items from prescription that are NOT available in this pharmacy
  const unavailableItems = useMemo(() => {
    if (!prescription || products.length === 0) return []
    return prescription.items
      .filter((rxItem) => rxItem.isPending)
      .filter((rxItem) => !products.find((p) => p.id === rxItem.productId))
  }, [prescription, products])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitAttempted(true)

    const validItems = items.filter((item) => item.productId && parseInt(item.quantity) > 0)
    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto")
      return
    }

    // Resolve customer/patient IDs for the sale
    const resolvedPatientId =
      selectedCustomer?.patientId ?? prescription?.patientId ?? undefined
    const resolvedCustomerId =
      selectedCustomer?.type === "CUSTOMER" ? selectedCustomer.customerId ?? undefined : undefined

    try {
      await createMutation.mutateAsync({
        pharmacyId,
        cashSessionId: sessionId || undefined,
        prescriptionId: prescriptionId || undefined,
        patientId: resolvedPatientId || undefined,
        customerId: resolvedCustomerId || undefined,
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/pharmacy/sales" />}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Nueva venta</h1>
            <p className="text-sm text-muted-foreground">
              Registra una venta y, si aplica, emite factura al finalizar.
            </p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1.5">
          <Store className="h-3.5 w-3.5" />
          Flujo de venta
        </Badge>
      </div>

      <Card className="border-border/70">
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              icon={<CircleUserRound className="h-4 w-4 text-muted-foreground" />}
              label="Cliente"
              value={customerLabel}
              valueClassName="truncate"
            />
            <SummaryTile
              icon={<Package2 className="h-4 w-4 text-muted-foreground" />}
              label="Productos"
              value={`${selectedProductsCount} seleccionado(s)`}
            />
            <SummaryTile
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              label="Subtotal estimado"
              value={`$${subtotal.toFixed(2)}`}
            />
            <SummaryTile
              icon={<Store className="h-4 w-4 text-muted-foreground" />}
              label="Pago"
              value={
                paymentMethod === "CASH"
                  ? "Efectivo"
                  : paymentMethod === "CARD"
                    ? "Tarjeta"
                    : paymentMethod === "TRANSFER"
                      ? "Transferencia"
                      : "Mixto"
              }
            />
          </div>
        </CardContent>
      </Card>

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

      {/* Customer selector */}
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Cliente
            <span className="text-sm font-normal text-muted-foreground">(opcional)</span>
          </CardTitle>
          <CardDescription>
            Busca un cliente o paciente existente, o crea uno nuevo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 overflow-visible">
          <CustomerSearchInput
            value={selectedCustomer}
            onSelect={setSelectedCustomerOverride}
            onClear={() => setSelectedCustomerOverride(null)}
            onCreateNew={() => setShowCreateCustomer(true)}
            disabled={!!prescriptionId && !!prescription?.patientId}
          />

          {/* Purchase summary for selected customer */}
          {purchaseSummary && purchaseSummary.totalPurchases > 0 && !prescriptionId && (
            <div className="flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-1.5">
              <Star className="h-3.5 w-3.5 text-green-600 shrink-0" />
              <p className="text-xs text-green-800">
                <span className="font-semibold">Cliente frecuente:</span>{" "}
                {purchaseSummary.totalPurchases} compra(s) por{" "}
                <span className="font-semibold">{purchaseSummary.totalSpentFormatted}</span>
                {purchaseSummary.lastPurchaseAtFormatted && (
                  <> · Última: {purchaseSummary.lastPurchaseAtFormatted}</>
                )}
              </p>
            </div>
          )}

          {/* Quick create customer form */}
          {showCreateCustomer && (
            <div className="rounded-lg border border-dashed p-4 space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Nuevo cliente</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nombre *</Label>
                  <Input
                    value={newCustomerFirstName}
                    onChange={(e) => setNewCustomerFirstName(e.target.value)}
                    placeholder="Nombre"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Apellido *</Label>
                  <Input
                    value={newCustomerLastName}
                    onChange={(e) => setNewCustomerLastName(e.target.value)}
                    placeholder="Apellido"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Teléfono</Label>
                  <Input
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder="Teléfono"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Cédula / ID</Label>
                  <Input
                    value={newCustomerIdNumber}
                    onChange={(e) => setNewCustomerIdNumber(e.target.value)}
                    placeholder="Opcional"
                  />
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    setShowCreateCustomer(false)
                    setNewCustomerFirstName("")
                    setNewCustomerLastName("")
                    setNewCustomerPhone("")
                    setNewCustomerIdNumber("")
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={!newCustomerFirstName.trim() || !newCustomerLastName.trim() || createCustomerMutation.isPending}
                  onClick={async () => {
                    try {
                      const created = await createCustomerMutation.mutateAsync({
                        firstName: newCustomerFirstName.trim(),
                        lastName: newCustomerLastName.trim(),
                        phone: newCustomerPhone.trim() || undefined,
                        idNumber: newCustomerIdNumber.trim() || undefined,
                      })
                      setSelectedCustomerOverride({
                        id: `customer-${created.id}`,
                        type: "CUSTOMER",
                        customerId: created.id,
                        patientId: created.patientId,
                        idNumber: created.idNumber,
                        firstName: created.firstName,
                        lastName: created.lastName,
                        fullName: created.fullName,
                        phone: created.phone,
                        email: created.email,
                      })
                      setShowCreateCustomer(false)
                      setNewCustomerFirstName("")
                      setNewCustomerLastName("")
                      setNewCustomerPhone("")
                      setNewCustomerIdNumber("")
                      toast.success("Cliente creado")
                    } catch {
                      toast.error("Error al crear el cliente")
                    }
                  }}
                >
                  {createCustomerMutation.isPending ? "Creando..." : "Crear cliente"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Products */}
          <Card className="overflow-visible">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Productos
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                  disabled={!canManageInventorySelection}
                >
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
            <CardContent className="space-y-4 overflow-visible">
              {!canManageInventorySelection && (
                <div className="rounded-lg border border-dashed px-4 py-4 text-sm">
                  <p className="font-medium">No hay productos en inventario</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Registra productos en inventario para poder crear ventas.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    render={<Link href={`/dashboard/pharmacy/inventory?pharmacyId=${pharmacyId}`} />}
                  >
                    Ir a inventario
                  </Button>
                </div>
              )}

              {items.map((item, index) => {
                const selectedItemIds = items
                  .filter((_, i) => i !== index)
                  .map((i) => i.productId)
                  .filter(Boolean)

                return (
                  <div
                    key={index}
                    className="rounded-lg border p-3 space-y-3"
                  >
                    {/* Row 1: Product search — full width */}
                    <div className="flex items-start gap-2">
                      <div className="flex-1 space-y-1">
                        <Label className="text-xs">Producto *</Label>
                        <ProductSearchInput
                          products={products}
                          value={item.productId}
                          excludeIds={selectedItemIds}
                          onSelect={(product) => {
                            updateItem(index, "productId", product.id)
                          }}
                          onClear={() => {
                            updateItem(index, "productId", "")
                          }}
                        />
                      </div>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          className="mt-5"
                          onClick={() => removeItem(index)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>

                    {/* Row 2: Quantity, Price, Discount — shown once product is selected */}
                    {item.productId && (
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, "quantity", e.target.value)}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">P. Unitario</Label>
                          <Input
                            value={`$${item.unitPrice.toFixed(2)}`}
                            disabled
                          />
                        </div>
                        <div className="space-y-1">
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
                      </div>
                    )}

                    {/* Line total when product selected */}
                    {item.productId && (
                      <div className="flex justify-end text-sm text-muted-foreground">
                        Línea: <span className="font-semibold text-foreground ml-1">
                          ${((parseInt(item.quantity) || 0) * item.unitPrice * (1 - (parseFloat(item.discountPercent) || 0) / 100)).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Subtotal */}
              <div className="flex justify-end border-t pt-3">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Subtotal estimado</p>
                  <p className="text-xl font-bold">${subtotal.toFixed(2)}</p>
                </div>
              </div>

              {submitAttempted && !hasValidItems && (
                <p className="text-xs text-destructive">
                  Debes seleccionar al menos un producto con cantidad mayor a cero.
                </p>
              )}
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
                  <Label htmlFor="sale-payment-method">Método de pago *</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={(v) => setPaymentMethod((v as PaymentMethod) ?? "CASH")}
                    items={{ CASH: "Efectivo", CARD: "Tarjeta", TRANSFER: "Transferencia", MIXED: "Mixto" }}
                  >
                    <SelectTrigger id="sale-payment-method">
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
                    <Label htmlFor="sale-payment-reference">Referencia de pago</Label>
                    <Input
                      id="sale-payment-reference"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      placeholder="N° transacción, autorización, etc."
                    />
                    {!paymentReference.trim() && (
                      <p className="text-xs text-muted-foreground">
                        Recomendado para auditoría y conciliación.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sale-notes">Notas (opcional)</Label>
                <Textarea
                  id="sale-notes"
                  value={notes}
                  onChange={(e) => setNotesOverride(e.target.value)}
                  rows={2}
                  placeholder="Observaciones de la venta..."
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  render={<Link href="/dashboard/pharmacy/sales" />}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="w-full sm:w-auto"
                >
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
