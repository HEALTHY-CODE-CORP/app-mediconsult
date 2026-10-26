"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { DataTable } from "@/components/ui/data-table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useMyDentalDates,
  useOrganizationDentalDates,
} from "@/hooks/use-dental"
import { SelectPatientDentalModal } from "@/components/dental/select-patient-dental-modal"
import { parseDateEc } from "@/lib/date"
import {
  Plus,
  Eye,
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  Calendar,
  Sparkles,
  RotateCcw,
} from "lucide-react"

const MONTH_OPTIONS = [
  { value: "ALL", label: "Todos los meses" },
  { value: "0", label: "Enero" },
  { value: "1", label: "Febrero" },
  { value: "2", label: "Marzo" },
  { value: "3", label: "Abril" },
  { value: "4", label: "Mayo" },
  { value: "5", label: "Junio" },
  { value: "6", label: "Julio" },
  { value: "7", label: "Agosto" },
  { value: "8", label: "Septiembre" },
  { value: "9", label: "Octubre" },
  { value: "10", label: "Noviembre" },
  { value: "11", label: "Diciembre" },
]

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos los estados" },
  { value: "DRAFT", label: "En borrador" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "CANCELLED", label: "Canceladas" },
]

export default function DentalConsultationsPage() {
  const { data: session } = useSession()
  const roles = session?.user?.roles ?? []
  const isAdmin = roles.includes("ADMIN")
  const isDentist = roles.includes("DENTIST")
  const canCreate = isAdmin || isDentist

  // Admin ve todas las citas de la organización por defecto; Odontólogo ve las suyas
  const myDatesQuery = useMyDentalDates()
  const orgDatesQuery = useOrganizationDentalDates()

  const [viewAll, setViewAll] = useState(isAdmin)
  const [patientModalOpen, setPatientModalOpen] = useState(false)
  const activeQuery = viewAll ? orgDatesQuery : myDatesQuery
  const dates = activeQuery.data ?? []
  const isLoading = activeQuery.isLoading

  // Filtros
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [monthFilter, setMonthFilter] = useState<string>("ALL")
  const [yearFilter, setYearFilter] = useState<string>("ALL")

  // Años disponibles a partir de las citas registradas + año actual
  const availableYears = useMemo(() => {
    const current = new Date().getFullYear()
    const years = new Set<number>([current, current - 1, current + 1])
    dates.forEach((d) => {
      const parsed = parseDateEc(d.sessionDate) ?? new Date(d.sessionDate)
      const yr = parsed.getFullYear()
      if (!isNaN(yr)) years.add(yr)
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [dates])

  // Mapas de valor -> texto para que SelectValue muestre el texto amigable
  const monthItems = useMemo(
    () => Object.fromEntries(MONTH_OPTIONS.map((m) => [m.value, m.label])),
    []
  )

  const statusItems = useMemo(
    () => Object.fromEntries(STATUS_OPTIONS.map((s) => [s.value, s.label])),
    []
  )

  const yearItems = useMemo(() => {
    const map: Record<string, string> = { ALL: "Todos los años" }
    availableYears.forEach((y) => {
      map[y.toString()] = y.toString()
    })
    return map
  }, [availableYears])

  const isFiltered =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    monthFilter !== "ALL" ||
    yearFilter !== "ALL"

  function resetFilters() {
    setSearch("")
    setStatusFilter("ALL")
    setMonthFilter("ALL")
    setYearFilter("ALL")
  }

  // Cálculo de estadísticas locales
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDate = now.getDate()

  const stats = useMemo(() => {
    let todayCount = 0
    let monthCount = 0
    let completedMonthCount = 0
    let draftCount = 0

    dates.forEach((d) => {
      const date = parseDateEc(d.sessionDate) ?? new Date(d.sessionDate)
      const isYear = date.getFullYear() === currentYear
      const isMonth = isYear && date.getMonth() === currentMonth
      const isToday = isMonth && date.getDate() === currentDate

      if (isToday) todayCount++
      if (isMonth) {
        monthCount++
        if (d.status === "COMPLETED") completedMonthCount++
      }
      if (d.status === "DRAFT") draftCount++
    })

    return {
      todayCount,
      monthCount,
      completedMonthCount,
      draftCount,
    }
  }, [dates, currentYear, currentMonth, currentDate])

  const filteredDates = useMemo(() => {
    return dates.filter((d) => {
      const dDate = parseDateEc(d.sessionDate) ?? new Date(d.sessionDate)

      const matchesSearch =
        !search ||
        d.patientName.toLowerCase().includes(search.toLowerCase()) ||
        d.doctorName.toLowerCase().includes(search.toLowerCase()) ||
        d.diagnosisAndComplications.toLowerCase().includes(search.toLowerCase()) ||
        d.procedureText.toLowerCase().includes(search.toLowerCase())

      const matchesStatus =
        statusFilter === "ALL" || d.status === statusFilter

      const matchesYear =
        yearFilter === "ALL" || dDate.getFullYear().toString() === yearFilter

      const matchesMonth =
        monthFilter === "ALL" || dDate.getMonth().toString() === monthFilter

      return matchesSearch && matchesStatus && matchesYear && matchesMonth
    })
  }, [dates, search, statusFilter, yearFilter, monthFilter])

  // Etiqueta dinámica para el período seleccionado
  const periodLabel = useMemo(() => {
    if (monthFilter === "ALL" && yearFilter === "ALL") return "Mes actual"
    if (monthFilter !== "ALL" && yearFilter !== "ALL") {
      const mName = MONTH_OPTIONS.find((m) => m.value === monthFilter)?.label
      return `${mName} ${yearFilter}`
    }
    if (monthFilter !== "ALL") {
      return MONTH_OPTIONS.find((m) => m.value === monthFilter)?.label ?? "Mes"
    }
    return `Año ${yearFilter}`
  }, [monthFilter, yearFilter])

  const hasPeriodFilter = monthFilter !== "ALL" || yearFilter !== "ALL"

  const periodStats = useMemo(() => {
    if (!hasPeriodFilter) {
      return {
        count: stats.monthCount,
        completed: stats.completedMonthCount,
        draft: stats.draftCount,
      }
    }
    return {
      count: filteredDates.length,
      completed: filteredDates.filter((d) => d.status === "COMPLETED").length,
      draft: filteredDates.filter((d) => d.status === "DRAFT").length,
    }
  }, [hasPeriodFilter, stats, filteredDates])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Consultas odontológicas
          </h1>
          <p className="text-muted-foreground">
            {viewAll
              ? "Citas y sesiones odontológicas de la organización"
              : "Historial de mis consultas y sesiones odontológicas"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewAll((prev) => !prev)}
            >
              {viewAll ? "Ver solo mis citas" : "Ver toda la organización"}
            </Button>
          )}
          {canCreate && (
            <Button onClick={() => setPatientModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva consulta
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Consultas hoy
                </p>
                <p className="text-2xl font-bold">{stats.todayCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Consultas ({periodLabel})
                </p>
                <p className="text-2xl font-bold">{periodStats.count}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completadas ({periodLabel})
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {periodStats.completed}
                </p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  En borrador ({periodLabel})
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  {periodStats.draft}
                </p>
              </div>
              <Clock className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros de búsqueda */}
      <div className="flex flex-wrap items-end gap-3">
        {/* Buscar */}
        <div className="space-y-1.5 min-w-[240px] flex-1">
          <Label className="text-xs font-medium text-muted-foreground">Búsqueda</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por paciente, odontólogo, diagnóstico o procedimiento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Filtro por Mes */}
        <div className="space-y-1.5 w-[160px]">
          <Label className="text-xs font-medium text-muted-foreground">Mes</Label>
          <Select
            value={monthFilter}
            onValueChange={(val) => setMonthFilter(val ?? "ALL")}
            items={monthItems}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los meses" />
            </SelectTrigger>
            <SelectContent>
              {MONTH_OPTIONS.map((m) => (
                <SelectItem key={m.value} value={m.value}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Año */}
        <div className="space-y-1.5 w-[140px]">
          <Label className="text-xs font-medium text-muted-foreground">Año</Label>
          <Select
            value={yearFilter}
            onValueChange={(val) => setYearFilter(val ?? "ALL")}
            items={yearItems}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los años" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos los años</SelectItem>
              {availableYears.map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filtro por Estado */}
        <div className="space-y-1.5 w-[160px]">
          <Label className="text-xs font-medium text-muted-foreground">Estado</Label>
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val ?? "ALL")}
            items={statusItems}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos los estados" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Botón de limpiar filtros */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="text-muted-foreground hover:text-foreground self-end mb-0.5"
            title="Restablecer filtros"
          >
            <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Tabla de Citas */}
      <DataTable
        isLoading={isLoading}
        isEmpty={filteredDates.length === 0}
        emptyIcon={<Sparkles className="h-10 w-10 text-muted-foreground" />}
        emptyMessage={
          isFiltered
            ? "No se encontraron consultas para el período o filtros seleccionados"
            : "No hay consultas odontológicas registradas"
        }
        emptyDescription={
          isFiltered
            ? "Prueba cambiando el mes, año, estado o término de búsqueda."
            : "Las consultas odontológicas se crean dentro de la historia dental de cada paciente."
        }
        emptyAction={
          isFiltered ? (
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Restablecer filtros
            </Button>
          ) : canCreate ? (
            <Button
              variant="link"
              onClick={() => setPatientModalOpen(true)}
            >
              Seleccionar paciente para iniciar consulta
            </Button>
          ) : undefined
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead className="hidden md:table-cell">Odontólogo</TableHead>
              <TableHead className="hidden lg:table-cell">Consultorio</TableHead>
              <TableHead>Sesión</TableHead>
              <TableHead className="hidden sm:table-cell">Diagnóstico</TableHead>
              <TableHead className="hidden sm:table-cell">Procedimiento</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDates.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="whitespace-nowrap text-sm font-medium">
                  {d.sessionDateFormatted}
                </TableCell>
                <TableCell className="font-medium">
                  {d.patientName}
                </TableCell>
                <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                  {d.doctorName}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {d.clinicName}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-semibold">
                    #{d.sessionNumber}
                  </span>
                </TableCell>
                <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-sm">
                  {d.diagnosisAndComplications}
                </TableCell>
                <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-sm">
                  {d.procedureText}
                </TableCell>
                <TableCell>
                  <Badge className={d.statusColor}>
                    {d.statusLabel}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    title="Ver ficha odontológica"
                    render={
                      <Link href={`/dashboard/patients/${d.patientId}/dental`} />
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

      <SelectPatientDentalModal
        open={patientModalOpen}
        onOpenChange={setPatientModalOpen}
      />
    </div>
  )
}
