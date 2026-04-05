export type DateInput = string | number | Date | null | undefined

export const ECUADOR_TIME_ZONE = "America/Guayaquil"
export const ECUADOR_LOCALE = "es-EC"

const DATE_ONLY_REGEX = /^(\d{4})-(\d{2})-(\d{2})$/
const DATE_TIME_NO_TZ_REGEX =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?$/

function isValidDate(date: Date): boolean {
  return !Number.isNaN(date.getTime())
}

/**
 * Parses date strings without timezone info.
 *
 * - Date-only ("2026-04-04"): treated as a calendar date in Ecuador.
 *   We set UTC to 05:00 so that formatting with timeZone=America/Guayaquil
 *   (UTC-5) displays the same calendar date (midnight Ecuador = 05:00 UTC).
 *
 * - DateTime ("2026-04-04T15:30:00"): treated as UTC because the backend
 *   server (Railway) runs in UTC. The format functions then convert to
 *   Ecuador time for display using Intl.DateTimeFormat with timeZone.
 */
function parseNaiveDate(value: string): Date | null {
  const dateOnlyMatch = DATE_ONLY_REGEX.exec(value)
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1])
    const month = Number(dateOnlyMatch[2])
    const day = Number(dateOnlyMatch[3])
    // 05:00 UTC = 00:00 Ecuador (UTC-5), so the date displays correctly
    return new Date(Date.UTC(year, month - 1, day, 5, 0, 0, 0))
  }

  const dateTimeMatch = DATE_TIME_NO_TZ_REGEX.exec(value)
  if (dateTimeMatch) {
    const year = Number(dateTimeMatch[1])
    const month = Number(dateTimeMatch[2])
    const day = Number(dateTimeMatch[3])
    const hour = Number(dateTimeMatch[4])
    const minute = Number(dateTimeMatch[5])
    const second = Number(dateTimeMatch[6] ?? "0")
    const rawFraction = dateTimeMatch[7] ?? ""
    const millis = Number(rawFraction.padEnd(3, "0").slice(0, 3))

    // Server sends UTC — keep as-is, no offset needed
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second, millis))
  }

  return null
}

function normalizeFraction(value: string): string {
  return value.replace(/\.(\d{3})\d+(?=(Z|[+-]\d{2}:?\d{2})?$)/, ".$1")
}

export function parseDateEc(value: DateInput): Date | null {
  if (value == null) return null

  if (value instanceof Date) {
    return isValidDate(value) ? value : null
  }

  if (typeof value === "number") {
    const parsed = new Date(value)
    return isValidDate(parsed) ? parsed : null
  }

  const text = value.trim()
  if (!text) return null

  const naiveParsed = parseNaiveDate(text)
  if (naiveParsed) return naiveParsed

  const parsed = new Date(normalizeFraction(text))
  return isValidDate(parsed) ? parsed : null
}

function buildPartMap(parts: Intl.DateTimeFormatPart[]): Record<string, string> {
  return parts.reduce<Record<string, string>>((acc, part) => {
    if (part.type !== "literal") {
      acc[part.type] = part.value
    }
    return acc
  }, {})
}

export function formatDateEc(value: DateInput, fallback = "—"): string {
  const parsed = parseDateEc(value)
  if (!parsed) return fallback

  const parts = new Intl.DateTimeFormat(ECUADOR_LOCALE, {
    timeZone: ECUADOR_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(parsed)
  const map = buildPartMap(parts)
  return `${map.day}/${map.month}/${map.year}`
}

export function toIsoDateEc(value: DateInput, fallback = ""): string {
  const parsed = parseDateEc(value)
  if (!parsed) return fallback

  const parts = new Intl.DateTimeFormat(ECUADOR_LOCALE, {
    timeZone: ECUADOR_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(parsed)
  const map = buildPartMap(parts)
  return `${map.year}-${map.month}-${map.day}`
}

export function formatDateTimeEc(value: DateInput, fallback = "—"): string {
  const parsed = parseDateEc(value)
  if (!parsed) return fallback

  const parts = new Intl.DateTimeFormat(ECUADOR_LOCALE, {
    timeZone: ECUADOR_TIME_ZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(parsed)
  const map = buildPartMap(parts)
  return `${map.day}/${map.month}/${map.year} ${map.hour}:${map.minute}`
}
