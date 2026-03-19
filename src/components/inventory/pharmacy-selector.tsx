"use client"

import { useMemo } from "react"
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

interface PharmacySelectorProps {
  value: string
  onChange: (value: string) => void
}

export function PharmacySelector({ value, onChange }: PharmacySelectorProps) {
  const { data: pharmacies = [], isLoading } = usePharmacies()

  const items = useMemo(
    () => ({
      [NONE_VALUE]: "Todas las farmacias",
      ...Object.fromEntries(pharmacies.map((p) => [p.id, p.name])),
    }),
    [pharmacies]
  )

  if (isLoading) {
    return <Skeleton className="h-10 w-full max-w-sm" />
  }

  return (
    <div className="max-w-sm">
      <Select
        value={value || NONE_VALUE}
        onValueChange={(v) => onChange(v === NONE_VALUE ? "" : v ?? "")}
        items={items}
      >
        <SelectTrigger>
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
