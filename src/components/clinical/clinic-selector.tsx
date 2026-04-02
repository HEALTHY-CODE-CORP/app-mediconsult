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
import { useMyClinics } from "@/hooks/use-organizations"

const NONE_VALUE = "__none__"
const STORAGE_KEY = "mediconsult:selected-clinic"

interface ClinicSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function ClinicSelector({ value, onChange }: ClinicSelectorProps) {
  const { data: clinics = [], isLoading } = useMyClinics()
  const initialized = useRef(false)

  const items = useMemo(
    () => ({
      [NONE_VALUE]: "Todas las clínicas",
      ...Object.fromEntries(clinics.map((c) => [c.id, c.name])),
    }),
    [clinics]
  )

  // Auto-select: single clinic OR restore from localStorage
  useEffect(() => {
    if (isLoading || clinics.length === 0 || initialized.current) return
    initialized.current = true

    if (clinics.length === 1) {
      const onlyId = clinics[0].id
      onChange(onlyId)
      localStorage.setItem(STORAGE_KEY, onlyId)
      return
    }

    if (!value) {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored && clinics.some((c) => c.id === stored)) {
        onChange(stored)
      }
    }
  }, [isLoading, clinics, value, onChange])

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

  // If only one clinic, show it as static text
  if (clinics.length === 1) {
    return (
      <div className="max-w-sm">
        <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm">
          <span className="font-medium">{clinics[0].name}</span>
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
        <SelectTrigger aria-label="Seleccionar clínica">
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
