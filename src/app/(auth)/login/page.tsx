"use client"

import { useState, useTransition } from "react"
import { loginAction } from "@/actions/auth.actions"
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
import { Stethoscope, Shield } from "lucide-react"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isPlatformLogin, setIsPlatformLogin] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      organizationId: isPlatformLogin
        ? undefined
        : (formData.get("organizationId") as string),
      email: formData.get("email") as string,
      password: formData.get("password") as string,
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
              <Label htmlFor="organizationId">ID de Organización</Label>
              <Input
                id="organizationId"
                name="organizationId"
                placeholder="ID de tu organización"
                required={!isPlatformLogin}
                disabled={isPending}
              />
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
