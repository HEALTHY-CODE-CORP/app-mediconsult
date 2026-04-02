"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SummaryTile } from "@/components/shared/summary-tile"
import { PatientForm } from "@/components/patients/patient-form"
import { ArrowLeft, UserRound, Shield, Phone } from "lucide-react"

export default function NewPatientPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/dashboard/patients" />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nuevo paciente</h1>
          <p className="text-muted-foreground">
            Registra un nuevo paciente en el sistema
          </p>
        </div>
      </div>

      <Card className="border-border/70">
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <SummaryTile
              icon={<UserRound className="h-4 w-4 text-muted-foreground" />}
              label="Identificación"
              helper="Valida nombres y documento antes de guardar."
              labelClassName="text-sm font-medium text-foreground"
            />
            <SummaryTile
              icon={<Phone className="h-4 w-4 text-muted-foreground" />}
              label="Contacto"
              helper="Incluye teléfono o email para seguimiento."
              labelClassName="text-sm font-medium text-foreground"
            />
            <SummaryTile
              icon={<Shield className="h-4 w-4 text-muted-foreground" />}
              label="Seguridad"
              helper="Agrega datos sensibles solo cuando sean necesarios."
              labelClassName="text-sm font-medium text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      <PatientForm mode="create" />
    </div>
  )
}
