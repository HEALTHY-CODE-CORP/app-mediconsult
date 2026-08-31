export type IdType = "CEDULA" | "PASSPORT" | "RUC"
export type Gender = "MALE" | "FEMALE" | "OTHER"
export type BloodType =
  | "A_POSITIVE" | "A_NEGATIVE"
  | "B_POSITIVE" | "B_NEGATIVE"
  | "AB_POSITIVE" | "AB_NEGATIVE"
  | "O_POSITIVE" | "O_NEGATIVE"
export type MaritalStatus = "SINGLE" | "MARRIED" | "COMMON_LAW" | "DIVORCED" | "WIDOWED" | "NOT_SPECIFIED"
export type EducationLevel = "SCHOOL" | "SECONDARY" | "HIGHER" | "NONE" | "NOT_SPECIFIED"
export type AllergyType = "MEDICATION" | "FOOD" | "ENVIRONMENTAL" | "OTHER"
export type AllergySeverity = "MILD" | "MODERATE" | "SEVERE"

export interface CreatePatientRequest {
  idType: IdType
  idNumber: string
  firstName: string
  lastName: string
  birthDate?: string
  gender?: Gender
  bloodType?: BloodType
  address?: string
  phone?: string
  email?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  occupation?: string
  maritalStatus?: MaritalStatus
  numberOfChildren?: number
  birthCountry?: string
  birthProvince?: string
  birthCity?: string
  residencePlace?: string
  currentOccupation?: string
  educationLevel?: EducationLevel
  insuranceProvider?: string
  insuranceNumber?: string
  notes?: string
}

export type UpdatePatientRequest = Partial<CreatePatientRequest>

export interface PatientResponse {
  id: string
  organizationId: string
  idType: IdType
  idNumber: string
  firstName: string
  lastName: string
  fullName: string
  birthDate?: string
  age?: number
  gender?: Gender
  bloodType?: BloodType
  address?: string
  phone?: string
  email?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  occupation?: string
  maritalStatus?: MaritalStatus
  numberOfChildren?: number
  birthCountry?: string
  birthProvince?: string
  birthCity?: string
  residencePlace?: string
  currentOccupation?: string
  educationLevel?: EducationLevel
  insuranceProvider?: string
  insuranceNumber?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateAllergyRequest {
  allergyType: AllergyType
  allergen: string
  severity: AllergySeverity
  reaction?: string
  diagnosedDate?: string
  notes?: string
}

export interface AllergyResponse {
  id: string
  patientId: string
  allergyType: AllergyType
  allergen: string
  severity: AllergySeverity
  reaction?: string
  diagnosedDate?: string
  notes?: string
  isActive: boolean
  createdAt: string
}
