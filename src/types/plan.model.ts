// ─── Plan API Types ─────────────────────────────────────────────────

export interface PlanResponse {
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
}

export interface CreatePlanRequest {
  name: string
  code: string
  description?: string
  monthlyPrice: number
  annualPrice: number
  consultationFee: number
  maxClinics: number
  maxPharmacies: number
  maxUsers: number
  maxPatients: number
  features?: Record<string, boolean>
  sortOrder?: number
}

export interface UpdatePlanRequest {
  name?: string
  description?: string
  monthlyPrice?: number
  annualPrice?: number
  consultationFee?: number
  maxClinics?: number
  maxPharmacies?: number
  maxUsers?: number
  maxPatients?: number
  features?: Record<string, boolean>
  isActive?: boolean
  sortOrder?: number
}
