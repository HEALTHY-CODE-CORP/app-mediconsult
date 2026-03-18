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
import { useClinics } from "@/hooks/use-organizations"

interface ClinicSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function ClinicSelector({ value, onChange }: ClinicSelectorProps) {
  const { data: clinics = [], isLoading } = useClinics()

  const items = useMemo(
    () => Object.fromEntries(clinics.map((c) => [c.id, c.name])),
    [clinics]
  )

  if (isLoading) {
    return <Skeleton className="h-10 w-full max-w-sm" />
  }

  return (
    <div className="max-w-sm">
      <Select value={value} onValueChange={(v) => onChange(v ?? "")} items={items}>
        <SelectTrigger>
          <SelectValue placeholder="Selecciona una clínica" />
        </SelectTrigger>
        <SelectContent>
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
