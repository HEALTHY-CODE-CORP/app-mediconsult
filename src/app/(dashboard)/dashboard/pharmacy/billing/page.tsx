"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { DataTable } from "@/components/ui/data-table"
import { PharmacySelector } from "@/components/inventory/pharmacy-selector"
import {
  useOrganizationInvoices,
  usePharmacyInvoices,
  usePharmacyInvoicesByStatus,
  usePharmacyInvoicesByDateRange,
} from "@/hooks/use-billing"
import {
  FileText,
  Eye,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import type { InvoiceStatus } from "@/types/billing.model"
import {
  INVOICE_STATUS_LABELS,
  type Invoice,
} from "@/adapters/billing.adapter"
import type { ApiError } from "@/types/api"
import { toIsoDateEc } from "@/lib/date"

type FilterMode = "all" | "status" | "dateRange"

function coalesceInvoices(serverData: Invoice[] | undefined, fallback: Invoice[]): Invoice[] {
  if (!serverData) return fallback
  if (serverData.length > 0) return serverData
  return fallback.length > 0 ? fallback : serverData
}

function getQueryErrorMessage(error: unknown): string {
  if (!error) return "No fue posible cargar facturas."
  if (typeof error === "object" && error !== null && "message" in error) {
    const apiError = error as ApiError
    return apiError.message || "No fue posible cargar facturas."
  }
  return "No fue posible cargar facturas."
}

export default function BillingPage() {
  const [pharmacyId, setPharmacyId] = useState("")
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [search, setSearch] = useState("")
  const shouldQueryAll = Boolean(pharmacyId && filterMode === "all")
  const shouldQueryStatus = Boolean(
    pharmacyId && filterMode === "status" && statusFilter
  )
  const shouldQueryDate = Boolean(
    pharmacyId && filterMode === "dateRange" && startDate && endDate
  )
  const isFilterIncomplete = Boolean(
    pharmacyId &&
      ((filterMode === "status" && !statusFilter) ||
        (filterMode === "dateRange" && (!startDate || !endDate)))
  )

  // Queries — org-level when no pharmacy selected, pharmacy-level otherwise
  const orgQuery = useOrganizationInvoices()
  const pharmacyQuery = usePharmacyInvoices(shouldQueryAll ? pharmacyId : "")
  const statusQuery = usePharmacyInvoicesByStatus(
    shouldQueryStatus ? pharmacyId : "",
    statusFilter
  )
  const dateQuery = usePharmacyInvoicesByDateRange(
    shouldQueryDate ? pharmacyId : "",
    startDate,
    endDate
  )

  const orgPharmacyInvoices = useMemo(
    () =>
      (orgQuery.data ?? []).filter((inv) => inv.invoiceType === "PHARMACY_SALE"),
    [orgQuery.data]
  )

  const orgSelectedPharmacyInvoices = useMemo(
    () =>
      orgPharmacyInvoices.filter((inv) => inv.pharmacyId === pharmacyId),
    [orgPharmacyInvoices, pharmacyId]
  )

  const orgSelectedPharmacyByStatus = useMemo(
    () =>
      orgSelectedPharmacyInvoices.filter((inv) =>
        statusFilter ? inv.status === statusFilter : true
      ),
    [orgSelectedPharmacyInvoices, statusFilter]
  )

  const orgSelectedPharmacyByDate = useMemo(
    () =>
      orgSelectedPharmacyInvoices.filter((inv) => {
        const createdDate = toIsoDateEc(inv.createdAt, "")
        return Boolean(
          createdDate &&
            startDate &&
            endDate &&
            createdDate >= startDate &&
            createdDate <= endDate
        )
      }),
    [orgSelectedPharmacyInvoices, startDate, endDate]
  )

  // When no pharmacy selected, always use org-level data
  const isLoading = pharmacyId
    ? shouldQueryAll
      ? pharmacyQuery.isLoading
      : shouldQueryStatus
        ? statusQuery.isLoading
        : shouldQueryDate
          ? dateQuery.isLoading
          : false
    : orgQuery.isLoading

  const invoices = !pharmacyId
    ? orgPharmacyInvoices
    : shouldQueryStatus
      ? coalesceInvoices(statusQuery.data, orgSelectedPharmacyByStatus)
      : shouldQueryDate
        ? coalesceInvoices(dateQuery.data, orgSelectedPharmacyByDate)
        : shouldQueryAll
          ? coalesceInvoices(pharmacyQuery.data, orgSelectedPharmacyInvoices)
          : []
  const rawQueryError = !pharmacyId
    ? orgQuery.error
    : shouldQueryAll
      ? pharmacyQuery.error
      : shouldQueryStatus
        ? statusQuery.error
        : shouldQueryDate
          ? dateQuery.error
          : null
  const hasFallbackForCurrentCriteria = !pharmacyId
    ? false
    : shouldQueryStatus
      ? orgSelectedPharmacyByStatus.length > 0
      : shouldQueryDate
        ? orgSelectedPharmacyByDate.length > 0
        : shouldQueryAll
          ? orgSelectedPharmacyInvoices.length > 0
          : false
  const serverRowsForCurrentCriteria = !pharmacyId
    ? orgPharmacyInvoices.length
    : shouldQueryStatus
      ? (statusQuery.data?.length ?? 0)
      : shouldQueryDate
        ? (dateQuery.data?.length ?? 0)
        : shouldQueryAll
          ? (pharmacyQuery.data?.length ?? 0)
          : 0
  const isActiveQueryError = Boolean(rawQueryError)
  const shouldSuppressQueryError = Boolean(
    pharmacyId &&
      hasFallbackForCurrentCriteria &&
      (isActiveQueryError || serverRowsForCurrentCriteria === 0)
  )
  const queryError = shouldSuppressQueryError ? null : rawQueryError
  const queryErrorMessage = getQueryErrorMessage(queryError)
  const incompleteFilterMessage =
    filterMode === "status"
      ? "Selecciona un estado para consultar facturas."
      : "Completa fecha de inicio y fin para aplicar el filtro."
  const hasCriteria =
    filterMode !== "all" || Boolean(statusFilter) || Boolean(startDate) || Boolean(endDate) || Boolean(search)

  function clearCriteria() {
    setFilterMode("all")
    setStatusFilter("")
    setStartDate("")
    setEndDate("")
    setSearch("")
  }

  // Client-side search
  const filtered = search
    ? invoices.filter(
        (inv) =>
          inv.numeroFactura.toLowerCase().includes(search.toLowerCase()) ||
          inv.compradorRazonSocial.toLowerCase().includes(search.toLowerCase()) ||
          inv.compradorIdentificacion.includes(search)
      )
    : invoices
  const shouldSuggestAllPharmacies = Boolean(
    pharmacyId &&
      !isLoading &&
      !queryError &&
      filtered.length === 0 &&
      orgPharmacyInvoices.length > 0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Facturación</h1>
        <p className="text-muted-foreground">
          Gestión de facturas electrónicas SRI
        </p>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-end">
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">Farmacia</p>
                <PharmacySelector value={pharmacyId} onChange={setPharmacyId} />
              </div>

              {pharmacyId && (
                <div className="flex flex-wrap items-end gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs" htmlFor="pharmacy-billing-filter-mode">
                      Filtrar por
                    </Label>
                    <Select
                      value={filterMode}
                      onValueChange={(v) => {
                        setFilterMode((v as FilterMode) ?? "all")
                        setStatusFilter("")
                        setStartDate("")
                        setEndDate("")
                      }}
                      items={{ all: "Todas", status: "Por estado", dateRange: "Por fecha" }}
                    >
                      <SelectTrigger
                        id="pharmacy-billing-filter-mode"
                        className="w-full sm:w-[180px]"
                      >
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
                      <Label className="text-xs" htmlFor="pharmacy-billing-status-filter">
                        Estado
                      </Label>
                      <Select
                        value={statusFilter}
                        onValueChange={(v) =>
                          setStatusFilter((v as InvoiceStatus) ?? "")
                        }
                        items={INVOICE_STATUS_LABELS as Record<string, string>}
                      >
                        <SelectTrigger
                          id="pharmacy-billing-status-filter"
                          className="w-full sm:w-[220px]"
                        >
                          <SelectValue placeholder="Seleccionar" />
                        </SelectTrigger>
                        <SelectContent>
                          {(
                            Object.entries(INVOICE_STATUS_LABELS) as [
                              InvoiceStatus,
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

                  {hasCriteria && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearCriteria}
                      className="h-8"
                    >
                      <X className="mr-1 h-3.5 w-3.5" />
                      Limpiar
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="relative w-full xl:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por N° factura, cliente o identificación..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-8"
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="absolute top-1.5 right-1 h-6 w-6"
                  onClick={() => setSearch("")}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {pharmacyId && (
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="gap-1 text-xs">
                <SlidersHorizontal className="h-3 w-3" />
                {filterMode === "all"
                  ? "Todas"
                  : filterMode === "status"
                    ? "Por estado"
                    : "Por fecha"}
              </Badge>
              {statusFilter && (
                <Badge variant="outline" className="text-xs">
                  Estado: {INVOICE_STATUS_LABELS[statusFilter]}
                </Badge>
              )}
              {startDate && endDate && (
                <Badge variant="outline" className="text-xs">
                  {startDate} - {endDate}
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      {!isLoading && !isFilterIncomplete && !queryError && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {invoices.length} factura{invoices.length !== 1 ? "s" : ""}
        </p>
      )}

      {shouldSuggestAllPharmacies && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
          <span>No hay facturas para la farmacia seleccionada.</span>
          <Button type="button" variant="link" className="h-auto p-0" onClick={() => setPharmacyId("")}>
            Ver todas las farmacias
          </Button>
        </div>
      )}

      {/* Invoice list */}
      <DataTable
        isLoading={isLoading}
        isEmpty={Boolean(queryError) || isFilterIncomplete || filtered.length === 0}
        emptyIcon={<FileText className="h-8 w-8 text-muted-foreground" />}
        emptyMessage={
          queryError
            ? "No se pudo cargar facturas"
            : isFilterIncomplete
            ? "Falta completar filtros"
            : "No hay facturas para mostrar"
        }
        emptyDescription={
          queryError
            ? queryErrorMessage
            : isFilterIncomplete
              ? incompleteFilterMessage
              : undefined
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Factura</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Identificación</TableHead>
              {!pharmacyId && <TableHead>Farmacia</TableHead>}
              <TableHead>Ambiente</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell className="font-mono text-sm">
                  {inv.numeroFactura}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {inv.createdAtFormatted}
                </TableCell>
                <TableCell>{inv.compradorRazonSocial}</TableCell>
                <TableCell className="font-mono text-sm">
                  {inv.compradorIdentificacion}
                </TableCell>
                {!pharmacyId && (
                  <TableCell className="text-sm">{inv.pharmacyName}</TableCell>
                )}
                <TableCell>
                  <Badge variant="outline">{inv.ambienteLabel}</Badge>
                </TableCell>
                <TableCell className="text-right font-bold">
                  {inv.importeTotalFormatted}
                </TableCell>
                <TableCell>
                  <Badge className={inv.statusColor}>
                    {inv.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    render={
                      <Link
                        href={`/dashboard/pharmacy/billing/${inv.id}`}
                      />
                    }
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  )
}
