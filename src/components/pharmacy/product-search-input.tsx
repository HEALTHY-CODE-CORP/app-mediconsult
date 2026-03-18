"use client"

import { useState, useRef, useEffect, useMemo, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Package, Pill, X } from "lucide-react"
import type { Product } from "@/adapters/inventory.adapter"

interface ProductSearchInputProps {
  products: Product[]
  value: string // productId
  onSelect: (product: Product) => void
  onClear: () => void
  placeholder?: string
  disabled?: boolean
  /** IDs to exclude from results (already added) */
  excludeIds?: string[]
}

export function ProductSearchInput({
  products,
  value,
  onSelect,
  onClear,
  placeholder = "Buscar por nombre, ingrediente activo, código...",
  disabled = false,
  excludeIds = [],
}: ProductSearchInputProps) {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === value),
    [products, value]
  )

  const results = useMemo(() => {
    if (!query || query.length < 1) return []
    const q = query.toLowerCase().trim()
    return products
      .filter((p) => !excludeIds.includes(p.id))
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.activeIngredient?.toLowerCase().includes(q) ||
          p.genericName?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.concentration?.toLowerCase().includes(q) ||
          p.displayName.toLowerCase().includes(q)
      )
      .slice(0, 12)
  }, [query, products, excludeIds])

  // Reset highlight when results change
  useEffect(() => {
    setHighlightIndex(0)
  }, [results])

  // Scroll highlighted item into view
  useEffect(() => {
    if (!listRef.current) return
    const items = listRef.current.querySelectorAll("[data-result-item]")
    items[highlightIndex]?.scrollIntoView({ block: "nearest" })
  }, [highlightIndex])

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
    (product: Product) => {
      onSelect(product)
      setQuery("")
      setIsOpen(false)
    },
    [onSelect]
  )

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || results.length === 0) {
      if (e.key === "ArrowDown" && query.length >= 1) {
        setIsOpen(true)
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setHighlightIndex((prev) => (prev + 1) % results.length)
        break
      case "ArrowUp":
        e.preventDefault()
        setHighlightIndex((prev) => (prev - 1 + results.length) % results.length)
        break
      case "Enter":
        e.preventDefault()
        if (results[highlightIndex]) {
          handleSelect(results[highlightIndex])
        }
        break
      case "Escape":
        setIsOpen(false)
        break
    }
  }

  // If a product is selected, show the selected state
  if (selectedProduct && !isOpen) {
    return (
      <div
        className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-1.5 text-sm min-h-[36px]"
      >
        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="font-medium truncate block">{selectedProduct.name}</span>
          {selectedProduct.activeIngredient && (
            <span className="text-xs text-muted-foreground truncate block">
              {selectedProduct.activeIngredient}
              {selectedProduct.concentration && ` · ${selectedProduct.concentration}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge variant="outline" className="text-xs px-1.5 py-0">
            Stock: {selectedProduct.currentStock}
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
            setIsOpen(e.target.value.length >= 1)
          }}
          onFocus={() => {
            if (query.length >= 1) setIsOpen(true)
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
          className="absolute z-50 mt-1 w-full rounded-md border bg-white shadow-lg max-h-72 overflow-y-auto"
        >
          {results.length === 0 && query.length >= 1 && (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              <Package className="mx-auto mb-2 h-5 w-5 opacity-40" />
              {query.length < 2
                ? "Escribe al menos 2 caracteres..."
                : "No se encontraron productos"}
            </div>
          )}

          {results.map((product, index) => (
            <button
              key={product.id}
              type="button"
              data-result-item
              onClick={() => handleSelect(product)}
              onMouseEnter={() => setHighlightIndex(index)}
              className={`w-full text-left px-3 py-2 flex items-start gap-2.5 border-b last:border-b-0 transition-colors ${
                index === highlightIndex ? "bg-muted/70" : "hover:bg-muted/40"
              }`}
            >
              <Package className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">
                    {highlightMatch(product.name, query)}
                  </span>
                  {product.requiresPrescription && (
                    <Badge variant="outline" className="text-[10px] px-1 py-0 shrink-0 border-blue-200 text-blue-700">
                      Rx
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  {product.activeIngredient && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                      <Pill className="h-2.5 w-2.5" />
                      {highlightMatch(product.activeIngredient, query)}
                      {product.concentration && (
                        <span className="ml-0.5">{product.concentration}</span>
                      )}
                    </span>
                  )}
                  {product.presentation && (
                    <span className="text-xs text-muted-foreground">
                      {product.activeIngredient && " · "}
                      {product.presentation}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                <span className="text-sm font-semibold">
                  {product.sellingPriceFormatted}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] px-1.5 py-0 ${
                    product.currentStock === 0
                      ? "border-red-200 text-red-600 bg-red-50"
                      : product.isLowStock
                        ? "border-amber-200 text-amber-600 bg-amber-50"
                        : "border-green-200 text-green-600 bg-green-50"
                  }`}
                >
                  {product.currentStock === 0
                    ? "Sin stock"
                    : `Stock: ${product.currentStock}`}
                </Badge>
              </div>
            </button>
          ))}
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
      <mark className="bg-yellow-100 text-inherit rounded-sm px-0">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  )
}
