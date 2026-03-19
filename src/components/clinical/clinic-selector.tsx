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
import { useClinics } from "@/hooks/use-organizations"

const NONE_VALUE = "__none__"

interface ClinicSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function ClinicSelector({ value, onChange }: ClinicSelectorProps) {
  const { data: clinics = [], isLoading } = useClinics()

  const items = useMemo(
    () => ({
      [NONE_VALUE]: "Todas las clínicas",
      ...Object.fromEntries(clinics.map((c) => [c.id, c.name])),
    }),
    [clinics]
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
          <SelectValue placeholder="Selecciona una clínica" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NONE_VALUE} className="text-muted-foreground">
            Todas las clínicas
          </SelectItem>
          <SelectSeparator />
          {clinics.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
