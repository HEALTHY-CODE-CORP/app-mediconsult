"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, User, UserCheck, X, Plus } from "lucide-react"
import { useSearchCustomers } from "@/hooks/use-customers"
import type { CustomerSearchResult } from "@/adapters/customer.adapter"

interface CustomerSearchInputProps {
  value: CustomerSearchResult | null
  onSelect: (result: CustomerSearchResult) => void
  onClear: () => void
  onCreateNew?: () => void
  placeholder?: string
  disabled?: boolean
}

export function CustomerSearchInput({
  value,
  onSelect,
  onClear,
  onCreateNew,
  placeholder = "Buscar cliente por nombre, cédula, teléfono...",
  disabled = false,
}: CustomerSearchInputProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  const { data: results = [], isLoading } = useSearchCustomers(debouncedQuery)

  const canShowCreate = Boolean(onCreateNew && query.length >= 2 && !isLoading)

  // Total interactive items (results + create button when visible)
  const totalItems = results.length + (canShowCreate ? 1 : 0)
  const activeHighlightIndex = totalItems === 0 ? 0 : Math.min(highlightIndex, totalItems - 1)

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll("[data-result-item]")
    items[activeHighlightIndex]?.scrollIntoView({ block: "nearest" })
  }, [activeHighlightIndex, totalItems])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSelect = useCallback(
    (result: CustomerSearchResult) => {
      onSelect(result)
      setQuery("")
      setIsOpen(false)
    },
    [onSelect]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || totalItems === 0) {
      if (e.key === "ArrowDown" && query.length >= 2) {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightIndex((prev) => (prev + 1) % totalItems)
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightIndex((prev) => (prev - 1 + totalItems) % totalItems)
        break
      case "Enter":
        e.preventDefault()
        if (
          activeHighlightIndex < results.length &&
          results[activeHighlightIndex]
        ) {
          handleSelect(results[activeHighlightIndex])
        } else if (onCreateNew && activeHighlightIndex === results.length) {
          onCreateNew()
          setIsOpen(false)
        }
        break
      case "Escape":
        setIsOpen(false)
        break
    }
  }

  // Selected state
  if (value && !isOpen) {
    return (
      <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5 text-sm min-h-[36px]">
        {value.type === "PATIENT" ? (
          <UserCheck className="h-3.5 w-3.5 text-blue-600 shrink-0" />
        ) : (
          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <span className="font-medium truncate block">{value.fullName}</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {value.idNumber && <span>{value.idNumber}</span>}
            {value.phone && <span>{value.idNumber ? "·" : ""} {value.phone}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge
            variant="outline"
            className={`text-[10px] px-1.5 py-0 ${
              value.type === "PATIENT"
                ? "border-blue-200 text-blue-700"
                : "border-gray-200 text-gray-600"
            }`}
          >
            {value.type === "PATIENT" ? "Paciente" : "Cliente"}
          </Badge>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClear()
              setTimeout(() => inputRef.current?.focus(), 0)
            }}
            disabled={disabled}
            className="rounded-sm p-0.5 hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setHighlightIndex(0)
            setIsOpen(e.target.value.length >= 2)
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-8"
          autoComplete="off"
        />
      </div>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 mt-1 max-h-72 w-full overflow-y-auto rounded-md border border-border bg-popover text-popover-foreground shadow-md"
        >
          {isLoading && query.length >= 2 && (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Buscando...
            </div>
          )}

          {!isLoading && results.length === 0 && query.length >= 2 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              <User className="mx-auto mb-2 h-5 w-5 opacity-40" />
              No se encontraron resultados
            </div>
          )}

          {results.map((result, index) => (
            <button
              key={result.id}
              type="button"
              data-result-item
              onClick={() => handleSelect(result)}
              onMouseEnter={() => setHighlightIndex(index)}
              className={`flex w-full items-start gap-2.5 border-b border-border px-3 py-2 text-left transition-colors last:border-b-0 ${
                index === activeHighlightIndex ? "bg-muted/70" : "hover:bg-muted/40"
              }`}
            >
              {result.type === "PATIENT" ? (
                <UserCheck className="h-4 w-4 mt-0.5 text-blue-600 shrink-0" />
              ) : (
                <User className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {highlightMatch(result.fullName, query)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1 py-0 shrink-0 ${
                      result.type === "PATIENT"
                        ? "border-blue-200 text-blue-700"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {result.type === "PATIENT" ? "Paciente" : "Cliente"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  {result.idNumber && (
                    <span className="text-xs text-muted-foreground">
                      {highlightMatch(result.idNumber, query)}
                    </span>
                  )}
                  {result.phone && (
                    <span className="text-xs text-muted-foreground">
                      {result.idNumber && "·"} {highlightMatch(result.phone, query)}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}

          {canShowCreate && (
            <button
              type="button"
              data-result-item
              onClick={() => {
                onCreateNew?.()
                setIsOpen(false)
              }}
              onMouseEnter={() => setHighlightIndex(results.length)}
              className={`flex w-full items-center gap-2.5 border-t border-border px-3 py-2.5 text-left transition-colors ${
                activeHighlightIndex === results.length ? "bg-muted/70" : "hover:bg-muted/40"
              }`}
            >
              <Plus className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm text-primary font-medium">
                Crear nuevo cliente
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/** Highlight matching text portions */
function highlightMatch(text: string, query: string) {
  if (!query || query.length < 2) return text
  const idx = text.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return text

  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-100 text-inherit rounded-sm px-0">
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  )
}
