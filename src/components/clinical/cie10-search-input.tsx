"use client"

import { useState, useEffect, useRef } from "react"
import { Search, Loader2 } from "lucide-react"
import { useCie10Search } from "@/hooks/use-cie10"
import type { Cie10CodeResponse } from "@/types/clinical.model"

interface Props {
  onSelect: (code: Cie10CodeResponse) => void
  disabled?: boolean
  placeholder?: string
}

export function Cie10SearchInput({
  onSelect,
  disabled,
  placeholder = "Buscar por código o descripción...",
}: Props) {
  const [inputValue, setInputValue] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounce input → query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(inputValue)
      setSelectedIndex(-1)
    }, 300)
    return () => clearTimeout(timer)
  }, [inputValue])

  const { data: results = [], isFetching } = useCie10Search(debouncedQuery)

  // Open dropdown when we have a query
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setIsOpen(true)
    } else {
      setIsOpen(false)
    }
  }, [debouncedQuery])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  function handleSelect(code: Cie10CodeResponse) {
    onSelect(code)
    setInputValue("")
    setDebouncedQuery("")
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!isOpen) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      }
    } else if (e.key === "Escape") {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  const showSpinner = isFetching && debouncedQuery.trim().length >= 2
  const showDropdown = isOpen && debouncedQuery.trim().length >= 2

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (debouncedQuery.trim().length >= 2) setIsOpen(true)
          }}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 pl-9 pr-9"
        />
        {showSpinner && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground animate-spin" />
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-md overflow-hidden">
          {results.length === 0 && !isFetching ? (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">
              Sin resultados para &ldquo;{debouncedQuery}&rdquo;
            </div>
          ) : (
            <ul className="max-h-64 overflow-y-auto py-1">
              {results.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      handleSelect(item)
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full text-left px-4 py-2.5 flex items-start gap-3 hover:bg-accent transition-colors ${
                      index === selectedIndex ? "bg-accent" : ""
                    }`}
                  >
                    <span className="font-mono font-bold text-blue-600 text-sm shrink-0 mt-0.5">
                      {item.code}
                    </span>
                    <span className="text-sm text-foreground leading-snug">
                      {item.description}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
