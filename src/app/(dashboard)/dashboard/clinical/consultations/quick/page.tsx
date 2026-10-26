"use client"

import { useState, useMemo, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { SummaryTile } from "@/components/shared/summary-tile"
import { toast } from "sonner"
import { usePatients } from "@/hooks/use-patients"
import { useMyClinics } from "@/hooks/use-organizations"
import { useCreateQuickConsultation } from "@/hooks/use-clinical"
import {
  ArrowLeft,
  Search,
  UserRound,
  Building2,
  Zap,
  Receipt,
  CheckCircle2,
  DollarSign,
  Stethoscope,
  FileText,
} from "lucide-react"

export default function QuickConsultationPage() {
  const router = useRouter()
  const { data: patients = [], isLoading: loadingPatients } = usePatients()
  const { data: clinics = [], isLoading: loadingClinics } = useMyClinics()
  const createQuickMutation = useCreateQuickConsultation()

  const [search, setSearch] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState("")
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null)
  const [procedureName, setProcedureName] = useState("")
  const [cost, setCost] = useState("")
  const [notes, setNotes] = useState("")
  const [attemptedSubmit, setAttemptedSubmit] = useState(false)

  // Auto-select clinic if only one available
  const effectiveClinicId =
    clinics.length === 1 ? clinics[0].id : (selectedClinicId ?? "")

  const selectedClinicName =
    clinics.length === 1
      ? clinics[0]?.name
      : clinics.find((c) => c.id === effectiveClinicId)?.name

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === selectedPatientId),
    [patients, selectedPatientId]
  )

  const filteredPatients = useMemo(() => {
    if (!search.trim()) return []
    const q = search.toLowerCase()
    return patients
      .filter(
        (p) =>
          p.fullName.toLowerCase().includes(q) ||
          p.idNumber.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [patients, search])

  async function handleSubmit(andInvoice = false) {
    setAttemptedSubmit(true)

    if (!selectedPatientId) {
      toast.error("Selecciona un paciente registrado")
      return
    }

    if (!effectiveClinicId) {
      toast.error("Selecciona un consultorio")
      return
    }

    if (!procedureName.trim()) {
      toast.error("Ingresa el nombre del procedimiento")
      return
    }

    const parsedCost = parseFloat(cost)
    if (isNaN(parsedCost) || parsedCost < 0) {
      toast.error("Ingresa un valor válido para la consulta")
      return
    }

    try {
      const result = await createQuickMutation.mutateAsync({
        patientId: selectedPatientId,
        clinicId: effectiveClinicId,
        procedureName: procedureName.trim(),
        cost: parsedCost,
        notes: notes.trim() || undefined,
      })

      toast.success("Consulta rápida registrada exitosamente")

      if (andInvoice) {
        router.push(`/dashboard/clinical/billing/new?consultationId=${result.id}`)
      } else {
        router.push("/dashboard/clinical/consultations")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al registrar la consulta rápida"
      )
    }
  }

  const isPending = createQuickMutation.isPending
  const numericCost = parseFloat(cost)
  const displayCost = !isNaN(numericCost) && numericCost >= 0 ? `$${numericCost.toFixed(2)}` : "$0.00"

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href="/dashboard/clinical/consultations" />}
            className="cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Consulta rápida</h1>
              <Badge
                variant="outline"
                className="gap-1.5 border-amber-500/30 bg-amber-50/50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
              >
                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                Procedimiento ambulatorio
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Registra un procedimiento ambulatorio y su valor al instante.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Tiles */}
      <Card className="border-border/70">
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              icon={<UserRound className="h-4 w-4 text-muted-foreground" />}
              label="Paciente"
              value={selectedPatient?.fullName ?? "Sin seleccionar"}
              valueClassName="truncate"
            />
            <SummaryTile
              icon={<Building2 className="h-4 w-4 text-muted-foreground" />}
              label="Consultorio"
              value={selectedClinicName ?? "Sin seleccionar"}
              valueClassName="truncate"
            />
            <SummaryTile
              icon={<Stethoscope className="h-4 w-4 text-muted-foreground" />}
              label="Procedimiento"
              value={procedureName.trim() || "Sin ingresar"}
              valueClassName="truncate"
            />
            <SummaryTile
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
              label="Valor a cobrar"
              value={displayCost}
            />
          </div>
        </CardContent>
      </Card>

      <form
        onSubmit={(e: FormEvent) => {
          e.preventDefault()
          handleSubmit(false)
        }}
        className="space-y-6"
      >
        {/* 1. Selección de Paciente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="h-5 w-5" />
              Paciente registrado *
            </CardTitle>
            <CardDescription>
              Busca al paciente por nombre o número de cédula
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingPatients ? (
              <Skeleton className="h-10 w-full" />
            ) : selectedPatient ? (
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <UserRound className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedPatient.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.idTypeLabel}: {selectedPatient.idNumber}
                      {selectedPatient.phone && ` · ${selectedPatient.phone}`}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => {
                    setSelectedPatientId("")
                    setSearch("")
                  }}
                >
                  Cambiar paciente
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre o cédula..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                {search.trim() && filteredPatients.length === 0 && (
                  <div className="rounded-lg border border-dashed px-4 py-5 text-center">
                    <p className="text-sm font-medium">No se encontró al paciente</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      El paciente debe estar registrado previamente en el sistema.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 cursor-pointer"
                      render={<Link href="/dashboard/patients/new" />}
                    >
                      Registrar nuevo paciente
                    </Button>
                  </div>
                )}
                {search.trim() && filteredPatients.length > 0 && (
                  <div className="max-h-56 space-y-1 overflow-y-auto rounded-lg border p-1">
                    {filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(p.id)
                          setSearch("")
                        }}
                        className="flex w-full cursor-pointer items-center justify-between px-4 py-2.5 text-left hover:bg-muted rounded-md transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.fullName}</p>
                          <p className="text-xs text-muted-foreground">{p.idTypeLabel}: {p.idNumber}</p>
                        </div>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {p.idNumber}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
                {attemptedSubmit && !selectedPatientId && (
                  <p className="text-xs text-destructive">
                    Debes seleccionar un paciente registrado para continuar.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Consultorio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Consultorio *
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingClinics ? (
              <Skeleton className="h-10 w-full" />
            ) : clinics.length === 1 ? (
              <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                {clinics[0].name}
              </div>
            ) : (
              <div className="space-y-2">
                <Select
                  value={selectedClinicId ?? ""}
                  onValueChange={(val) => setSelectedClinicId(val)}
                  items={Object.fromEntries(clinics.map((c) => [c.id, c.name]))}
                >
                  <SelectTrigger className="cursor-pointer">
                    <SelectValue placeholder="Selecciona un consultorio" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics.map((c) => (
                      <SelectItem key={c.id} value={c.id} className="cursor-pointer">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {attemptedSubmit && !effectiveClinicId && (
              <p className="mt-2 text-xs text-destructive">
                Debes seleccionar un consultorio.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 3. Procedimiento y Valor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Datos del procedimiento
            </CardTitle>
            <CardDescription>
              Describe la atención brindada y el valor correspondiente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="procedureName" className="font-medium">
                  Procedimiento realizado *
                </Label>
                <Input
                  id="procedureName"
                  placeholder="Ej. Inyección intramuscular, Curación simple, Vendaje, Chequeo de rutina..."
                  value={procedureName}
                  onChange={(e) => setProcedureName(e.target.value)}
                  aria-invalid={attemptedSubmit && !procedureName.trim()}
                />
                {attemptedSubmit && !procedureName.trim() && (
                  <p className="text-xs text-destructive">
                    El nombre del procedimiento es requerido.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost" className="font-medium">
                  Valor ($ USD) *
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="cost"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="pl-8"
                    aria-invalid={
                      attemptedSubmit &&
                      (isNaN(parseFloat(cost)) || parseFloat(cost) < 0)
                    }
                  />
                </div>
                {attemptedSubmit &&
                  (isNaN(parseFloat(cost)) || parseFloat(cost) < 0) && (
                    <p className="text-xs text-destructive">
                      Ingresa un valor válido.
                    </p>
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-medium">
                Notas u observaciones (Opcional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Detalles adicionales, dosis aplicada, indicaciones para el paciente..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            render={<Link href="/dashboard/clinical/consultations" />}
            disabled={isPending}
            className="cursor-pointer hover:bg-muted transition-colors w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(false)}
            disabled={isPending}
            className="cursor-pointer border-emerald-500/30 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50 dark:border-emerald-500/50 transition-colors w-full sm:w-auto"
          >
            <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            {isPending ? "Guardando..." : "Guardar consulta"}
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={isPending}
            className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs hover:shadow-sm transition-all w-full sm:w-auto"
          >
            <Receipt className="mr-1.5 h-4 w-4" />
            {isPending ? "Guardando..." : "Guardar y facturar"}
          </Button>
        </div>
      </form>
    </div>
  )
}
