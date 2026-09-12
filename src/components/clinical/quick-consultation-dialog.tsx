"use client"

import { useState, useMemo, FormEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
import { usePatients } from "@/hooks/use-patients"
import { useMyClinics } from "@/hooks/use-organizations"
import { useCreateQuickConsultation } from "@/hooks/use-clinical"
import {
  Search,
  UserRound,
  Building2,
  Zap,
  Receipt,
  CheckCircle2,
  DollarSign,
  Stethoscope,
} from "lucide-react"

interface QuickConsultationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickConsultationDialog({
  open,
  onOpenChange,
}: QuickConsultationDialogProps) {
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
      .slice(0, 6)
  }, [patients, search])

  function resetForm() {
    setSearch("")
    setSelectedPatientId("")
    setSelectedClinicId(null)
    setProcedureName("")
    setCost("")
    setNotes("")
    setAttemptedSubmit(false)
  }

  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  async function handleSave(andInvoice = false) {
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

      toast.success("Consulta rápida guardada exitosamente")
      handleOpenChange(false)

      if (andInvoice) {
        router.push(`/dashboard/clinical/billing/new?consultationId=${result.id}`)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Error al guardar la consulta rápida"
      )
    }
  }

  const isPending = createQuickMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Consulta rápida</DialogTitle>
              <DialogDescription>
                Registra un procedimiento ambulatorio y su valor al instante.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* 1. Paciente */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 font-medium">
              <UserRound className="h-4 w-4 text-muted-foreground" />
              Paciente registrado *
            </Label>

            {loadingPatients ? (
              <Skeleton className="h-10 w-full" />
            ) : selectedPatient ? (
              <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {selectedPatient.fullName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedPatient.idTypeLabel}: {selectedPatient.idNumber}
                    {selectedPatient.phone && ` · ${selectedPatient.phone}`}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedPatientId("")
                    setSearch("")
                  }}
                >
                  Cambiar
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente por nombre o cédula..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                    autoFocus
                  />
                </div>
                {search.trim() && filteredPatients.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No se encontró paciente. Debe estar registrado en el sistema.
                  </p>
                )}
                {search.trim() && filteredPatients.length > 0 && (
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border p-1 bg-background shadow-xs">
                    {filteredPatients.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPatientId(p.id)
                          setSearch("")
                        }}
                        className="flex w-full cursor-pointer items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted rounded-sm transition-colors"
                      >
                        <span className="font-medium truncate">{p.fullName}</span>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {p.idNumber}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}
                {attemptedSubmit && !selectedPatientId && (
                  <p className="text-xs text-destructive">
                    Debes seleccionar un paciente registrado.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 2. Consultorio */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 font-medium">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              Consultorio *
            </Label>
            {loadingClinics ? (
              <Skeleton className="h-10 w-full" />
            ) : clinics.length === 1 ? (
              <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm font-medium">
                {clinics[0].name}
              </div>
            ) : (
              <Select
                value={selectedClinicId ?? ""}
                onValueChange={(val) => setSelectedClinicId(val)}
                items={Object.fromEntries(clinics.map((c) => [c.id, c.name]))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un consultorio" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {attemptedSubmit && !effectiveClinicId && (
              <p className="text-xs text-destructive">
                Debes seleccionar un consultorio.
              </p>
            )}
          </div>

          {/* 3. Procedimiento y Valor */}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="quick-procedure-name" className="font-medium">
                Procedimiento realizado *
              </Label>
              <Input
                id="quick-procedure-name"
                placeholder="Ej. Inyección intramuscular, Curación, Vendaje..."
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
              <Label htmlFor="quick-procedure-cost" className="font-medium">
                Valor ($ USD) *
              </Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="quick-procedure-cost"
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
                  <p className="text-xs text-destructive">Valor inválido.</p>
                )}
            </div>
          </div>

          {/* 4. Notas adicionales (opcional) */}
          <div className="space-y-2">
            <Label htmlFor="quick-procedure-notes" className="text-sm font-medium">
              Notas u observaciones (Opcional)
            </Label>
            <Textarea
              id="quick-procedure-notes"
              placeholder="Detalles adicionales, dosis aplicada, indicaciones breves..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
            className="cursor-pointer hover:bg-muted transition-colors"
          >
            Cancelar
          </Button>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isPending}
              className="cursor-pointer border-emerald-500/30 bg-emerald-50/50 text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50 dark:border-emerald-500/50 transition-colors"
            >
              <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {isPending ? "Guardando..." : "Guardar consulta"}
            </Button>
            <Button
              type="button"
              onClick={() => handleSave(true)}
              disabled={isPending}
              className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs hover:shadow-sm transition-all"
            >
              <Receipt className="mr-1.5 h-4 w-4" />
              {isPending ? "Guardando..." : "Guardar y facturar"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
