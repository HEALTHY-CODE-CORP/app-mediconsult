export type ConsultationStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
export type ReferralStatus = "PENDING" | "SENT" | "ACCEPTED" | "REJECTED"
export type BmiCategory = "UNDERWEIGHT" | "NORMAL" | "OVERWEIGHT" | "OBESE"

export interface CreateMedicalRecordRequest {
  patientId: string
  clinicId?: string
  personalHistory?: string
  familyHistory?: string
  surgicalHistory?: string
  currentMedications?: string
}

export interface UpdateMedicalRecordRequest {
  personalHistory?: string
  familyHistory?: string
  surgicalHistory?: string
  currentMedications?: string
}

export interface MedicalRecordResponse {
  id: string
  patientId: string
  patientName: string
  patientIdNumber: string
  organizationId: string
  clinicId?: string
  clinicName?: string
  recordNumber: string
  personalHistory?: string
  familyHistory?: string
  surgicalHistory?: string
  currentMedications?: string
  openedAt: string
  openedByName: string
  createdAt: string
  updatedAt: string
}

export interface CreateVitalSignsRequest {
  medicalRecordId: string
  systolicPressure?: number
  diastolicPressure?: number
  heartRate?: number
  respiratoryRate?: number
  temperature?: number
  oxygenSaturation?: number
  weight?: number
  height?: number
  notes?: string
}

export interface VitalSignsResponse {
  id: string
  medicalRecordId: string
  recordedById: string
  recordedByName: string
  systolicPressure?: number
  diastolicPressure?: number
  bloodPressure?: string
  heartRate?: number
  respiratoryRate?: number
  temperature?: number
  oxygenSaturation?: number
  weight?: number
  height?: number
  bmi?: number
  bmiCategory?: BmiCategory
  notes?: string
  recordedAt: string
}

export interface CreateConsultationRequest {
  medicalRecordId: string
  clinicId: string
  vitalSignsId?: string
  reasonForVisit: string
  currentIllness?: string
  physicalExamination?: string
  diagnosisCode?: string
  diagnosisDescription?: string
  procedures?: string
  treatment?: string
  notes?: string
}

export interface UpdateConsultationRequest {
  reasonForVisit?: string
  currentIllness?: string
  physicalExamination?: string
  diagnosisCode?: string
  diagnosisDescription?: string
  procedures?: string
  treatment?: string
  notes?: string
}

export interface ConsultationResponse {
  id: string
  medicalRecordId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  clinicId: string
  clinicName: string
  vitalSignsId?: string
  consultationDate: string
  reasonForVisit: string
  currentIllness?: string
  physicalExamination?: string
  diagnosisCode?: string
  diagnosisDescription?: string
  procedures?: string
  treatment?: string
  notes?: string
  status: ConsultationStatus
  createdAt: string
  updatedAt: string
}

export interface CreateEvolutionNoteRequest {
  note: string
}

export interface EvolutionNoteResponse {
  id: string
  consultationId: string
  doctorId: string
  doctorName: string
  note: string
  createdAt: string
}

export interface CreateReferralRequest {
  destinationFacility: string
  destinationService: string
  reason: string
  clinicalSummary?: string
}

export interface ReferralResponse {
  id: string
  consultationId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  destinationFacility: string
  destinationService: string
  reason: string
  clinicalSummary?: string
  status: ReferralStatus
  createdAt: string
}
