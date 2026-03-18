import type {
  PatientResponse,
  AllergyResponse,
  IdType,
  Gender,
  BloodType,
  AllergyType,
  AllergySeverity,
} from "@/types/patient.model"

// ─── Display Label Maps ─────────────────────────────────────────────

export const ID_TYPE_LABELS: Record<IdType, string> = {
  CEDULA: "Cédula",
  PASSPORT: "Pasaporte",
  RUC: "RUC",
}

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: "Masculino",
  FEMALE: "Femenino",
  OTHER: "Otro",
}

export const BLOOD_TYPE_LABELS: Record<BloodType, string> = {
  A_POSITIVE: "A+",
  A_NEGATIVE: "A−",
  B_POSITIVE: "B+",
  B_NEGATIVE: "B−",
  AB_POSITIVE: "AB+",
  AB_NEGATIVE: "AB−",
  O_POSITIVE: "O+",
  O_NEGATIVE: "O−",
}

export const ALLERGY_TYPE_LABELS: Record<AllergyType, string> = {
  MEDICATION: "Medicamento",
  FOOD: "Alimento",
  ENVIRONMENTAL: "Ambiental",
  OTHER: "Otro",
}

export const ALLERGY_SEVERITY_LABELS: Record<AllergySeverity, string> = {
  MILD: "Leve",
  MODERATE: "Moderada",
  SEVERE: "Severa",
}

export const ALLERGY_SEVERITY_COLORS: Record<AllergySeverity, string> = {
  MILD: "bg-yellow-100 text-yellow-800",
  MODERATE: "bg-orange-100 text-orange-800",
  SEVERE: "bg-red-100 text-red-800",
}

// ─── Domain Types ────────────────────────────────────────────────────

export interface Patient {
  id: string
  organizationId: string
  idType: IdType
  idTypeLabel: string
  idNumber: string
  firstName: string
  lastName: string
  fullName: string
  birthDate: string | null
  birthDateFormatted: string | null
  age: number | null
  gender: Gender | null
  genderLabel: string | null
  bloodType: BloodType | null
  bloodTypeLabel: string | null
  address: string | null
  phone: string | null
  email: string | null
  emergencyContactName: string | null
  emergencyContactPhone: string | null
  occupation: string | null
  insuranceProvider: string | null
  insuranceNumber: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Allergy {
  id: string
  patientId: string
  allergyType: AllergyType
  allergyTypeLabel: string
  allergen: string
  severity: AllergySeverity
  severityLabel: string
  severityColor: string
  reaction: string | null
  diagnosedDate: string | null
  diagnosedDateFormatted: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
}

// ─── Transform Functions ─────────────────────────────────────────────

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null
  try {
    return new Intl.DateTimeFormat("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

export function toPatient(response: PatientResponse): Patient {
  return {
    id: response.id,
    organizationId: response.organizationId,
    idType: response.idType,
    idTypeLabel: ID_TYPE_LABELS[response.idType] ?? response.idType,
    idNumber: response.idNumber,
    firstName: response.firstName,
    lastName: response.lastName,
    fullName: response.fullName,
    birthDate: response.birthDate ?? null,
    birthDateFormatted: formatDate(response.birthDate),
    age: response.age ?? null,
    gender: response.gender ?? null,
    genderLabel: response.gender ? (GENDER_LABELS[response.gender] ?? null) : null,
    bloodType: response.bloodType ?? null,
    bloodTypeLabel: response.bloodType
      ? (BLOOD_TYPE_LABELS[response.bloodType] ?? null)
      : null,
    address: response.address ?? null,
    phone: response.phone ?? null,
    email: response.email ?? null,
    emergencyContactName: response.emergencyContactName ?? null,
    emergencyContactPhone: response.emergencyContactPhone ?? null,
    occupation: response.occupation ?? null,
    insuranceProvider: response.insuranceProvider ?? null,
    insuranceNumber: response.insuranceNumber ?? null,
    notes: response.notes ?? null,
    isActive: response.isActive,
    createdAt: response.createdAt,
    updatedAt: response.updatedAt,
  }
}

export function toPatientList(responses: PatientResponse[]): Patient[] {
  return responses.map(toPatient)
}

export function toAllergy(response: AllergyResponse): Allergy {
  return {
    id: response.id,
    patientId: response.patientId,
    allergyType: response.allergyType,
    allergyTypeLabel: ALLERGY_TYPE_LABELS[response.allergyType] ?? response.allergyType,
    allergen: response.allergen,
    severity: response.severity,
    severityLabel: ALLERGY_SEVERITY_LABELS[response.severity] ?? response.severity,
    severityColor: ALLERGY_SEVERITY_COLORS[response.severity] ?? "",
    reaction: response.reaction ?? null,
    diagnosedDate: response.diagnosedDate ?? null,
    diagnosedDateFormatted: formatDate(response.diagnosedDate),
    notes: response.notes ?? null,
    isActive: response.isActive,
    createdAt: response.createdAt,
  }
}

export function toAllergyList(responses: AllergyResponse[]): Allergy[] {
  return responses.map(toAllergy)
}
