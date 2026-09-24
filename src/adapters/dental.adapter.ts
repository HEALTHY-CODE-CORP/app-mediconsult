import { formatDateTimeEc } from "@/lib/date"
import type {
  DentalDateResponse,
  DentalDateStatus,
  DentalRecordResponse,
  DentalVitalSignsResponse,
  OdontogramVersionResponse,
} from "@/types/dental.model"

export const DENTAL_DATE_STATUS_LABELS: Record<DentalDateStatus, string> = {
  DRAFT: "Borrador",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
}

export const DENTAL_DATE_STATUS_COLORS: Record<DentalDateStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
}

export interface DentalVitalSigns {
  id: string
  dentalRecordId: string
  dentalDateId: string | null
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
  notes: string | null
  recordedAt: string
  recordedAtFormatted: string
}

export interface DentalRecord {
  id: string
  patientId: string
  patientName: string
  patientIdNumber: string
  organizationId: string
  clinicId: string | null
  clinicName: string | null
  recordNumber: string
  openingReason: string
  currentIllness: string | null
  odontologicalHistory: string | null
  familyHistory: string | null
  pathologicalHistory: string | null
  medicalAlerts: string | null
  patientType: "AMBULATORY" | "HOSPITALIZATION"
  patientTypeLabel: string
  stomatognathicExam: string | null
  observations: string | null
  isActive: boolean
  openedAt: string
  openedAtFormatted: string
  openedByName: string
  createdAt: string
  updatedAt: string
  vitalSigns: DentalVitalSigns[]
  latestVitalSigns: DentalVitalSigns | null
}

export interface DentalDate {
  id: string
  dentalRecordId: string
  patientId: string
  patientName: string
  doctorId: string
  doctorName: string
  clinicId: string
  clinicName: string
  sessionNumber: number
  sessionDate: string
  sessionDateFormatted: string
  diagnosisAndComplications: string
  procedureText: string
  prescriptionsOrRecommendations: string | null
  notes: string | null
  status: DentalDateStatus
  statusLabel: string
  statusColor: string
  createdAt: string
  updatedAt: string
  odontogramVersion: OdontogramVersion | null
  vitalSigns: DentalVitalSigns[]
}

export interface OdontogramVersion {
  id: string
  dentalRecordId: string
  dentalDateId: string | null
  versionNumber: number
  data: Record<string, unknown>
  notes: string | null
  createdByUserId: string
  createdByName: string
  isCurrent: boolean
  createdAt: string
  createdAtFormatted: string
}

export function toDentalVitalSigns(raw: DentalVitalSignsResponse): DentalVitalSigns {
  const weight = raw.weight != null ? Number(raw.weight) : null
  const height = raw.height != null ? Number(raw.height) : null
  let bmi = raw.bmi != null ? Number(raw.bmi) : null
  if (!bmi && weight && height && height > 0) {
    const heightM = height / 100
    bmi = Number((weight / (heightM * heightM)).toFixed(1))
  }

  const bloodPressure =
    raw.bloodPressure ??
    (raw.systolicPressure != null && raw.diastolicPressure != null
      ? `${raw.systolicPressure}/${raw.diastolicPressure} mmHg`
      : null)

  return {
    id: raw.id,
    dentalRecordId: raw.dentalRecordId,
    dentalDateId: raw.dentalDateId ?? null,
    recordedById: raw.recordedById,
    recordedByName: raw.recordedByName,
    systolicPressure: raw.systolicPressure ?? null,
    diastolicPressure: raw.diastolicPressure ?? null,
    bloodPressure,
    heartRate: raw.heartRate ?? null,
    respiratoryRate: raw.respiratoryRate ?? null,
    temperature: raw.temperature != null ? Number(raw.temperature) : null,
    oxygenSaturation: raw.oxygenSaturation ?? null,
    weight,
    height,
    bmi,
    notes: raw.notes ?? null,
    recordedAt: raw.recordedAt,
    recordedAtFormatted: formatDateTimeEc(raw.recordedAt, raw.recordedAt),
  }
}

export function toDentalVitalSignsList(raw: DentalVitalSignsResponse[]): DentalVitalSigns[] {
  return raw.map(toDentalVitalSigns)
}

export function toDentalRecord(raw: DentalRecordResponse): DentalRecord {
  const vitalSigns = raw.vitalSigns ? raw.vitalSigns.map(toDentalVitalSigns) : []
  const latestVitalSigns = raw.latestVitalSigns
    ? toDentalVitalSigns(raw.latestVitalSigns)
    : vitalSigns[0] ?? null

  return {
    id: raw.id,
    patientId: raw.patientId,
    patientName: raw.patientName,
    patientIdNumber: raw.patientIdNumber,
    organizationId: raw.organizationId,
    clinicId: raw.clinicId ?? null,
    clinicName: raw.clinicName ?? null,
    recordNumber: raw.recordNumber,
    openingReason: raw.openingReason,
    currentIllness: raw.currentIllness ?? null,
    odontologicalHistory: raw.odontologicalHistory ?? null,
    familyHistory: raw.familyHistory ?? null,
    pathologicalHistory: raw.pathologicalHistory ?? null,
    medicalAlerts: raw.medicalAlerts ?? null,
    patientType: raw.patientType,
    patientTypeLabel: raw.patientType === "HOSPITALIZATION" ? "Hospitalización" : "Ambulatorio",
    stomatognathicExam: raw.stomatognathicExam ?? null,
    observations: raw.observations ?? null,
    isActive: raw.isActive,
    openedAt: raw.openedAt,
    openedAtFormatted: formatDateTimeEc(raw.openedAt, raw.openedAt),
    openedByName: raw.openedByName,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    vitalSigns,
    latestVitalSigns,
  }
}

export function toDentalRecordList(raw: DentalRecordResponse[]): DentalRecord[] {
  return raw.map(toDentalRecord)
}

export function toOdontogramVersion(raw: OdontogramVersionResponse): OdontogramVersion {
  return {
    id: raw.id,
    dentalRecordId: raw.dentalRecordId,
    dentalDateId: raw.dentalDateId ?? null,
    versionNumber: raw.versionNumber,
    data: raw.data,
    notes: raw.notes ?? null,
    createdByUserId: raw.createdByUserId,
    createdByName: raw.createdByName,
    isCurrent: raw.isCurrent,
    createdAt: raw.createdAt,
    createdAtFormatted: formatDateTimeEc(raw.createdAt, raw.createdAt),
  }
}

export function toOdontogramVersionList(raw: OdontogramVersionResponse[]): OdontogramVersion[] {
  return raw.map(toOdontogramVersion)
}

export function toDentalDate(raw: DentalDateResponse): DentalDate {
  return {
    id: raw.id,
    dentalRecordId: raw.dentalRecordId,
    patientId: raw.patientId,
    patientName: raw.patientName,
    doctorId: raw.doctorId,
    doctorName: raw.doctorName,
    clinicId: raw.clinicId,
    clinicName: raw.clinicName,
    sessionNumber: raw.sessionNumber,
    sessionDate: raw.sessionDate,
    sessionDateFormatted: formatDateTimeEc(raw.sessionDate, raw.sessionDate),
    diagnosisAndComplications: raw.diagnosisAndComplications,
    procedureText: raw.procedureText,
    prescriptionsOrRecommendations: raw.prescriptionsOrRecommendations ?? null,
    notes: raw.notes ?? null,
    status: raw.status,
    statusLabel: DENTAL_DATE_STATUS_LABELS[raw.status] ?? raw.status,
    statusColor: DENTAL_DATE_STATUS_COLORS[raw.status] ?? "",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    odontogramVersion: raw.odontogramVersion ? toOdontogramVersion(raw.odontogramVersion) : null,
    vitalSigns: raw.vitalSigns ? raw.vitalSigns.map(toDentalVitalSigns) : [],
  }
}

export function toDentalDateList(raw: DentalDateResponse[]): DentalDate[] {
  return raw.map(toDentalDate)
}
