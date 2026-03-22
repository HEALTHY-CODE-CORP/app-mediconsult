"use client"

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
import { usePlatformStats } from "@/hooks/use-dashboard"
import {
  Building,
  Users,
  CreditCard,
  Coins,
  TrendingUp,
} from "lucide-react"

export function PlatformDashboard() {
  const { data: stats, isLoading } = usePlatformStats()

  if (isLoading) {
    return <PlatformSkeleton />
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Organizaciones"
          value={stats.organizations.active.toString()}
          subtitle={`${stats.organizations.total} total · ${stats.organizations.newThisMonth} nuevas este mes`}
          icon={Building}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <SummaryCard
          title="Usuarios"
          value={stats.users.active.toString()}
          subtitle={`${stats.users.total} total · ${stats.users.active} activos`}
          icon={Users}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <SummaryCard
          title="Planes"
          value={`${stats.plans.activePlans}/${stats.plans.totalPlans}`}
          subtitle="Planes activos / total"
          icon={CreditCard}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
        <SummaryCard
          title="Tarifas pendientes"
          value={stats.fees.pendingFormatted}
          subtitle={`${stats.fees.thisMonthFormatted} generado este mes`}
          icon={Coins}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
        />
      </div>

      {/* Breakdowns — side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Distribution by Plan */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Distribución por Plan</CardTitle>
            <CardDescription>Organizaciones activas por plan</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.organizationsByPlan.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead className="text-right">Organizaciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.organizationsByPlan.map((p) => (
                    <TableRow key={p.planId}>
                      <TableCell className="font-medium">{p.planName}</TableCell>
                      <TableCell className="text-right font-bold">{p.organizationCount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Fee Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <CardTitle className="text-base">Resumen de Tarifas</CardTitle>
            </div>
            <CardDescription>Estado de tarifas por consultas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Cobradas</p>
                  <p className="text-xs text-muted-foreground">Total histórico</p>
                </div>
                <p className="text-sm font-bold text-green-600">{stats.fees.collectedFormatted}</p>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Pendientes</p>
                  <p className="text-xs text-muted-foreground">Por cobrar</p>
                </div>
                <p className="text-sm font-bold text-amber-600">{stats.fees.pendingFormatted}</p>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Condonadas</p>
                  <p className="text-xs text-muted-foreground">Total histórico</p>
                </div>
                <p className="text-sm font-bold text-muted-foreground">{stats.fees.waivedFormatted}</p>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="text-sm font-medium">Este mes</p>
                  <p className="text-xs text-muted-foreground">Generado</p>
                </div>
                <p className="text-sm font-bold">{stats.fees.thisMonthFormatted}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Accesos Rápidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Organizaciones",
              description: "Gestionar organizaciones registradas",
              icon: Building,
              href: "/dashboard/platform/organizations",
            },
            {
              title: "Planes",
              description: "Administrar planes de suscripción",
              icon: CreditCard,
              href: "/dashboard/platform/plans",
            },
            {
              title: "Tarifas de Plataforma",
              description: "Ver y cobrar tarifas pendientes",
              icon: Coins,
              href: "/dashboard/platform/platform-fees",
            },
          ].map((action) => (
            <a key={action.href} href={action.href}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="flex flex-row items-center gap-3 space-y-0 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <action.icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle className="text-sm font-medium">
                    {action.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{action.description}</CardDescription>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Helper Components ─────────────────────────────────────────────

function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBg,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  iconBg: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PlatformSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
