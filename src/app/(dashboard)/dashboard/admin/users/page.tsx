"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTable } from "@/components/ui/data-table"
import { useUsers, useToggleUserActive } from "@/hooks/use-users"
import { ROLE_LABELS } from "@/adapters/user.adapter"
import type { Role } from "@/types/auth.model"
import { UserPlus, Search, Power } from "lucide-react"
import { toast } from "sonner"

const ROLE_COLORS: Record<Role, string> = {
  SUPER_ADMIN: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  DOCTOR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  NURSE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  PHARMACIST: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  CASHIER: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
}

const FILTERABLE_ROLES: Role[] = [
  "ADMIN",
  "DOCTOR",
  "NURSE",
  "PHARMACIST",
  "CASHIER",
]

export default function UsersPage() {
  const { data: users = [], isLoading } = useUsers()
  const toggleMutation = useToggleUserActive()

  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase()
        const matchesSearch =
          user.fullName.toLowerCase().includes(q) ||
          user.email.toLowerCase().includes(q) ||
          (user.phone ?? "").toLowerCase().includes(q)
        if (!matchesSearch) return false
      }

      // Role filter
      if (roleFilter !== "ALL") {
        if (!user.roles.includes(roleFilter as Role)) return false
      }

      // Status filter
      if (statusFilter === "ACTIVE" && !user.isActive) return false
      if (statusFilter === "INACTIVE" && user.isActive) return false

      return true
    })
  }, [users, search, roleFilter, statusFilter])

  async function handleToggleActive(userId: string, currentName: string, isActive: boolean) {
    const action = isActive ? "desactivar" : "activar"
    try {
      await toggleMutation.mutateAsync(userId)
      toast.success(`Usuario ${currentName} ${isActive ? "desactivado" : "activado"}`)
    } catch {
      toast.error(`Error al ${action} usuario`)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="text-muted-foreground">
            Gestión de usuarios de la organización
          </p>
        </div>
        <Button render={<Link href="/dashboard/admin/users/new" />}>
          <UserPlus className="mr-2 h-4 w-4" />
          Nuevo usuario
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(v) => { if (v) setRoleFilter(v) }}
          items={{
            ALL: "Todos los roles",
            ...Object.fromEntries(FILTERABLE_ROLES.map((r) => [r, ROLE_LABELS[r]])),
          }}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrar por rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos los roles</SelectItem>
            {FILTERABLE_ROLES.map((role) => (
              <SelectItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => { if (v) setStatusFilter(v) }}
          items={{ ALL: "Todos", ACTIVE: "Activos", INACTIVE: "Inactivos" }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="ACTIVE">Activos</SelectItem>
            <SelectItem value="INACTIVE">Inactivos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground">
          {filteredUsers.length} de {users.length} usuario{users.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Table */}
      <DataTable
        isLoading={isLoading}
        isEmpty={filteredUsers.length === 0}
        emptyMessage={
          users.length === 0
            ? "No hay usuarios registrados"
            : "No se encontraron usuarios con los filtros aplicados"
        }
        emptyAction={
          users.length === 0 ? (
            <Button
              variant="link"
              render={<Link href="/dashboard/admin/users/new" />}
            >
              Crear primer usuario
            </Button>
          ) : undefined
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow
                key={user.id}
                className={!user.isActive ? "opacity-60" : undefined}
              >
                <TableCell className="font-medium">
                  {user.fullName}
                </TableCell>
                <TableCell className="text-sm">
                  {user.email}
                </TableCell>
                <TableCell className="text-sm">
                  {user.phone ?? "—"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role}
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[role] ?? ""}`}
                      >
                        {ROLE_LABELS[role]}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={toggleMutation.isPending}
                    onClick={() =>
                      handleToggleActive(user.id, user.fullName, user.isActive)
                    }
                    title={user.isActive ? "Desactivar usuario" : "Activar usuario"}
                  >
                    <Power className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DataTable>
    </div>
  )
}
