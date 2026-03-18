import type { PlanResponse } from "@/types/plan.model"

// ─── Domain Type ────────────────────────────────────────────────────

export interface Plan {
  id: string
  name: string
  code: string
  description: string | null
  monthlyPrice: number
  annualPrice: number
  consultationFee: number
  maxClinics: number
  maxPharmacies: number
  maxUsers: number
  maxPatients: number
  features: Record<string, boolean>
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
  // Computed
  monthlyPriceFormatted: string
  annualPriceFormatted: string
  consultationFeeFormatted: string
}

// ─── Helpers ────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

// ─── Transformers ───────────────────────────────────────────────────

export function toPlan(r: PlanResponse): Plan {
  return {
    id: r.id,
    name: r.name,
    code: r.code,
    description: r.description ?? null,
    monthlyPrice: r.monthlyPrice,
    annualPrice: r.annualPrice,
    consultationFee: r.consultationFee,
    maxClinics: r.maxClinics,
    maxPharmacies: r.maxPharmacies,
    maxUsers: r.maxUsers,
    maxPatients: r.maxPatients,
    features: r.features ?? {},
    isActive: r.isActive,
    sortOrder: r.sortOrder,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    monthlyPriceFormatted: formatCurrency(r.monthlyPrice),
    annualPriceFormatted: formatCurrency(r.annualPrice),
    consultationFeeFormatted: formatCurrency(r.consultationFee),
  }
}

export function toPlanList(rs: PlanResponse[]): Plan[] {
  return rs.map(toPlan)
}
