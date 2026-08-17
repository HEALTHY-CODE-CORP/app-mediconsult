"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUpdateInvoiceBuyerAddress } from "@/hooks/use-billing"
import { Check, Pencil, X } from "lucide-react"
import { toast } from "sonner"
import type { ApiError } from "@/types/api"

interface InvoiceBuyerAddressProps {
  invoiceId: string
  value?: string | null
  canEdit: boolean
}

export function InvoiceBuyerAddress({
  invoiceId,
  value,
  canEdit,
}: InvoiceBuyerAddressProps) {
  const mutation = useUpdateInvoiceBuyerAddress(invoiceId)
  const [isEditing, setIsEditing] = useState(false)
  const [address, setAddress] = useState(value ?? "")

  async function handleSave() {
    const normalizedAddress = address.trim()
    if (!normalizedAddress) {
      toast.error("La dirección del comprador es obligatoria")
      return
    }

    try {
      await mutation.mutateAsync({ compradorDireccion: normalizedAddress })
      setIsEditing(false)
      toast.success("Dirección actualizada. La factura está lista para reenviarse.")
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? (error as ApiError).message
          : null
      toast.error(message || "No se pudo actualizar la dirección")
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Dirección *</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Dirección del comprador"
            maxLength={300}
            autoFocus
            required
          />
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={mutation.isPending}
            >
              <Check className="mr-1 h-4 w-4" />
              {mutation.isPending ? "Guardando..." : "Guardar"}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(false)}
              disabled={mutation.isPending}
            >
              <X className="mr-1 h-4 w-4" />
              Cancelar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Dirección</p>
          <p className={`text-sm font-medium ${value?.trim() ? "" : "text-destructive"}`}>
            {value?.trim() || "Falta completar"}
          </p>
        </div>
        {canEdit && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setAddress(value ?? "")
              setIsEditing(true)
            }}
          >
            <Pencil className="mr-1 h-3.5 w-3.5" />
            Editar
          </Button>
        )}
      </div>
      {!value?.trim() && canEdit && (
        <p className="mt-1 text-xs text-destructive">
          Debes completar la dirección antes de enviar la factura al SRI.
        </p>
      )}
    </div>
  )
}
