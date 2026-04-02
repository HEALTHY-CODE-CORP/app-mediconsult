"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  useProfile,
  useChangePassword,
  useUpdateMyBillingProfile,
} from "@/hooks/use-users"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { User, Mail, Phone, Shield, Lock, Eye, EyeOff, FileKey } from "lucide-react"

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Administrador",
  DOCTOR: "Doctor",
  NURSE: "Enfermera",
  PHARMACIST: "Farmacéutico",
  CASHIER: "Cajero",
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const { data: profile, isLoading } = useProfile()
  const changePasswordMutation = useChangePassword()
  const updateBillingProfileMutation = useUpdateMyBillingProfile()
  const userRoles = session?.user?.roles ?? []
  const canManagePersonalCertificate = userRoles.includes("DOCTOR")
  const canManagePersonalBillingProfile = userRoles.includes("DOCTOR")

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [billingDraft, setBillingDraft] = useState<{
    billingLegalName: string
    billingCommercialName: string
    billingRuc: string
    billingEstablishmentCode: string
    billingEmissionPointCode: string
    billingMatrixAddress: string
    billingSpecialTaxpayerCode: string
    billingAccountingRequired: boolean
  } | null>(null)

  const profileBillingData = useMemo(() => {
    return {
      billingLegalName: profile?.billingLegalName ?? "",
      billingCommercialName: profile?.billingCommercialName ?? "",
      billingRuc: profile?.billingRuc ?? "",
      billingEstablishmentCode: profile?.billingEstablishmentCode ?? "",
      billingEmissionPointCode: profile?.billingEmissionPointCode ?? "",
      billingMatrixAddress: profile?.billingMatrixAddress ?? "",
      billingSpecialTaxpayerCode: profile?.billingSpecialTaxpayerCode ?? "",
      billingAccountingRequired: profile?.billingAccountingRequired ?? false,
    }
  }, [profile])

  const billingData = billingDraft ?? profileBillingData

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (newPassword.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres")
      return
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      })
      toast.success("Contraseña actualizada exitosamente")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      toast.error("La contraseña actual es incorrecta")
    }
  }

  function updateBillingField(key: keyof typeof billingData, value: string | boolean) {
    setBillingDraft((prev) => ({
      ...(prev ?? profileBillingData),
      [key]: value,
    }))
  }

  async function handleSaveBillingProfile(e: React.FormEvent) {
    e.preventDefault()

    if (billingData.billingRuc && !/^\d{13}$/.test(billingData.billingRuc)) {
      toast.error("El RUC debe tener exactamente 13 dígitos")
      return
    }

    if (
      billingData.billingEstablishmentCode &&
      !/^\d{3}$/.test(billingData.billingEstablishmentCode)
    ) {
      toast.error("El código de establecimiento debe tener 3 dígitos")
      return
    }

    if (
      billingData.billingEmissionPointCode &&
      !/^\d{3}$/.test(billingData.billingEmissionPointCode)
    ) {
      toast.error("El punto de emisión debe tener 3 dígitos")
      return
    }

    try {
      await updateBillingProfileMutation.mutateAsync({
        billingLegalName: billingData.billingLegalName,
        billingCommercialName: billingData.billingCommercialName,
        billingRuc: billingData.billingRuc,
        billingEstablishmentCode: billingData.billingEstablishmentCode,
        billingEmissionPointCode: billingData.billingEmissionPointCode,
        billingMatrixAddress: billingData.billingMatrixAddress,
        billingSpecialTaxpayerCode: billingData.billingSpecialTaxpayerCode,
        billingAccountingRequired: billingData.billingAccountingRequired,
      })
      setBillingDraft(null)
      toast.success("Perfil de facturación actualizado")
    } catch {
      toast.error("No se pudo actualizar el perfil de facturación")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
          <p className="text-muted-foreground">Cargando información...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-5 w-40 animate-pulse rounded bg-muted" />
                <div className="h-4 w-60 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-10 animate-pulse rounded bg-muted" />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Información de tu cuenta y configuración de seguridad
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Información Personal
            </CardTitle>
            <CardDescription>
              Datos de tu cuenta en MediConsult
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Nombre completo
              </Label>
              <p className="text-sm font-medium">
                {profile?.firstName} {profile?.lastName}
              </p>
            </div>

            <Separator />

            <div className="space-y-1">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3 w-3" />
                Correo electrónico
              </Label>
              <p className="text-sm font-medium">{profile?.email}</p>
            </div>

            <Separator />

            <div className="space-y-1">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                Teléfono
              </Label>
              <p className="text-sm font-medium">
                {profile?.phone || "No registrado"}
              </p>
            </div>

            <Separator />

            <div className="space-y-1">
              <Label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Shield className="h-3 w-3" />
                Roles
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {(session?.user?.roles ?? []).map((role) => (
                  <Badge key={role} variant="secondary">
                    {ROLE_LABELS[role] ?? role}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                Miembro desde
              </Label>
              <p className="text-sm font-medium">
                {profile?.createdAtFormatted}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Cambiar Contraseña
            </CardTitle>
            <CardDescription>
              Actualiza tu contraseña de acceso al sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Contraseña actual</Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Tu contraseña actual"
                    required
                    disabled={changePasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrent ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                    disabled={changePasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showNew ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la nueva contraseña"
                    required
                    minLength={8}
                    disabled={changePasswordMutation.isPending}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-destructive">
                    Las contraseñas no coinciden
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={
                  changePasswordMutation.isPending ||
                  !currentPassword ||
                  !newPassword ||
                  newPassword !== confirmPassword
                }
              >
                {changePasswordMutation.isPending
                  ? "Actualizando..."
                  : "Actualizar contraseña"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {canManagePersonalBillingProfile && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle>Perfil de Facturación Personal</CardTitle>
            <CardDescription>
              Completa estos datos si vas a emitir facturas de consulta a nombre del médico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveBillingProfile} className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="billing-legal-name">Razón social</Label>
                <Input
                  id="billing-legal-name"
                  value={billingData.billingLegalName}
                  onChange={(e) => updateBillingField("billingLegalName", e.target.value)}
                  placeholder="Nombre legal del médico"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-commercial-name">Nombre comercial</Label>
                <Input
                  id="billing-commercial-name"
                  value={billingData.billingCommercialName}
                  onChange={(e) => updateBillingField("billingCommercialName", e.target.value)}
                  placeholder="Consultorio / marca comercial"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-ruc">RUC</Label>
                <Input
                  id="billing-ruc"
                  value={billingData.billingRuc}
                  onChange={(e) => updateBillingField("billingRuc", e.target.value)}
                  inputMode="numeric"
                  maxLength={13}
                  placeholder="1002090320001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-special-code">Contribuyente especial</Label>
                <Input
                  id="billing-special-code"
                  value={billingData.billingSpecialTaxpayerCode}
                  onChange={(e) =>
                    updateBillingField("billingSpecialTaxpayerCode", e.target.value)
                  }
                  maxLength={13}
                  placeholder="Opcional"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-estab">Código establecimiento</Label>
                <Input
                  id="billing-estab"
                  value={billingData.billingEstablishmentCode}
                  onChange={(e) =>
                    updateBillingField("billingEstablishmentCode", e.target.value)
                  }
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-pto-emi">Punto de emisión</Label>
                <Input
                  id="billing-pto-emi"
                  value={billingData.billingEmissionPointCode}
                  onChange={(e) =>
                    updateBillingField("billingEmissionPointCode", e.target.value)
                  }
                  inputMode="numeric"
                  maxLength={3}
                  placeholder="001"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="billing-matrix-address">Dirección matriz</Label>
                <Input
                  id="billing-matrix-address"
                  value={billingData.billingMatrixAddress}
                  onChange={(e) =>
                    updateBillingField("billingMatrixAddress", e.target.value)
                  }
                  placeholder="Dirección tributaria"
                />
              </div>
              <div className="sm:col-span-2 rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium">Obligado a llevar contabilidad</p>
                    <p className="text-xs text-muted-foreground">
                      Se reporta al SRI como obligadoContabilidad.
                    </p>
                  </div>
                  <Switch
                    id="billing-accounting-required"
                    checked={billingData.billingAccountingRequired}
                    onCheckedChange={(checked) =>
                      updateBillingField("billingAccountingRequired", checked)
                    }
                  />
                </div>
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={updateBillingProfileMutation.isPending}>
                  {updateBillingProfileMutation.isPending
                    ? "Guardando..."
                    : "Guardar perfil de facturación"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {canManagePersonalCertificate && (
        <Card className="border-border/70">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileKey className="h-5 w-5" />
              Certificado de Firma
            </CardTitle>
            <CardDescription>
              Configura tu certificado personal P12 para firma electrónica.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Este certificado es personal y se usa para firmar facturas electrónicas.
            </p>
            <Button
              variant="outline"
              render={<Link href="/dashboard/profile/certificate" />}
            >
              Gestionar mi certificado
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
