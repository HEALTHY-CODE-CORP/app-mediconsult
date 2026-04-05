"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-inventory"
import { Package } from "lucide-react"
import { toast } from "sonner"
import type { CreateProductRequest, UpdateProductRequest } from "@/types/inventory.model"
import type { Product } from "@/adapters/inventory.adapter"

interface ProductFormProps {
  pharmacyId: string
  product?: Product
}

interface FormState {
  barcode: string
  name: string
  genericName: string
  activeIngredient: string
  presentation: string
  concentration: string
  sellingPrice: string
  minStock: string
  requiresPrescription: boolean
}

function toFormState(product?: Product): FormState {
  return {
    barcode: product?.barcode ?? "",
    name: product?.name ?? "",
    genericName: product?.genericName ?? "",
    activeIngredient: product?.activeIngredient ?? "",
    presentation: product?.presentation ?? "",
    concentration: product?.concentration ?? "",
    sellingPrice: product?.sellingPrice?.toString() ?? "",
    minStock: product?.minStock?.toString() ?? "5",
    requiresPrescription: product?.requiresPrescription ?? false,
  }
}

export function ProductForm({ pharmacyId, product }: ProductFormProps) {
  const router = useRouter()
  const isEditing = !!product
  const [form, setForm] = useState<FormState>(toFormState(product))

  const createMutation = useCreateProduct(pharmacyId)
  const updateMutation = useUpdateProduct(pharmacyId, product?.id ?? "")

  function updateField(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      toast.error("El nombre es obligatorio")
      return
    }

    const payload = {
      pharmacyId,
      barcode: form.barcode.trim() || undefined,
      name: form.name.trim(),
      genericName: form.genericName.trim() || undefined,
      activeIngredient: form.activeIngredient.trim() || undefined,
      presentation: form.presentation.trim() || undefined,
      concentration: form.concentration.trim() || undefined,
      sellingPrice: parseFloat(form.sellingPrice) || 0,
      minStock: parseInt(form.minStock) || 5,
      requiresPrescription: form.requiresPrescription,
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync(payload as UpdateProductRequest)
        toast.success("Producto actualizado")
      } else {
        await createMutation.mutateAsync(payload as CreateProductRequest)
        toast.success("Producto creado")
      }
      router.push(`/dashboard/pharmacy/inventory?pharmacyId=${pharmacyId}`)
    } catch {
      toast.error(isEditing ? "Error al actualizar" : "Error al crear producto")
    }
  }

  const isPending = createMutation.isPending || updateMutation.isPending

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic info */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Ej: Ibuprofeno"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="genericName">Nombre genérico</Label>
              <Input
                id="genericName"
                value={form.genericName}
                onChange={(e) => updateField("genericName", e.target.value)}
                placeholder="Ej: Ibuprofeno"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activeIngredient">Principio activo</Label>
              <Input
                id="activeIngredient"
                value={form.activeIngredient}
                onChange={(e) => updateField("activeIngredient", e.target.value)}
                placeholder="Ej: Ibuprofeno"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Código de barras</Label>
              <Input
                id="barcode"
                value={form.barcode}
                onChange={(e) => updateField("barcode", e.target.value)}
                placeholder="Ej: 7861234567890"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="presentation">Presentación</Label>
              <Input
                id="presentation"
                value={form.presentation}
                onChange={(e) => updateField("presentation", e.target.value)}
                placeholder="Ej: Tabletas, Jarabe, Cápsulas"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="concentration">Concentración</Label>
              <Input
                id="concentration"
                value={form.concentration}
                onChange={(e) => updateField("concentration", e.target.value)}
                placeholder="Ej: 400mg, 200mg/5ml"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sellingPrice">Precio de venta ($)</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                min="0"
                value={form.sellingPrice}
                onChange={(e) => updateField("sellingPrice", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minStock">Stock mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => updateField("minStock", e.target.value)}
                placeholder="5"
              />
            </div>
          </div>

          {/* Switch */}
          <div className="flex items-center gap-3">
            <Switch
              id="requiresPrescription"
              checked={form.requiresPrescription}
              onCheckedChange={(checked) =>
                updateField("requiresPrescription", checked)
              }
            />
            <Label htmlFor="requiresPrescription">
              Requiere receta médica
            </Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Guardando..."
                : isEditing
                  ? "Guardar cambios"
                  : "Crear producto"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
