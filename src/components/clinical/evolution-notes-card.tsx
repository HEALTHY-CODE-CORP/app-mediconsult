"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useEvolutionNotes, useCreateEvolutionNote } from "@/hooks/use-clinical"
import { FileText, Plus, User } from "lucide-react"
import { toast } from "sonner"

interface EvolutionNotesCardProps {
  consultationId: string
  canAdd?: boolean
}

export function EvolutionNotesCard({
  consultationId,
  canAdd = true,
}: EvolutionNotesCardProps) {
  const { data: notes = [], isLoading } = useEvolutionNotes(consultationId)
  const createMutation = useCreateEvolutionNote(consultationId)
  const [newNote, setNewNote] = useState("")
  const [showForm, setShowForm] = useState(false)

  async function handleAdd() {
    if (!newNote.trim()) return
    try {
      await createMutation.mutateAsync({ note: newNote })
      setNewNote("")
      setShowForm(false)
      toast.success("Nota de evolución agregada")
    } catch {
      toast.error("Error al agregar la nota")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notas de evolución
            </CardTitle>
            <CardDescription>
              Seguimiento de la evolución del paciente
            </CardDescription>
          </div>
          {canAdd && !showForm && (
            <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
              <Plus className="mr-1 h-4 w-4" />
              Agregar nota
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showForm && (
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Escribe la nota de evolución..."
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setNewNote("")
                }}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={!newNote.trim() || createMutation.isPending}
              >
                {createMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : notes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay notas de evolución
          </p>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg border p-3 space-y-1"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span>{note.doctorName}</span>
                  <span>·</span>
                  <span>{note.createdAtFormatted}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
