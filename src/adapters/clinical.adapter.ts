import type {
  MedicalRecordResponse,
  VitalSignsResponse,
  ConsultationResponse,
  EvolutionNoteResponse,
  ReferralResponse,
  MedicalCertificateResponse,
  MedicalCertificateTemplateResponse,
  ConsultationStatus,
  ReferralStatus,
  BmiCategory,
  MedicalCertificateStatus,
} from "@/types/clinical.model"

// ─── Label maps ──────────────────────────────────────────────────────

export const CONSULTATION_STATUS_LABELS: Record<ConsultationStatus, string> = {
  IN_PROGRESS: "En curso",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
}

export const CONSULTATION_STATUS_COLORS: Record<ConsultationStatus, string> = {
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export const REFERRAL_STATUS_LABELS: Record<ReferralStatus, string> = {
  PENDING: "Pendiente",
  SENT: "Enviada",
  ACCEPTED: "Aceptada",
  REJECTED: "Rechazada",
}

export const REFERRAL_STATUS_COLORS: Record<ReferralStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  SENT: "bg-blue-100 text-blue-800",
  ACCEPTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
}

export const MEDICAL_CERTIFICATE_STATUS_LABELS: Record<MedicalCertificateStatus, string> = {
  DRAFT: "Borrador",
  ISSUED: "Emitido",
  VOID: "Anulado",
}

export const MEDICAL_CERTIFICATE_STATUS_COLORS: Record<MedicalCertificateStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-800",
  ISSUED: "bg-green-100 text-green-800",
  VOID: "bg-red-100 text-red-800",
}

export const BMI_CATEGORY_LABELS: Record<BmiCategory, string> = {
  UNDERWEIGHT: "Bajo peso",
  NORMAL: "Normal",
  OVERWEIGHT: "Sobrepeso",
  OBESE: "Obesidad",
}

export const BMI_CATEGORY_COLORS: Record<BmiCategory, string> = {
  UNDERWEIGHT: "text-blue-600",
  NORMAL: "text-green-600",
  OVERWEIGHT: "text-orange-600",
  OBESE: "text-red-600",
}

// ─── Domain types ────────────────────────────────────────────────────

export interface MedicalRecord {
  id: string
  patientId: string
  patientName: string
  patientIdNumber: string
  organizationId: string
  clinicId: string | null
  clinicName: string | null
  recordNumber: string
  personalHistory: string | null
  familyHistory: string | null
  surgicalHistory: string | null
  currentMedications: string | null
  openedAt: string
  openedAtFormatted: string
  openedByName: string
  createdAt: string
  updatedAt: string
}

export interface VitalSigns {
  id: string
  medicalRecordId: string
  recordedById: string
  recordedByName: string
  systolicPressure: number | null
  diastolicPressure: number | null
  bloodPressure: string | null
  heartRate: number | null
  respiratoryRate: number | null
  temperature: number | null
  oxygenSaturation: number | null
  weight: number | null
  height: number | null
  bmi: number | null
  bmiCategory: BmiCategory | null
  bmiCategoryLabel: string | null
  bmiCategoryColor: string | null
  notes: string | null
  recordedAt: string
  recordedAtFormatted: string
}

export interface Consultation {
  id: string
  medicalRecordId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  clinicId: string
  clinicName: string
  vitalSignsId: string | null
  consultationDate: string
  consultationDateFormatted: string
  reasonForVisit: string
  currentIllness: string | null
  physicalExamination: string | null
  diagnosisCode: string | null
  diagnosisDescription: string | null
  procedures: string | null
  treatment: string | null
  notes: string | null
  status: ConsultationStatus
  statusLabel: string
  statusColor: string
  createdAt: string
  updatedAt: string
}

export interface EvolutionNote {
  id: string
  consultationId: string
  doctorId: string
  doctorName: string
  note: string
  createdAt: string
  createdAtFormatted: string
}

export interface Referral {
  id: string
  consultationId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  destinationFacility: string
  destinationService: string
  reason: string
  clinicalSummary: string | null
  status: ReferralStatus
  statusLabel: string
  statusColor: string
  createdAt: string
  createdAtFormatted: string
}

export interface MedicalCertificateTemplate {
  id: string
  name: string
  description: string | null
  contentTemplate: string
  isSystem: boolean
}

export interface MedicalCertificate {
  id: string
  consultationId: string
  patientId: string
  patientName: string
  patientIdType: string
  patientIdNumber: string
  doctorId: string
  doctorName: string
  clinicId: string | null
  clinicName: string | null
  templateId: string | null
  templateName: string | null
  status: MedicalCertificateStatus
  statusLabel: string
  statusColor: string
  title: string
  certificateDate: string
  certificateDateFormatted: string
  restDays: number
  restStartDate: string | null
  restStartDateFormatted: string | null
  restEndDate: string | null
  restEndDateFormatted: string | null
  diagnosisSummary: string | null
  purpose: string | null
  content: string
  issuedAt: string | null
  issuedAtFormatted: string | null
  issuedById: string | null
  issuedByName: string | null
  voidedAt: string | null
  voidedAtFormatted: string | null
  voidedById: string | null
  voidedByName: string | null
  voidReason: string | null
  createdById: string
  createdByName: string
  createdAt: string
  createdAtFormatted: string
  updatedAt: string
}

// ─── Helpers ─────────────────────────────────────────────────────────

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "—"
  try {
    return new Intl.DateTimeFormat("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—"
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

// ─── Transform functions ─────────────────────────────────────────────

export function toMedicalRecord(raw: MedicalRecordResponse): MedicalRecord {
  return {
    id: raw.id,
    patientId: raw.patientId,
    patientName: raw.patientName,
    patientIdNumber: raw.patientIdNumber,
    organizationId: raw.organizationId,
    clinicId: raw.clinicId ?? null,
    clinicName: raw.clinicName ?? null,
    recordNumber: raw.recordNumber,
    personalHistory: raw.personalHistory ?? null,
    familyHistory: raw.familyHistory ?? null,
    surgicalHistory: raw.surgicalHistory ?? null,
    currentMedications: raw.currentMedications ?? null,
    openedAt: raw.openedAt,
    openedAtFormatted: formatDateTime(raw.openedAt),
    openedByName: raw.openedByName,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export function toMedicalRecordList(raw: MedicalRecordResponse[]): MedicalRecord[] {
  return raw.map(toMedicalRecord)
}

export function toVitalSigns(raw: VitalSignsResponse): VitalSigns {
  const bmiCat = raw.bmiCategory ?? null
  return {
    id: raw.id,
    medicalRecordId: raw.medicalRecordId,
    recordedById: raw.recordedById,
    recordedByName: raw.recordedByName,
    systolicPressure: raw.systolicPressure ?? null,
    diastolicPressure: raw.diastolicPressure ?? null,
    bloodPressure: raw.bloodPressure ?? null,
    heartRate: raw.heartRate ?? null,
    respiratoryRate: raw.respiratoryRate ?? null,
    temperature: raw.temperature ?? null,
    oxygenSaturation: raw.oxygenSaturation ?? null,
    weight: raw.weight ?? null,
    height: raw.height ?? null,
    bmi: raw.bmi ?? null,
    bmiCategory: bmiCat,
    bmiCategoryLabel: bmiCat ? BMI_CATEGORY_LABELS[bmiCat] ?? null : null,
    bmiCategoryColor: bmiCat ? BMI_CATEGORY_COLORS[bmiCat] ?? null : null,
    notes: raw.notes ?? null,
    recordedAt: raw.recordedAt,
    recordedAtFormatted: formatDateTime(raw.recordedAt),
  }
}

export function toVitalSignsList(raw: VitalSignsResponse[]): VitalSigns[] {
  return raw.map(toVitalSigns)
}

export function toConsultation(raw: ConsultationResponse): Consultation {
  return {
    id: raw.id,
    medicalRecordId: raw.medicalRecordId,
    patientId: raw.patientId,
    patientName: raw.patientName,
    doctorId: raw.doctorId,
    doctorName: raw.doctorName,
    clinicId: raw.clinicId,
    clinicName: raw.clinicName,
    vitalSignsId: raw.vitalSignsId ?? null,
    consultationDate: raw.consultationDate,
    consultationDateFormatted: formatDateTime(raw.consultationDate),
    reasonForVisit: raw.reasonForVisit,
    currentIllness: raw.currentIllness ?? null,
    physicalExamination: raw.physicalExamination ?? null,
    diagnosisCode: raw.diagnosisCode ?? null,
    diagnosisDescription: raw.diagnosisDescription ?? null,
    procedures: raw.procedures ?? null,
    treatment: raw.treatment ?? null,
    notes: raw.notes ?? null,
    status: raw.status,
    statusLabel: CONSULTATION_STATUS_LABELS[raw.status] ?? raw.status,
    statusColor: CONSULTATION_STATUS_COLORS[raw.status] ?? "",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  }
}

export function toConsultationList(raw: ConsultationResponse[]): Consultation[] {
  return raw.map(toConsultation)
}

export function toEvolutionNote(raw: EvolutionNoteResponse): EvolutionNote {
  return {
    id: raw.id,
    consultationId: raw.consultationId,
    doctorId: raw.doctorId,
    doctorName: raw.doctorName,
    note: raw.note,
    createdAt: raw.createdAt,
    createdAtFormatted: formatDateTime(raw.createdAt),
  }
}

export function toEvolutionNoteList(raw: EvolutionNoteResponse[]): EvolutionNote[] {
  return raw.map(toEvolutionNote)
}

export function toReferral(raw: ReferralResponse): Referral {
  return {
    id: raw.id,
    consultationId: raw.consultationId,
    patientId: raw.patientId,
    patientName: raw.patientName,
    doctorId: raw.doctorId,
    doctorName: raw.doctorName,
    destinationFacility: raw.destinationFacility,
    destinationService: raw.destinationService,
    reason: raw.reason,
    clinicalSummary: raw.clinicalSummary ?? null,
    status: raw.status,
    statusLabel: REFERRAL_STATUS_LABELS[raw.status] ?? raw.status,
    statusColor: REFERRAL_STATUS_COLORS[raw.status] ?? "",
    createdAt: raw.createdAt,
    createdAtFormatted: formatDate(raw.createdAt),
  }
}

export function toReferralList(raw: ReferralResponse[]): Referral[] {
  return raw.map(toReferral)
}

export function toMedicalCertificateTemplate(
  raw: MedicalCertificateTemplateResponse
): MedicalCertificateTemplate {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description ?? null,
    contentTemplate: raw.contentTemplate,
    isSystem: raw.isSystem,
  }
}

export function toMedicalCertificateTemplateList(
  raw: MedicalCertificateTemplateResponse[]
): MedicalCertificateTemplate[] {
  return raw.map(toMedicalCertificateTemplate)
}

export function toMedicalCertificate(raw: MedicalCertificateResponse): MedicalCertificate {
  return {
    id: raw.id,
    consultationId: raw.consultationId,
    patientId: raw.patientId,
    patientName: raw.patientName,
    patientIdType: raw.patientIdType,
    patientIdNumber: raw.patientIdNumber,
    doctorId: raw.doctorId,
    doctorName: raw.doctorName,
    clinicId: raw.clinicId ?? null,
    clinicName: raw.clinicName ?? null,
    templateId: raw.templateId ?? null,
    templateName: raw.templateName ?? null,
    status: raw.status,
    statusLabel: MEDICAL_CERTIFICATE_STATUS_LABELS[raw.status] ?? raw.status,
    statusColor: MEDICAL_CERTIFICATE_STATUS_COLORS[raw.status] ?? "",
    title: raw.title,
    certificateDate: raw.certificateDate,
    certificateDateFormatted: formatDate(raw.certificateDate),
    restDays: raw.restDays,
    restStartDate: raw.restStartDate ?? null,
    restStartDateFormatted: raw.restStartDate ? formatDate(raw.restStartDate) : null,
    restEndDate: raw.restEndDate ?? null,
    restEndDateFormatted: raw.restEndDate ? formatDate(raw.restEndDate) : null,
    diagnosisSummary: raw.diagnosisSummary ?? null,
    purpose: raw.purpose ?? null,
    content: raw.content,
    issuedAt: raw.issuedAt ?? null,
    issuedAtFormatted: raw.issuedAt ? formatDateTime(raw.issuedAt) : null,
    issuedById: raw.issuedById ?? null,
    issuedByName: raw.issuedByName ?? null,
    voidedAt: raw.voidedAt ?? null,
    voidedAtFormatted: raw.voidedAt ? formatDateTime(raw.voidedAt) : null,
    voidedById: raw.voidedById ?? null,
    voidedByName: raw.voidedByName ?? null,
    voidReason: raw.voidReason ?? null,
    createdById: raw.createdById,
    createdByName: raw.createdByName,
    createdAt: raw.createdAt,
    createdAtFormatted: formatDateTime(raw.createdAt),
    updatedAt: raw.updatedAt,
  }
}

export function toMedicalCertificateList(raw: MedicalCertificateResponse[]): MedicalCertificate[] {
  return raw.map(toMedicalCertificate)
}
