import type {
  DashboardStatsResponse,
  ConsultationEarningsResponse,
  SalesEarningsResponse,
  PlatformStatsResponse,
  PeriodStatsResponse,
  ClinicRevenueResponse,
  PharmacyRevenueResponse,
  PaymentMethodStatsResponse,
  TopPatientResponse,
  TopCustomerResponse,
  TopProductResponse,
} from "@/types/dashboard.model"

// ─── Helpers ─────────────────────────────────────────────────────────

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  TRANSFER: "Transferencia",
  MIXED: "Mixto",
}

// ─── Mapped types (with formatted fields) ────────────────────────────

export interface PeriodStats {
  consultationsCompleted: number
  consultationRevenue: number
  consultationRevenueFormatted: string
  salesCount: number
  salesRevenue: number
  salesRevenueFormatted: string
  totalRevenue: number
  totalRevenueFormatted: string
}

export interface ClinicRevenue {
  clinicId: string
  clinicName: string
  count: number
  revenue: number
  revenueFormatted: string
}

export interface PharmacyRevenue {
  pharmacyId: string
  pharmacyName: string
  count: number
  revenue: number
  revenueFormatted: string
}

export interface PaymentMethodStat {
  method: string
  methodLabel: string
  count: number
  total: number
  totalFormatted: string
}

export interface TopPatient {
  patientId: string
  name: string
  consultationCount: number
}

export interface TopCustomer {
  customerId: string
  name: string
  purchaseCount: number
  totalSpent: number
  totalSpentFormatted: string
}

export interface TopProduct {
  productId: string
  name: string
  quantitySold: number
  totalRevenue: number
  totalRevenueFormatted: string
}

export interface DashboardStats {
  today: PeriodStats
  thisMonth: PeriodStats
  revenueByClinic: ClinicRevenue[]
  salesByPharmacy: PharmacyRevenue[]
  salesByPaymentMethod: PaymentMethodStat[]
  topPatients: TopPatient[]
  topCustomers: TopCustomer[]
  topProducts: TopProduct[]
}

export interface ConsultationEarnings {
  todayCount: number
  todayRevenue: number
  todayRevenueFormatted: string
  monthCount: number
  monthRevenue: number
  monthRevenueFormatted: string
  revenueByClinic: ClinicRevenue[]
}

export interface SalesEarnings {
  todayCount: number
  todayRevenue: number
  todayRevenueFormatted: string
  monthCount: number
  monthRevenue: number
  monthRevenueFormatted: string
  salesByPharmacy: PharmacyRevenue[]
  salesByPaymentMethod: PaymentMethodStat[]
}

// ─── Mappers ─────────────────────────────────────────────────────────

function mapPeriodStats(raw: PeriodStatsResponse): PeriodStats {
  return {
    consultationsCompleted: raw.consultationsCompleted,
    consultationRevenue: raw.consultationRevenue,
    consultationRevenueFormatted: formatCurrency(raw.consultationRevenue),
    salesCount: raw.salesCount,
    salesRevenue: raw.salesRevenue,
    salesRevenueFormatted: formatCurrency(raw.salesRevenue),
    totalRevenue: raw.totalRevenue,
    totalRevenueFormatted: formatCurrency(raw.totalRevenue),
  }
}

function mapClinicRevenue(raw: ClinicRevenueResponse): ClinicRevenue {
  return {
    ...raw,
    revenueFormatted: formatCurrency(raw.revenue),
  }
}

function mapPharmacyRevenue(raw: PharmacyRevenueResponse): PharmacyRevenue {
  return {
    ...raw,
    revenueFormatted: formatCurrency(raw.revenue),
  }
}

function mapPaymentMethod(raw: PaymentMethodStatsResponse): PaymentMethodStat {
  return {
    method: raw.method,
    methodLabel: PAYMENT_METHOD_LABELS[raw.method] ?? raw.method,
    count: raw.count,
    total: raw.total,
    totalFormatted: formatCurrency(raw.total),
  }
}

function mapTopCustomer(raw: TopCustomerResponse): TopCustomer {
  return {
    ...raw,
    totalSpentFormatted: formatCurrency(raw.totalSpent),
  }
}

function mapTopProduct(raw: TopProductResponse): TopProduct {
  return {
    ...raw,
    totalRevenueFormatted: formatCurrency(raw.totalRevenue),
  }
}

// ─── Public adapters ─────────────────────────────────────────────────

export function toDashboardStats(raw: DashboardStatsResponse): DashboardStats {
  return {
    today: mapPeriodStats(raw.today),
    thisMonth: mapPeriodStats(raw.thisMonth),
    revenueByClinic: raw.revenueByClinic.map(mapClinicRevenue),
    salesByPharmacy: raw.salesByPharmacy.map(mapPharmacyRevenue),
    salesByPaymentMethod: raw.salesByPaymentMethod.map(mapPaymentMethod),
    topPatients: raw.topPatients,
    topCustomers: raw.topCustomers.map(mapTopCustomer),
    topProducts: raw.topProducts.map(mapTopProduct),
  }
}

export function toConsultationEarnings(raw: ConsultationEarningsResponse): ConsultationEarnings {
  return {
    todayCount: raw.todayCount,
    todayRevenue: raw.todayRevenue,
    todayRevenueFormatted: formatCurrency(raw.todayRevenue),
    monthCount: raw.monthCount,
    monthRevenue: raw.monthRevenue,
    monthRevenueFormatted: formatCurrency(raw.monthRevenue),
    revenueByClinic: raw.revenueByClinic.map(mapClinicRevenue),
  }
}

export function toSalesEarnings(raw: SalesEarningsResponse): SalesEarnings {
  return {
    todayCount: raw.todayCount,
    todayRevenue: raw.todayRevenue,
    todayRevenueFormatted: formatCurrency(raw.todayRevenue),
    monthCount: raw.monthCount,
    monthRevenue: raw.monthRevenue,
    monthRevenueFormatted: formatCurrency(raw.monthRevenue),
    salesByPharmacy: raw.salesByPharmacy.map(mapPharmacyRevenue),
    salesByPaymentMethod: raw.salesByPaymentMethod.map(mapPaymentMethod),
  }
}

// ─── Platform Stats (SUPER_ADMIN) ───────────────────────────────────

export interface PlatformStats {
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
    pendingFormatted: string
    collectedAmount: number
    collectedFormatted: string
    waivedAmount: number
    waivedFormatted: string
    thisMonthAmount: number
    thisMonthFormatted: string
  }
  organizationsByPlan: {
    planId: string
    planName: string
    organizationCount: number
  }[]
}

export function toPlatformStats(raw: PlatformStatsResponse): PlatformStats {
  return {
    organizations: raw.organizations,
    users: raw.users,
    plans: raw.plans,
    fees: {
      ...raw.fees,
      pendingFormatted: formatCurrency(raw.fees.pendingAmount),
      collectedFormatted: formatCurrency(raw.fees.collectedAmount),
      waivedFormatted: formatCurrency(raw.fees.waivedAmount),
      thisMonthFormatted: formatCurrency(raw.fees.thisMonthAmount),
    },
    organizationsByPlan: raw.organizationsByPlan,
  }
}
