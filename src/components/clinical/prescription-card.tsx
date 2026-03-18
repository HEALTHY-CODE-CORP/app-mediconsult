"use client"

import { useState, useMemo } from "react"
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
import { useProducts } from "@/hooks/use-inventory"
import { Pill, Plus, Trash2, Eye, Package } from "lucide-react"
import { toast } from "sonner"
import type { CreatePrescriptionRequest } from "@/types/prescription.model"

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

  // Products from selected pharmacy
  const { data: products = [] } = useProducts(selectedPharmacyId)

  const pharmacyItems = useMemo(
    () => Object.fromEntries(pharmacies.map((p) => [p.id, p.name])),
    [pharmacies]
  )

  const productItems = useMemo(
    () => Object.fromEntries(products.map((p) => [p.id, p.name])),
    [products]
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
        const updated = { ...item, [field]: value }
        // When selecting a product, save its name for display
        if (field === "productId") {
          const product = products.find((p) => p.id === value)
          updated.productName = product?.name ?? ""
        }
        return updated
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
              Recetas médicas asociadas a esta consulta
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
              <Label>Farmacia (opcional)</Label>
              <Select
                value={selectedPharmacyId}
                onValueChange={(v) => setSelectedPharmacyId(v ?? "")}
                items={pharmacyItems}
              >
                <SelectTrigger>
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
                  ? "Los productos se cargarán del inventario de esta farmacia"
                  : "Puedes asignar la farmacia más tarde"}
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
                  {selectedPharmacyId && products.length > 0 ? (
                    <div className="space-y-1">
                      <Label className="text-xs">Producto *</Label>
                      <Select
                        value={item.productId}
                        onValueChange={(v) => updateItem(index, "productId", v ?? "")}
                        items={productItems}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar producto" />
                        </SelectTrigger>
                        <SelectContent>
                          {products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                              {product.concentration && ` (${product.concentration})`}
                              {" — "}Stock: {product.currentStock}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
