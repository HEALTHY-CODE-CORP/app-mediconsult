import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SummaryTileProps {
  icon?: ReactNode
  label: ReactNode
  value?: ReactNode
  helper?: ReactNode
  className?: string
  labelClassName?: string
  valueClassName?: string
  helperClassName?: string
}

export function SummaryTile({
  icon,
  label,
  value,
  helper,
  className,
  labelClassName,
  valueClassName,
  helperClassName,
}: SummaryTileProps) {
  return (
    <div className={cn("rounded-lg border bg-muted/20 p-3", className)}>
      <div className="flex items-center gap-2">
        {icon}
        <p className={cn("text-xs text-muted-foreground", labelClassName)}>{label}</p>
      </div>
      {value !== undefined && value !== null && (
        <p className={cn("mt-1 text-sm font-medium", valueClassName)}>{value}</p>
      )}
      {helper !== undefined && helper !== null && (
        <p className={cn("mt-1 text-xs text-muted-foreground", helperClassName)}>
          {helper}
        </p>
      )}
    </div>
  )
}
