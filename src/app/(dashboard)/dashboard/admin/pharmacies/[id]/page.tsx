"use client"

import { use } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePharmacy, useDeletePharmacy } from "@/hooks/use-organizations"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Store,
  Phone,
  Mail,
  MapPin,
} from "lucide-react"
import { toast } from "sonner"

interface PharmacyDetailPageProps {
  params: Promise<{ id: string }>
}

export default function PharmacyDetailPage({ params }: PharmacyDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { data: pharmacy, isLoading } = usePharmacy(id)
  const deleteMutation = useDeletePharmacy()

  async function handleDelete() {
    if (!confirm("¿Estás seguro de eliminar esta farmacia?")) return
    try {
      await deleteMutation.mutateAsync(id)
      toast.success("Farmacia eliminada")
      router.push("/dashboard/admin/pharmacies")
    } catch {
      toast.error("Error al eliminar la farmacia")
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  if (!pharmacy) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">Farmacia no encontrada</p>
        <Button variant="link" className="mt-2" render={<Link href="/dashboard/admin/pharmacies" />}>
          Volver a farmacias
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon-sm" render={<Link href="/dashboard/admin/pharmacies" />}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{pharmacy.name}</h1>
              <Badge variant={pharmacy.isActive ? "default" : "secondary"}>
                {pharmacy.isActive ? "Activa" : "Inactiva"}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            render={<Link href={`/dashboard/admin/pharmacies/${id}/edit`} />}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Información general
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow icon={<MapPin className="h-4 w-4" />} label="Dirección" value={pharmacy.address} />
          <InfoRow icon={<Phone className="h-4 w-4" />} label="Teléfono" value={pharmacy.phone} />
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={pharmacy.email} />
        </CardContent>
      </Card>
    </div>
  )
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string | null
}) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value ?? "—"}</p>
      </div>
    </div>
  )
}
