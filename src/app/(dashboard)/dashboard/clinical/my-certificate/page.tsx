import { redirect } from "next/navigation"

export default function LegacyMyCertificateRedirectPage() {
  redirect("/dashboard/profile/certificate")
}
