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
import { ClinicSelector } from "@/components/clinical/clinic-selector"
import {
  useOrganizationConsultationInvoices,
  useClinicInvoices,
  useClinicInvoicesByStatus,
  useClinicInvoicesByDateRange,
} from "@/hooks/use-billing"
import {
  FileText,
  Eye,
  Search,
} from "lucide-react"
import type { InvoiceStatus } from "@/types/billing.model"
import { INVOICE_STATUS_LABELS } from "@/adapters/billing.adapter"

type FilterMode = "all" | "status" | "dateRange"

export default function ConsultationBillingPage() {
  const [clinicId, setClinicId] = useState("")
  const [filterMode, setFilterMode] = useState<FilterMode>("all")
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "">("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [search, setSearch] = useState("")

  // Queries — org-level when no clinic selected
  const orgQuery = useOrganizationConsultationInvoices()
  const clinicQuery = useClinicInvoices(
    filterMode === "all" ? clinicId : ""
  )
  const statusQuery = useClinicInvoicesByStatus(
    filterMode === "status" ? clinicId : "",
    statusFilter
  )
  const dateQuery = useClinicInvoicesByDateRange(
    filterMode === "dateRange" ? clinicId : "",
    startDate,
    endDate
  )

  const isLoading = clinicId
    ? (clinicQuery.isLoading || statusQuery.isLoading || dateQuery.isLoading)
    : orgQuery.isLoading

  const invoices = !clinicId
    ? orgQuery.data ?? []
    : filterMode === "status"
      ? statusQuery.data ?? []
      : filterMode === "dateRange"
        ? dateQuery.data ?? []
        : clinicQuery.data ?? []

  // Client-side search
  const filtered = search
    ? invoices.filter(
        (inv) =>
          inv.numeroFactura.toLowerCase().includes(search.toLowerCase()) ||
          inv.compradorRazonSocial.toLowerCase().includes(search.toLowerCase()) ||
          inv.compradorIdentificacion.includes(search) ||
          (inv.doctorName?.toLowerCase().includes(search.toLowerCase()) ?? false)
      )
    : invoices

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Facturación de Consultas
        </h1>
        <p className="text-muted-foreground">
          Gestión de facturas electrónicas por consultas médicas
        </p>
      </div>

      <ClinicSelector value={clinicId} onChange={setClinicId} />

      {/* Filters — only when a clinic is selected */}
      {clinicId && (
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
              items={{ all: "Todas", status: "Por estado", dateRange: "Por fecha" }}
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
                items={INVOICE_STATUS_LABELS as Record<string, string>}
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
          placeholder="Buscar por N° factura, cliente, doctor..."
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
        emptyMessage="No hay facturas de consultas para mostrar"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Factura</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Doctor</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Identificación</TableHead>
              {!clinicId && <TableHead>Clínica</TableHead>}
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
                <TableCell className="text-sm">
                  {inv.doctorName ?? "—"}
                </TableCell>
                <TableCell>{inv.compradorRazonSocial}</TableCell>
                <TableCell className="font-mono text-sm">
                  {inv.compradorIdentificacion}
                </TableCell>
                {!clinicId && (
                  <TableCell className="text-sm">{inv.clinicName ?? "—"}</TableCell>
                )}
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
                        href={`/dashboard/clinical/billing/${inv.id}`}
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
