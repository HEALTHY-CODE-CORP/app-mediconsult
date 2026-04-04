"use client"

import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EmailRecipientDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  email: string
  onEmailChange: (value: string) => void
  onConfirm: () => Promise<void> | void
  isSubmitting?: boolean
  confirmLabel?: string
}

export function EmailRecipientDialog({
  open,
  onOpenChange,
  title,
  description,
  email,
  onEmailChange,
  onConfirm,
  isSubmitting = false,
  confirmLabel = "Enviar",
}: EmailRecipientDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="email-recipient-input">Correo destino</Label>
          <Input
            id="email-recipient-input"
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            placeholder="correo@ejemplo.com"
            autoComplete="email"
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
            <Mail className="mr-1 h-4 w-4" />
            {isSubmitting ? "Enviando..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
