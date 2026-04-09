"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useConsultationPrescriptions, useCreatePrescription } from "@/hooks/use-prescriptions"
import { usePharmacies } from "@/hooks/use-organizations"
import { useSearchProducts } from "@/hooks/use-inventory"
import { Pill, Plus, Trash2, Eye, Package, Search, X } from "lucide-react"
import { toast } from "sonner"
import type { CreatePrescriptionRequest } from "@/types/prescription.model"
import type { Product } from "@/adapters/inventory.adapter"

interface PrescriptionCardProps {
  consultationId: string
  canAdd?: boolean
}

interface PrescriptionItemForm {
  productId: string
  productName: string
  quantity: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

const EMPTY_ITEM: PrescriptionItemForm = {
  productId: "",
  productName: "",
  quantity: "1",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
}

export function PrescriptionCard({
  consultationId,
  canAdd = true,
}: PrescriptionCardProps) {
  const { data: prescriptions = [], isLoading } =
    useConsultationPrescriptions(consultationId)
  const createMutation = useCreatePrescription()
  const { data: pharmacies = [] } = usePharmacies()

  const [showForm, setShowForm] = useState(false)
  const [selectedPharmacyId, setSelectedPharmacyId] = useState("")
  const [notes, setNotes] = useState("")
  const [items, setItems] = useState<PrescriptionItemForm[]>([{ ...EMPTY_ITEM }])

  const pharmacyItems = useMemo(
    () => Object.fromEntries(pharmacies.map((p) => [p.id, p.name])),
    [pharmacies]
  )

  function addItem() {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }])
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof PrescriptionItemForm, value: string) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        return { ...item, [field]: value }
      })
    )
  }

  function updateItemProduct(index: number, product: Product | null) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item
        if (!product) {
          return { ...item, productId: "", productName: "" }
        }
        return { ...item, productId: product.id, productName: product.name }
      })
    )
  }

  function resetForm() {
    setShowForm(false)
    setSelectedPharmacyId("")
    setNotes("")
    setItems([{ ...EMPTY_ITEM }])
  }

  async function handleCreate() {
    // Validate
    const validItems = items.filter(
      (item) =>
        item.productId &&
        parseInt(item.quantity) > 0 &&
        item.dosage.trim() &&
        item.frequency.trim() &&
        item.duration.trim()
    )

    if (validItems.length === 0) {
      toast.error("Agrega al menos un producto con todos los campos requeridos")
      return
    }

    const request: CreatePrescriptionRequest = {
      consultationId,
      pharmacyId: selectedPharmacyId || undefined,
      notes: notes.trim() || undefined,
      items: validItems.map((item) => ({
        productId: item.productId,
        quantity: parseInt(item.quantity),
        dosage: item.dosage.trim(),
        frequency: item.frequency.trim(),
        duration: item.duration.trim(),
        instructions: item.instructions.trim() || undefined,
      })),
    }

    try {
      await createMutation.mutateAsync(request)
      toast.success("Receta creada exitosamente")
      resetForm()
    } catch {
      toast.error("Error al crear la receta")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              Recetas
            </CardTitle>
            <CardDescription>
              Recetas mÃ©dicas asociadas a esta consulta
            </CardDescription>
          </div>
          {canAdd && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Nueva receta
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create form */}
        {showForm && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
            <h4 className="text-sm font-semibold">Nueva receta</h4>

            {/* Pharmacy selector (optional) */}
            <div className="space-y-2">
              <Label htmlFor="prescription-pharmacy">Farmacia (opcional)</Label>
              <Select
                value={selectedPharmacyId}
                onValueChange={(v) => {
                  const nextPharmacyId = v ?? ""
                  setSelectedPharmacyId((prevPharmacyId) => {
                    if (prevPharmacyId !== nextPharmacyId) {
                      setItems((prevItems) =>
                        prevItems.map((item) => ({
                          ...item,
                          productId: "",
                          productName: "",
                        }))
                      )
                    }
                    return nextPharmacyId
                  })
                }}
                items={pharmacyItems}
              >
                <SelectTrigger
                  id="prescription-pharmacy"
                  aria-label="Farmacia destino de la receta"
                >
                  <SelectValue placeholder="Seleccionar farmacia destino" />
                </SelectTrigger>
                <SelectContent>
                  {pharmacies.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {selectedPharmacyId
                  ? "Los productos se cargarÃ¡n del inventario de esta farmacia"
                  : "Puedes asignar la farmacia mÃ¡s tarde"}
              </p>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Productos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addItem}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Agregar producto
                </Button>
              </div>

              {items.map((item, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-md border bg-background p-3"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-medium text-muted-foreground">
                      Producto {index + 1}
                    </span>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    )}
                  </div>

                  {/* Product selector */}
                  {selectedPharmacyId ? (
                    <div className="space-y-1">
                      <Label
                        className="text-xs"
                        htmlFor={`prescription-product-${index}`}
                      >
                        Producto *
                      </Label>
                      <PrescriptionProductSearch
                        inputId={`prescription-product-${index}`}
                        pharmacyId={selectedPharmacyId}
                        selectedProductId={item.productId}
                        selectedProductName={item.productName}
                        onSelect={(product) => updateItemProduct(index, product)}
                        onClear={() => updateItemProduct(index, null)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <Label className="text-xs">ID Producto *</Label>
                      <Input
                        placeholder="ID del producto"
                        value={item.productId}
                        onChange={(e) =>
                          updateItem(index, "productId", e.target.value)
                        }
                      />
                      {!selectedPharmacyId && (
                        <p className="text-xs text-muted-foreground">
                          Selecciona una farmacia para ver los productos disponibles
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quantity + Dosage row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Cantidad *</Label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(index, "quantity", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Dosis *</Label>
                      <Input
                        placeholder="Ej: 1 tableta"
                        value={item.dosage}
                        onChange={(e) =>
                          updateItem(index, "dosage", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Frequency + Duration row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Frecuencia *</Label>
                      <Input
                        placeholder="Ej: Cada 8 horas"
                        value={item.frequency}
                        onChange={(e) =>
                          updateItem(index, "frequency", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Duración *</Label>
                      <Input
                        placeholder="Ej: 7 días"
                        value={item.duration}
                        onChange={(e) =>
                          updateItem(index, "duration", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Instructions (optional) */}
                  <div className="space-y-1">
                    <Label className="text-xs">Instrucciones (opcional)</Label>
                    <Input
                      placeholder="Ej: Tomar con alimentos"
                      value={item.instructions}
                      onChange={(e) =>
                        updateItem(index, "instructions", e.target.value)
                      }
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notas (opcional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observaciones generales de la receta..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                <Pill className="mr-1 h-4 w-4" />
                {createMutation.isPending ? "Creando..." : "Crear receta"}
              </Button>
            </div>
          </div>
        )}

        {/* Existing prescriptions list */}
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : prescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay recetas para esta consulta
          </p>
        ) : (
          <div className="space-y-3">
            {prescriptions.map((rx) => (
              <div
                key={rx.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium font-mono">
                      {rx.prescriptionNumber}
                    </span>
                    <Badge className={rx.statusColor}>{rx.statusLabel}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {rx.totalItems} productos
                    </span>
                    {rx.pharmacyName && (
                      <span>Farmacia: {rx.pharmacyName}</span>
                    )}
                    <span>{rx.prescribedAtFormatted}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  render={
                    <Link href={`/dashboard/prescriptions/${rx.id}`} />
                  }
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface PrescriptionProductSearchProps {
  inputId: string
  pharmacyId: string
  selectedProductId: string
  selectedProductName: string
  onSelect: (product: Product) => void
  onClear: () => void
}

function PrescriptionProductSearch({
  inputId,
  pharmacyId,
  selectedProductId,
  selectedProductName,
  onSelect,
  onClear,
}: PrescriptionProductSearchProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const normalizedQuery = query.trim()
  const canSearch = normalizedQuery.length >= 2
  const { data, isFetching } = useSearchProducts(
    pharmacyId,
    normalizedQuery,
    0,
    10
  )
  const results = data?.items ?? []

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (selectedProductId && selectedProductName && !isOpen) {
    return (
      <div className="flex min-h-[36px] items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5 text-sm">
        <Package className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate font-medium">{selectedProductName}</span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsOpen(true)
            setTimeout(() => inputRef.current?.focus(), 0)
          }}
        >
          Cambiar
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="ghost"
          onClick={onClear}
          aria-label="Quitar producto seleccionado"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={inputId}
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Buscar por nombre o código de barras..."
          className="pl-8"
          autoComplete="off"
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md">
          {!canSearch ? (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              Escribe al menos 2 caracteres para buscar
            </div>
          ) : isFetching ? (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              Buscando productos...
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              No se encontraron productos
            </div>
          ) : (
            results.map((product) => (
              <button
                key={product.id}
                type="button"
                onClick={() => {
                  onSelect(product)
                  setQuery("")
                  setIsOpen(false)
                }}
                className="flex w-full items-center justify-between gap-2 border-b border-border px-3 py-2 text-left text-sm transition-colors last:border-b-0 hover:bg-muted/40"
              >
                <span className="truncate">
                  {product.name}
                  {product.concentration ? ` (${product.concentration})` : ""}
                  {product.barcode ? ` · ${product.barcode}` : ""}
                </span>
                <Badge
                  variant="outline"
                  className={
                    product.currentStock === 0
                      ? "border-red-200 bg-red-50 text-red-600"
                      : product.isLowStock
                        ? "border-amber-200 bg-amber-50 text-amber-600"
                        : "border-green-200 bg-green-50 text-green-600"
                  }
                >
                  {product.currentStock === 0 ? "Sin stock" : `Stock: ${product.currentStock}`}
                </Badge>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}

