"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { ArrowLeft, Upload } from "lucide-react"
import { toast } from "sonner"
import { useUploadCertificate } from "@/hooks/use-certificates"
import { useUsers } from "@/hooks/use-users"
import { usePharmacies } from "@/hooks/use-organizations"
import type { OwnerType } from "@/types/certificate.model"

export default function UploadCertificatePage() {
  const router = useRouter()
  const uploadMutation = useUploadCertificate()
  const { data: users = [] } = useUsers()
  const { data: pharmacies = [] } = usePharmacies()

  const [ownerType, setOwnerType] = useState<OwnerType>("USER")
  const [ownerId, setOwnerId] = useState("")
  const [alias, setAlias] = useState("")
  const [password, setPassword] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const doctors = users.filter((u) =>
    u.roles.includes("DOCTOR")
  )

  function validate(): boolean {
    const newErrors: Record<string, string> = {}
    if (!ownerId) newErrors.ownerId = "Selecciona un propietario"
    if (!alias.trim()) newErrors.alias = "El alias es requerido"
    if (!password) newErrors.password = "La contraseña del P12 es requerida"
    if (!file) newErrors.file = "Selecciona un archivo P12"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate() || !file) return

    try {
      const result = await uploadMutation.mutateAsync({
        file,
        ownerType,
        ownerId,
        alias,
        password,
      })
      toast.success("Certificado subido exitosamente")
      router.push(`/dashboard/admin/certificates/${result.id}`)
    } catch {
      toast.error("Error al subir el certificado. Verifica la contraseña del P12.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon-sm"
          render={<Link href="/dashboard/admin/certificates" />}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Subir certificado</h1>
          <p className="text-muted-foreground">
            Carga un certificado P12 para firma electr&oacute;nica
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Propietario</CardTitle>
            <CardDescription>
              Selecciona qui&eacute;n usar&aacute; este certificado para firmar
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Tipo de propietario</Label>
              <Select
                value={ownerType}
                onValueChange={(v) => {
                  if (v) setOwnerType(v as OwnerType)
                  setOwnerId("")
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">Doctor</SelectItem>
                  <SelectItem value="PHARMACY">Farmacia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {ownerType === "USER" ? "Doctor" : "Farmacia"} *
              </Label>
              <Select value={ownerId} onValueChange={(v) => setOwnerId(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {ownerType === "USER"
                    ? doctors.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.fullName} ({u.email})
                        </SelectItem>
                      ))
                    : pharmacies.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
              {errors.ownerId && (
                <p className="text-xs text-destructive">{errors.ownerId}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificado P12</CardTitle>
            <CardDescription>
              Archivo .p12 y contrase&ntilde;a para extraer la informaci&oacute;n
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="alias">Alias *</Label>
              <Input
                id="alias"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Ej: Firma Dr. Pérez 2026"
              />
              {errors.alias && (
                <p className="text-xs text-destructive">{errors.alias}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contrase&ntilde;a del P12 *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña del archivo P12"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password}</p>
              )}
            </div>
            <div className="col-span-full space-y-2">
              <Label htmlFor="file">Archivo P12 *</Label>
              <Input
                id="file"
                type="file"
                accept=".p12,.pfx"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {errors.file && (
                <p className="text-xs text-destructive">{errors.file}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Formatos aceptados: .p12, .pfx (m&aacute;x. 10 MB)
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={uploadMutation.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={uploadMutation.isPending}>
            <Upload className="mr-2 h-4 w-4" />
            {uploadMutation.isPending ? "Subiendo..." : "Subir certificado"}
          </Button>
        </div>
      </form>
    </div>
  )
}
