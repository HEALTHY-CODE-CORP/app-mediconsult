"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { DataTable } from "@/components/ui/data-table"
import {
  useAllPlatformFees,
  usePlatformFeesByStatus,
  usePlatformFeesByDateRange,
  usePlatformFeeSummary,
  useCollectFee,
  useWaiveFee,
} from "@/hooks/use-platform-fees"
import {
  DollarSign,
  Search,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  Ban,
} from "lucide-react"
import type { FeeStatus } from "@/types/platform-fee.model"
import { FEE_STATUS_LABELS } from "@/adapters/platform-fee.adapter"
import { toast } from "sonner"

type FilterMode = "all" | "status" | "dateRange"

export default function PlatformFeesPage() {
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [statusFilter, setStatusFilter] = useState<FeeStatus | "">("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [search, setSearch] = useState("")

  const { data: summary, isLoading: loadingSummary } = usePlatformFeeSummary()

  const allQuery = useAllPlatformFees()
  const statusQuery = usePlatformFeesByStatus(
    filterMode === "status" ? statusFilter : ""
  )
  const dateQuery = usePlatformFeesByDateRange(
    filterMode === "dateRange" ? startDate : "",
    filterMode === "dateRange" ? endDate : ""
  )

  const collectMutation = useCollectFee()
  const waiveMutation = useWaiveFee()

  const isLoading = allQuery.isLoading || statusQuery.isLoading || dateQuery.isLoading

  const fees =
    filterMode === "status"
      ? statusQuery.data ?? []
      : filterMode === "dateRange"
        ? dateQuery.data ?? []
        : allQuery.data ?? []

  const filtered = search
    ? fees.filter(
        (f) =>
          f.organizationName.toLowerCase().includes(search.toLowerCase()) ||
          f.invoiceNumber.toLowerCase().includes(search.toLowerCase())
      )
    : fees

  async function handleCollect(feeId: string) {
    try {
      await collectMutation.mutateAsync(feeId)
      toast.success("Tarifa marcada como cobrada")
    } catch {
      toast.error("Error al cobrar tarifa")
    }
  }

  async function handleWaive(feeId: string) {
    if (!confirm("¿Deseas exonerar esta tarifa?")) return
    try {
      await waiveMutation.mutateAsync({ feeId })
      toast.success("Tarifa exonerada")
    } catch {
      toast.error("Error al exonerar tarifa")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Tarifas de Plataforma
        </h1>
        <p className="text-muted-foreground">
          Gestión de tarifas por consulta cobradas a las organizaciones
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loadingSummary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : summary ? (
          <>
            <SummaryCard
              icon={<DollarSign className="h-5 w-5" />}
              label="Total generado"
              value={`$${summary.totalFees.toFixed(2)}`}
              subtitle={`${summary.feeCount} tarifas`}
            />
            <SummaryCard
              icon={<Clock className="h-5 w-5 text-yellow-600" />}
              label="Pendientes"
              value={`$${summary.totalPending.toFixed(2)}`}
              className="border-yellow-200"
            />
            <SummaryCard
              icon={<CheckCircle className="h-5 w-5 text-green-600" />}
              label="Cobradas"
              value={`$${summary.totalCollected.toFixed(2)}`}
              className="border-green-200"
            />
            <SummaryCard
              icon={<Ban className="h-5 w-5 text-gray-500" />}
              label="Exoneradas"
              value={`$${summary.totalWaived.toFixed(2)}`}
              className="border-gray-200"
            />
          </>
        ) : null}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1">
          <Label className="text-xs">Filtrar por</Label>
          <Select
            value={filterMode}
            onValueChange={(v) => {
              setFilterMode((v as FilterMode) ?? "all")
              setStatusFilter("")
              setStartDate("")
              setEndDate("")
            }}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="status">Por estado</SelectItem>
              <SelectItem value="dateRange">Por fecha</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filterMode === "status" && (
          <div className="space-y-1">
            <Label className="text-xs">Estado</Label>
            <Select
              value={statusFilter}
              onValueChange={(v) =>
                setStatusFilter((v as FeeStatus) ?? "")
              }
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.entries(FEE_STATUS_LABELS) as [
                    FeeStatus,
                    string,
                  ][]
                ).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {filterMode === "dateRange" && (
          <>
            <div className="space-y-1">
              <Label className="text-xs">Desde</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hasta</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por organización o N° factura..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Summary */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {fees.length} tarifa{fees.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Fees table */}
      <DataTable
        isLoading={isLoading}
        isEmpty={filtered.length === 0}
        emptyIcon={<TrendingUp className="h-8 w-8 text-muted-foreground" />}
        emptyMessage="No hay tarifas para mostrar"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Organización</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>N° Factura</TableHead>
              <TableHead className="text-right">Tarifa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((fee) => (
              <TableRow key={fee.id}>
                <TableCell className="whitespace-nowrap text-sm">
                  {fee.createdAtFormatted}
                </TableCell>
                <TableCell className="font-medium">
                  {fee.organizationName}
                </TableCell>
                <TableCell className="text-sm">
                  {fee.planName ?? "—"}
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {fee.invoiceNumber}
                </TableCell>
                <TableCell className="text-right font-bold">
                  {fee.feeAmountFormatted}
                </TableCell>
                <TableCell>
                  <Badge className={fee.statusColor}>
                    {fee.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {fee.status === "PENDING" && (
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleCollect(fee.id)}
                        disabled={collectMutation.isPending}
                        title="Marcar como cobrada"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleWaive(fee.id)}
                        disabled={waiveMutation.isPending}
                        title="Exonerar"
                      >
                        <XCircle className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  )
}

function SummaryCard({
  icon,
  label,
  value,
  subtitle,
  className,
}: {
  icon: React.ReactNode
  label: string
  value: string
  subtitle?: string
  className?: string
}) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
