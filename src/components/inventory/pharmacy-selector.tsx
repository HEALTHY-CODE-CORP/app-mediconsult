"use client"

import { useMemo, useEffect, useRef } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { usePharmacies } from "@/hooks/use-organizations"

const NONE_VALUE = "__none__"
const STORAGE_KEY = "mediconsult:selected-pharmacy"

interface PharmacySelectorProps {
  value: string
  onChange: (value: string) => void
}

export function PharmacySelector({ value, onChange }: PharmacySelectorProps) {
  const { data: pharmacies = [], isLoading } = usePharmacies()
  const initialized = useRef(false)

  const items = useMemo(
    () => ({
      [NONE_VALUE]: "Todas las farmacias",
      ...Object.fromEntries(pharmacies.map((p) => [p.id, p.name])),
    }),
    [pharmacies]
  )

  // Auto-select: single pharmacy OR restore from localStorage
  useEffect(() => {
    if (isLoading || pharmacies.length === 0 || initialized.current) return
    initialized.current = true

    // If only one pharmacy, auto-select it
    if (pharmacies.length === 1) {
      const onlyId = pharmacies[0].id
      onChange(onlyId)
      localStorage.setItem(STORAGE_KEY, onlyId)
      return
    }

    // Otherwise, restore previous selection if still valid
    if (!value) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && pharmacies.some((p) => p.id === stored)) {
        onChange(stored)
      }
    }
  }, [isLoading, pharmacies, value, onChange])

  // Persist selection changes to localStorage
  function handleChange(v: string | null) {
    const resolved = !v || v === NONE_VALUE ? "" : v
    onChange(resolved)
    if (resolved) {
      localStorage.setItem(STORAGE_KEY, resolved)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  if (isLoading) {
    return <Skeleton className="h-10 w-full max-w-sm" />
  }

  // If only one pharmacy, show it as static text (no need for a selector)
  if (pharmacies.length === 1) {
    return (
      <div className="max-w-sm">
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <span className="font-medium">{pharmacies[0].name}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-sm">
      <Select
        value={value || NONE_VALUE}
        onValueChange={handleChange}
        items={items}
      >
        <SelectTrigger aria-label="Seleccionar farmacia">
          <SelectValue placeholder="Selecciona una farmacia" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE} className="text-muted-foreground">
            Todas las farmacias
          </SelectItem>
          <SelectSeparator />
          {pharmacies.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
