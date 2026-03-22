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
import { useDashboardStats } from "@/hooks/use-dashboard"
import {
  ClipboardList,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Users,
  Package,
  UserCheck,
} from "lucide-react"

export function OrgDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!stats) return null

  return (
    <div className="space-y-6">
      {/* Summary Cards — Today */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Consultas hoy"
          value={stats.today.consultationsCompleted.toString()}
          subtitle={stats.today.consultationRevenueFormatted}
          icon={ClipboardList}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
        />
        <SummaryCard
          title="Ventas hoy"
          value={stats.today.salesCount.toString()}
          subtitle={stats.today.salesRevenueFormatted}
          icon={ShoppingCart}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <SummaryCard
          title="Ingreso hoy"
          value={stats.today.totalRevenueFormatted}
          subtitle="Consultas + Ventas"
          icon={DollarSign}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-100"
        />
        <SummaryCard
          title="Ingreso del mes"
          value={stats.thisMonth.totalRevenueFormatted}
          subtitle={`${stats.thisMonth.consultationsCompleted} consultas · ${stats.thisMonth.salesCount} ventas`}
          icon={TrendingUp}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      {/* Revenue breakdowns — side by side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Revenue by Clinic */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ingresos por Clínica</CardTitle>
            <CardDescription>Consultas completadas este mes</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.revenueByClinic.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos este mes</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Clínica</TableHead>
                    <TableHead className="text-right">Consultas</TableHead>
                    <TableHead className="text-right">Ingreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.revenueByClinic.map((c) => (
                    <TableRow key={c.clinicId}>
                      <TableCell className="font-medium">{c.clinicName}</TableCell>
                      <TableCell className="text-right">{c.count}</TableCell>
                      <TableCell className="text-right font-bold">{c.revenueFormatted}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Pharmacy */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ingresos por Farmacia</CardTitle>
            <CardDescription>Ventas completadas este mes</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.salesByPharmacy.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos este mes</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Farmacia</TableHead>
                    <TableHead className="text-right">Ventas</TableHead>
                    <TableHead className="text-right">Ingreso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.salesByPharmacy.map((p) => (
                    <TableRow key={p.pharmacyId}>
                      <TableCell className="font-medium">{p.pharmacyName}</TableCell>
                      <TableCell className="text-right">{p.count}</TableCell>
                      <TableCell className="text-right font-bold">{p.revenueFormatted}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment methods */}
      {stats.salesByPaymentMethod.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Ventas por Método de Pago</CardTitle>
            <CardDescription>Distribución de este mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.salesByPaymentMethod.map((pm) => (
                <div
                  key={pm.method}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{pm.methodLabel}</p>
                    <p className="text-xs text-muted-foreground">{pm.count} ventas</p>
                  </div>
                  <p className="text-sm font-bold">{pm.totalFormatted}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top lists */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top Patients */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-base">Top Pacientes</CardTitle>
            </div>
            <CardDescription>Más consultas este mes</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topPatients.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {stats.topPatients.map((p, i) => (
                  <div key={p.patientId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {i + 1}
                      </span>
                      <span className="text-sm">{p.name}</span>
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {p.consultationCount} consultas
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <CardTitle className="text-base">Top Clientes</CardTitle>
            </div>
            <CardDescription>Mayor gasto este mes</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topCustomers.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {stats.topCustomers.map((c, i) => (
                  <div key={c.customerId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-sm">{c.name}</span>
                        <p className="text-xs text-muted-foreground">{c.purchaseCount} compras</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{c.totalSpentFormatted}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-orange-600" />
              <CardTitle className="text-base">Top Productos</CardTitle>
            </div>
            <CardDescription>Más vendidos este mes</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-3">
                {stats.topProducts.map((p, i) => (
                  <div key={p.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                        {i + 1}
                      </span>
                      <div>
                        <span className="text-sm">{p.name}</span>
                        <p className="text-xs text-muted-foreground">{p.quantitySold} unidades</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">{p.totalRevenueFormatted}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Accesos Rápidos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              title: "Pacientes",
              description: "Gestionar pacientes registrados",
              icon: Users,
              href: "/dashboard/patients",
            },
            {
              title: "Consultas",
              description: "Ver consultas médicas",
              icon: ClipboardList,
              href: "/dashboard/clinical/consultations",
            },
            {
              title: "Inventario",
              description: "Control de productos",
              icon: Package,
              href: "/dashboard/pharmacy/inventory",
            },
            {
              title: "Ventas",
              description: "Registro de ventas",
              icon: ShoppingCart,
              href: "/dashboard/pharmacy/sales",
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

function DashboardSkeleton() {
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
