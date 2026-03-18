"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
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
import { useOrganizationMedicalRecords } from "@/hooks/use-clinical"
import { FileHeart, Search, Eye, User } from "lucide-react"

export default function MedicalRecordsPage() {
  const { data: records = [], isLoading } = useOrganizationMedicalRecords()
  const [search, setSearch] = useState("")

  const filteredRecords = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.patientIdNumber.toLowerCase().includes(q) ||
        r.recordNumber.toLowerCase().includes(q)
    )
  }, [records, search])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Historias clínicas
        </h1>
        <p className="text-muted-foreground">
          Busca y consulta las historias clínicas de los pacientes
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, cédula o N° historia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <FileHeart className="mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {search
              ? "No se encontraron historias clínicas"
              : "No hay historias clínicas registradas"}
          </p>
          {!search && (
            <p className="text-xs text-muted-foreground mt-1">
              Se crearán automáticamente al iniciar una consulta o registrar signos vitales
            </p>
          )}
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>
              {filteredRecords.length}{" "}
              {filteredRecords.length === 1 ? "historia clínica" : "historias clínicas"}
              {search ? " encontradas" : " registradas"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Historia</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden sm:table-cell">Cédula</TableHead>
                  <TableHead className="hidden md:table-cell">Clínica de apertura</TableHead>
                  <TableHead className="hidden lg:table-cell">Fecha de apertura</TableHead>
                  <TableHead className="hidden lg:table-cell">Abierto por</TableHead>
                  <TableHead className="text-right">Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium font-mono">
                      {record.recordNumber}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="hidden sm:block h-4 w-4 text-muted-foreground shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">
                            {record.patientName}
                          </p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {record.patientIdNumber}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {record.patientIdNumber}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {record.clinicName ?? "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell whitespace-nowrap text-sm">
                      {record.openedAtFormatted}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {record.openedByName}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        render={
                          <Link
                            href={`/dashboard/clinical/records/${record.id}`}
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
