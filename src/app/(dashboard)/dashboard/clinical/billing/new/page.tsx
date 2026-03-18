"use client"

import { Suspense } from "react"
import { NewConsultationInvoiceContent } from "./content"

export default function NewConsultationInvoicePage() {
  return (
    <Suspense fallback={<div className="p-6">Cargando...</div>}>
      <NewConsultationInvoiceContent />
    </Suspense>
  )
}
