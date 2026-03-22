"use client"

import { useState, useEffect, useTransition } from "react"
import Link from "next/link"
import { loginAction, getActiveOrganizations } from "@/actions/auth.actions"
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
import { Stethoscope, Shield } from "lucide-react"

interface OrgOption {
  id: string
  name: string
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isPlatformLogin, setIsPlatformLogin] = useState(false)
  const [organizations, setOrganizations] = useState<OrgOption[]>([])
  const [selectedOrgId, setSelectedOrgId] = useState("")
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true)

  useEffect(() => {
    getActiveOrganizations()
      .then((orgs) => setOrganizations(orgs))
      .finally(() => setIsLoadingOrgs(false))
  }, [])

  const orgItems = organizations.reduce<Record<string, string>>(
    (acc, org) => ({ ...acc, [org.id]: org.name }),
    {}
  )

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      organizationId: isPlatformLogin ? undefined : selectedOrgId,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    }

    if (!isPlatformLogin && !selectedOrgId) {
      setError("Selecciona una organización")
      return
    }

    startTransition(async () => {
      const result = await loginAction(data)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-2 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          {isPlatformLogin ? (
            <Shield className="h-6 w-6 text-primary-foreground" />
          ) : (
            <Stethoscope className="h-6 w-6 text-primary-foreground" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold">MediConsult</CardTitle>
        <CardDescription>
          {isPlatformLogin
            ? "Acceso de administrador de plataforma"
            : "Ingresa tus credenciales para acceder al sistema"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isPlatformLogin && (
            <div className="space-y-2">
              <Label>Organización</Label>
              <Select
                value={selectedOrgId}
                onValueChange={(v) => setSelectedOrgId(v ?? "")}
                items={orgItems}
                disabled={isPending || isLoadingOrgs}
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
              name="email"
              type="email"
              placeholder="correo@ejemplo.com"
              required
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Tu contraseña"
              required
              disabled={isPending}
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Ingresando..." : "Ingresar"}
          </Button>

          <div className="text-center">
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                setIsPlatformLogin((prev) => !prev)
                setError(null)
              }}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {isPlatformLogin
                ? "Iniciar sesión como usuario de organización"
                : "Acceso de plataforma"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
