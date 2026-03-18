"use client"

import { useMemo } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { usePharmacies } from "@/hooks/use-organizations"

interface PharmacySelectorProps {
  value: string
  onChange: (value: string) => void
}

export function PharmacySelector({ value, onChange }: PharmacySelectorProps) {
  const { data: pharmacies = [], isLoading } = usePharmacies()

  const items = useMemo(
    () => Object.fromEntries(pharmacies.map((p) => [p.id, p.name])),
    [pharmacies]
  )

  if (isLoading) {
    return <Skeleton className="h-10 w-full max-w-sm" />
  }

  return (
    <div className="max-w-sm">
      <Select value={value} onValueChange={(v) => onChange(v ?? "")} items={items}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una farmacia" />
        </SelectTrigger>
        <SelectContent>
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
