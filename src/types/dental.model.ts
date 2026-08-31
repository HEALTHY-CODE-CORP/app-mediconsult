export type DentalPatientType = "AMBULATORY" | "HOSPITALIZATION"
export type DentalDateStatus = "DRAFT" | "COMPLETED" | "CANCELLED"

export interface OdontogramState {
  teeth: Record<string, unknown>
  prosthesisGroups: unknown[]
  warnings?: unknown[]
  [key: string]: unknown
}

export interface CreateDentalRecordRequest {
  patientId: string
  clinicId?: string
  openingReason: string
  currentIllness?: string
  odontologicalHistory?: string
  medicalAlerts?: string
  patientType?: DentalPatientType
  observations?: string
  initialOdontogramData?: OdontogramState
  initialOdontogramNotes?: string
}

export interface UpdateDentalRecordRequest {
  openingReason?: string
  currentIllness?: string
  odontologicalHistory?: string
  medicalAlerts?: string
  patientType?: DentalPatientType
  observations?: string
  isActive?: boolean
}

export interface DentalRecordResponse {
  id: string
  patientId: string
  patientName: string
  patientIdNumber: string
  organizationId: string
  clinicId?: string
  clinicName?: string
  recordNumber: string
  openingReason: string
  currentIllness?: string
  odontologicalHistory?: string
  medicalAlerts?: string
  patientType: DentalPatientType
  observations?: string
  isActive: boolean
  openedAt: string
  openedByName: string
  createdAt: string
  updatedAt: string
}

export interface CreateDentalDateRequest {
  clinicId: string
  sessionNumber?: number
  sessionDate?: string
  diagnosisAndComplications: string
  procedureText: string
  prescriptionsOrRecommendations?: string
  notes?: string
  status?: DentalDateStatus
  odontogramData?: OdontogramState
  odontogramNotes?: string
}

export interface UpdateDentalDateRequest {
  sessionDate?: string
  diagnosisAndComplications?: string
  procedureText?: string
  prescriptionsOrRecommendations?: string
  notes?: string
  status?: DentalDateStatus
  odontogramData?: OdontogramState
  odontogramNotes?: string
}

export interface DentalDateResponse {
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
  diagnosisAndComplications: string
  procedureText: string
  prescriptionsOrRecommendations?: string
  notes?: string
  status: DentalDateStatus
  createdAt: string
  updatedAt: string
  odontogramVersion?: OdontogramVersionResponse
}

export interface CreateOdontogramVersionRequest {
  dentalDateId?: string
  data: OdontogramState
  notes?: string
}

export interface OdontogramVersionResponse {
  id: string
  dentalRecordId: string
  dentalDateId?: string
  versionNumber: number
  data: OdontogramState
  notes?: string
  createdByUserId: string
  createdByName: string
  isCurrent: boolean
  createdAt: string
}
