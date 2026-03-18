export type FeeStatus = "PENDING" | "COLLECTED" | "WAIVED"

export interface PlatformFeeResponse {
  id: string
  organizationId: string
  organizationName: string
  invoiceId: string
  invoiceNumber: string
  consultationId: string
  planName?: string
  feeAmount: number
  feeDescription: string
  status: FeeStatus
  collectedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface PlatformFeeSummary {
  totalPending: number
  totalCollected: number
  totalWaived: number
  totalFees: number
  feeCount: number
}

export interface OrganizationFeeSummary {
  organizationId: string
  organizationName: string
  totalPending: number
  totalCollected: number
  feeCount: number
  effectiveConsultationFee: number
}
