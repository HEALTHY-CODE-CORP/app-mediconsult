"use client"

import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface DataTableProps {
  children: React.ReactNode
  isLoading?: boolean
  isEmpty?: boolean
  loadingRows?: number
  emptyIcon?: React.ReactNode
  emptyMessage?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
}

/**
 * Unified table wrapper that handles loading, empty, and data states.
 * Wraps Table content in a consistent `rounded-md border` container.
 */
function DataTable({
  children,
  isLoading = false,
  isEmpty = false,
  loadingRows = 5,
  emptyIcon,
  emptyMessage,
  emptyDescription,
  emptyAction,
}: DataTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: loadingRows }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        {emptyIcon && <div className="mb-3">{emptyIcon}</div>}
        {emptyMessage && (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        )}
        {emptyDescription && (
          <p className="text-xs text-muted-foreground mt-1">
            {emptyDescription}
          </p>
        )}
        {emptyAction && <div className="mt-2">{emptyAction}</div>}
      </div>
    )
  }

  return <div className="rounded-md border">{children}</div>
}

export { DataTable }
export type { DataTableProps }
