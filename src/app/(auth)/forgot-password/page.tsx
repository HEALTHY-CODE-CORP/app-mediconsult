"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { getActiveOrganizations } from "@/actions/auth.actions"
import { Button } from "@/components/ui/button"
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ArrowLeft, Mail, Shield, Stethoscope } from "lucide-react"

interface OrgOption {
  id: string
  name: string
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isPlatform, setIsPlatform] = useState(false)
  const [organizations, setOrganizations] = useState<OrgOption[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    getActiveOrganizations()
      .then((orgs) => setOrganizations(orgs))
      .finally(() => setIsLoadingOrgs(false))
  }, [])

  const orgItems = organizations.reduce<Record<string, string>>(
    (acc, org) => ({ ...acc, [org.id]: org.name }),
    {}
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/bff/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          organizationId: isPlatform ? null : selectedOrgId || null,
        }),
      })

      // Always show success to prevent email enumeration
      if (res.ok || res.status === 200) {
        setSubmitted(true)
      } else {
        setSubmitted(true)
      }
    } catch {
      setSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Mail className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Revisa tu correo
          </CardTitle>
          <CardDescription>
            Si el correo <strong>{email}</strong> está registrado, recibirás un
            enlace para restablecer tu contraseña. El enlace expira en 30
            minutos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/login" />}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio de sesión
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          {isPlatform ? (
            <Shield className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">
          ¿Olvidaste tu contraseña?
        </CardTitle>
        <CardDescription>
          Ingresa tu correo y te enviaremos un enlace para restablecerla
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isPlatform && (
            <div className="space-y-2">
              <Label>Organización</Label>
              <Select
                value={selectedOrgId}
                onValueChange={setSelectedOrgId}
                items={orgItems}
                disabled={isSubmitting || isLoadingOrgs}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingOrgs
                        ? "Cargando organizaciones..."
                        : "Selecciona tu organización"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || (!isPlatform && !selectedOrgId)}
          >
            {isSubmitting ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>

          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsPlatform((prev) => !prev)
                setSelectedOrgId("")
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isPlatform
                ? "Soy usuario de organización"
                : "Acceso de plataforma"}
            </button>
            <Link
              href="/login"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
