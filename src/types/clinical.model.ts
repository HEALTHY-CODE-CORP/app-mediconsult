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

export interface Cie10CodeResponse {
  id: string
  code: string
  description: string
  version: string
}

export type DiagnosisType = "PRESUMPTIVE" | "DEFINITIVE"
export type DiagnosisRole = "PRIMARY" | "SECONDARY"

export interface ConsultationDiagnosisRequest {
  cie10Id: string
  diagnosisType: DiagnosisType
  diagnosisRole: DiagnosisRole
  notes?: string
}

export interface ConsultationDiagnosisResponse {
  id: string
  cie10Id?: string
  cie10Code: string
  cie10Description: string
  diagnosisType: DiagnosisType
  diagnosisRole: DiagnosisRole
  notes?: string
}

export interface CreateConsultationRequest {
  medicalRecordId: string
  clinicId: string
  vitalSignsId?: string
  cost?: number
  reasonForVisit: string
  currentIllness?: string
  physicalExamination?: string
  diagnosisCode?: string
  diagnosisDescription?: string
  procedures?: string
  treatment?: string
  notes?: string
  diagnoses?: ConsultationDiagnosisRequest[]
}

export interface UpdateConsultationRequest {
  cost?: number
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
  cost: number
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
  diagnoses?: ConsultationDiagnosisResponse[]
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

export type MedicalCertificateStatus = "DRAFT" | "ISSUED" | "SIGNED" | "VOID"

export interface SignaturePlacementValue {
  pageMode: "LAST" | "INDEX"
  pageNumber?: number
  x: number
  y: number
  width: number
  height: number
}

export interface MedicalCertificateTemplateResponse {
  id: string
  name: string
  description?: string
  contentTemplate: string
  isSystem: boolean
  isActive: boolean
  defaultSignaturePlacement?: SignaturePlacementValue
}

export interface CreateMedicalCertificateTemplateRequest {
  name: string
  description?: string
  contentTemplate: string
}

export interface UpdateMedicalCertificateTemplateRequest {
  name: string
  description?: string
  contentTemplate: string
}

export interface CreateMedicalCertificateRequest {
  templateId?: string
  title?: string
  certificateDate?: string
  restDays?: number
  restStartDate?: string
  restEndDate?: string
  diagnosisSummary?: string
  purpose?: string
  content?: string
}

export interface UpdateMedicalCertificateRequest {
  title?: string
  certificateDate?: string
  restDays?: number
  restStartDate?: string
  restEndDate?: string
  diagnosisSummary?: string
  purpose?: string
  content?: string
}

export interface VoidMedicalCertificateRequest {
  reason: string
}

export interface SendMedicalCertificateEmailRequest {
  recipientEmail?: string
}

export interface SendMedicalCertificateEmailResponse {
  certificateId: string
  recipientEmail: string
  sentAt: string
}

export interface SignaturePlacementRequest {
  pageMode?: "LAST" | "INDEX"
  pageNumber?: number
  x?: number
  y?: number
  width?: number
  height?: number
}

export interface SignMedicalCertificateRequest {
  signaturePlacement?: SignaturePlacementRequest
}

export interface MedicalCertificateResponse {
  id: string
  consultationId: string
  patientId: string
  patientName: string
  patientEmail?: string
  patientIdType: string
  patientIdNumber: string
  doctorId: string
  doctorName: string
  clinicId?: string
  clinicName?: string
  templateId?: string
  templateName?: string
  templateDefaultSignaturePlacement?: SignaturePlacementValue
  status: MedicalCertificateStatus
  title: string
  certificateDate: string
  restDays: number
  restStartDate?: string
  restEndDate?: string
  diagnosisSummary?: string
  purpose?: string
  content: string
  issuedAt?: string
  issuedById?: string
  issuedByName?: string
  signedAt?: string
  signedById?: string
  signedByName?: string
  signedCertificateId?: string
  signedCertificateAlias?: string
  signaturePage?: number
  signatureRect?: string
  voidedAt?: string
  voidedById?: string
  voidedByName?: string
  voidReason?: string
  createdById: string
  createdByName: string
  createdAt: string
  updatedAt: string
}
