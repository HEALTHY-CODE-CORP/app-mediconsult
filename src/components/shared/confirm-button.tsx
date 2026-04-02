"use client"

import { useState } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type ButtonVariant = React.ComponentProps<typeof Button>["variant"]
type ButtonSize = React.ComponentProps<typeof Button>["size"]

interface ConfirmButtonProps {
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  loadingLabel?: string
  confirmVariant?: ButtonVariant
  onConfirm: () => Promise<void> | void
  children: React.ReactNode
  className?: string
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  titleAttribute?: string
}

export function ConfirmButton({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  loadingLabel,
  confirmVariant = "destructive",
  onConfirm,
  children,
  className,
  variant = "outline",
  size = "sm",
  disabled = false,
  titleAttribute,
}: ConfirmButtonProps) {
  const [open, setOpen] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)

  async function handleConfirm() {
    try {
      setIsConfirming(true)
      await onConfirm()
      setOpen(false)
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!isConfirming) {
          setOpen(nextOpen)
        }
      }}
    >
      <AlertDialogTrigger
        render={
          <Button
            type="button"
            variant={variant}
            size={size}
            className={className}
            disabled={disabled || isConfirming}
            title={titleAttribute}
          />
        }
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent
        showCloseButton={false}
        className="sm:max-w-md"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            onClick={handleConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? (loadingLabel ?? confirmLabel) : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
