// === API Response types (raw from backend) ===

export interface PeriodStatsResponse {
  consultationsCompleted: number
  consultationRevenue: number
  salesCount: number
  salesRevenue: number
  totalRevenue: number
}

export interface ClinicRevenueResponse {
  clinicId: string
  clinicName: string
  count: number
  revenue: number
}

export interface PharmacyRevenueResponse {
  pharmacyId: string
  pharmacyName: string
  count: number
  revenue: number
}

export interface PaymentMethodStatsResponse {
  method: string
  count: number
  total: number
}

export interface TopPatientResponse {
  patientId: string
  name: string
  consultationCount: number
}

export interface TopCustomerResponse {
  customerId: string
  name: string
  purchaseCount: number
  totalSpent: number
}

export interface TopProductResponse {
  productId: string
  name: string
  quantitySold: number
  totalRevenue: number
}

export interface DashboardStatsResponse {
  today: PeriodStatsResponse
  thisMonth: PeriodStatsResponse
  revenueByClinic: ClinicRevenueResponse[]
  salesByPharmacy: PharmacyRevenueResponse[]
  salesByPaymentMethod: PaymentMethodStatsResponse[]
  topPatients: TopPatientResponse[]
  topCustomers: TopCustomerResponse[]
  topProducts: TopProductResponse[]
}

export interface ConsultationEarningsResponse {
  todayCount: number
  todayRevenue: number
  monthCount: number
  monthRevenue: number
  revenueByClinic: ClinicRevenueResponse[]
}

export interface SalesEarningsResponse {
  todayCount: number
  todayRevenue: number
  monthCount: number
  monthRevenue: number
  salesByPharmacy: PharmacyRevenueResponse[]
  salesByPaymentMethod: PaymentMethodStatsResponse[]
}

// === Platform Dashboard (SUPER_ADMIN) ===

export interface PlatformStatsResponse {
  organizations: {
    total: number
    active: number
    inactive: number
    newThisMonth: number
  }
  users: {
    total: number
    active: number
  }
  plans: {
    totalPlans: number
    activePlans: number
  }
  fees: {
    pendingAmount: number
    collectedAmount: number
    waivedAmount: number
    thisMonthAmount: number
  }
  organizationsByPlan: {
    planId: string
    planName: string
    organizationCount: number
  }[]
}
