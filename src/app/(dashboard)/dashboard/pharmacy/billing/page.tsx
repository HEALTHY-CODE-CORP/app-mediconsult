"use client"

import { useState } from "react"
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
} from "lucide-react"
import type { InvoiceStatus } from "@/types/billing.model"
import {
  INVOICE_STATUS_LABELS,
} from "@/adapters/billing.adapter"

type FilterMode = "all" | "status" | "dateRange"

export default function BillingPage() {
  const [pharmacyId, setPharmacyId] = useState("")
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [search, setSearch] = useState("")

  // Queries — org-level when no pharmacy selected, pharmacy-level otherwise
  const orgQuery = useOrganizationInvoices()
  const pharmacyQuery = usePharmacyInvoices(
    filterMode === "all" ? pharmacyId : ""
  )
  const statusQuery = usePharmacyInvoicesByStatus(
    filterMode === "status" ? pharmacyId : "",
    statusFilter
  )
  const dateQuery = usePharmacyInvoicesByDateRange(
    filterMode === "dateRange" ? pharmacyId : "",
    startDate,
    endDate
  )

  // When no pharmacy selected, always use org-level data
  const isLoading = pharmacyId
    ? (pharmacyQuery.isLoading || statusQuery.isLoading || dateQuery.isLoading)
    : orgQuery.isLoading

  const invoices = !pharmacyId
    ? orgQuery.data ?? []
    : filterMode === "status"
      ? statusQuery.data ?? []
      : filterMode === "dateRange"
        ? dateQuery.data ?? []
        : pharmacyQuery.data ?? []

  // Client-side search
  const filtered = search
    ? invoices.filter(
        (inv) =>
          inv.numeroFactura.toLowerCase().includes(search.toLowerCase()) ||
          inv.compradorRazonSocial.toLowerCase().includes(search.toLowerCase()) ||
          inv.compradorIdentificacion.includes(search)
      )
    : invoices

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Facturación</h1>
        <p className="text-muted-foreground">
          Gestión de facturas electrónicas SRI
        </p>
      </div>

      <PharmacySelector value={pharmacyId} onChange={setPharmacyId} />

      {/* Filters — only show when a pharmacy is selected (filtered queries need pharmacyId) */}
      {pharmacyId && (
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
                  setStatusFilter((v as InvoiceStatus) ?? "")
                }
              >
                <SelectTrigger className="w-full sm:w-[180px]">
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
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por N° factura, cliente o identificación..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Summary */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} de {invoices.length} factura{invoices.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Invoice list */}
      <DataTable
        isLoading={isLoading}
        isEmpty={filtered.length === 0}
        emptyIcon={<FileText className="h-8 w-8 text-muted-foreground" />}
        emptyMessage="No hay facturas para mostrar"
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
