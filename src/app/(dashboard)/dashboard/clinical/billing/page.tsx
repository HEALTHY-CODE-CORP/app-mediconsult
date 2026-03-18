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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
import { ClinicSelector } from "@/components/clinical/clinic-selector"
import {
  useClinicInvoices,
  useClinicInvoicesByStatus,
  useClinicInvoicesByDateRange,
} from "@/hooks/use-billing"
import {
  FileText,
  Eye,
  Search,
  Filter,
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

  // Queries
  const allQuery = useClinicInvoices(
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

  const isLoading = allQuery.isLoading || statusQuery.isLoading || dateQuery.isLoading

  const invoices =
    filterMode === "status"
      ? statusQuery.data ?? []
      : filterMode === "dateRange"
        ? dateQuery.data ?? []
        : allQuery.data ?? []

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

      {clinicId && (
        <>
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
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
                    <SelectTrigger>
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
                      <SelectTrigger>
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

              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por N° factura, cliente, doctor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice list */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Facturas de Consultas ({filtered.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No hay facturas de consultas para mostrar
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>N° Factura</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Doctor</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Identificación</TableHead>
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
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
