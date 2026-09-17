// Opening hours: Monday-Friday, 9:00-18:00, in whole-hour slots (last start 17:00).
export const BUSINESS_HOUR_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// The "YYYY-MM-DD" date is always interpreted as UTC, and the day of the week
// is read with getUTCDay(), so that the server's own time zone (UTC on Vercel,
// for instance) can never shift the day by one.
export function isBusinessDay(dateStr) {
  if (!DATE_RE.test(dateStr)) return false;
  const day = new Date(`${dateStr}T00:00:00Z`).getUTCDay();
  return day >= 1 && day <= 5;
}

export function isValidSlot(dateStr, timeStr) {
  if (!TIME_RE.test(timeStr)) return false;
  if (!isBusinessDay(dateStr)) return false;
  const hour = Number(timeStr.slice(0, 2));
  const minute = timeStr.slice(3, 5);
  return minute === "00" && BUSINESS_HOUR_SLOTS.includes(hour);
}

// Converts a "YYYY-MM-DD" + hour pair into an RFC3339 timestamp using the
// actual (summer/winter) UTC offset of the Budapest time zone, so that we
// always send the correct instant to the Google Calendar API - regardless of
// what the server's own time zone says.
export function budapestISO(dateStr, hour) {
  const probe = new Date(`${dateStr}T12:00:00Z`);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Budapest",
    timeZoneName: "shortOffset",
  }).formatToParts(probe);
  const tzName = parts.find((p) => p.type === "timeZoneName")?.value || "GMT+1";
  const match = tzName.match(/GMT([+-]\d+)/);
  const offsetHours = match ? Number(match[1]) : 1;
  const sign = offsetHours >= 0 ? "+" : "-";
  const abs = String(Math.abs(offsetHours)).padStart(2, "0");

  if (hour < 24) {
    return `${dateStr}T${String(hour).padStart(2, "0")}:00:00${sign}${abs}:00`;
  }
  // hour >= 24: 00:00 of the next day (for month boundaries).
  const next = new Date(`${dateStr}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const nextDateStr = next.toISOString().slice(0, 10);
  return `${nextDateStr}T00:00:00${sign}${abs}:00`;
}

// Checks whether a given hourly slot of a given day (hour:00 - hour+1:00)
// overlaps with the Google busy intervals.
export function slotOverlapsBusy(dateStr, hour, busyIntervals) {
  if (!busyIntervals || busyIntervals.length === 0) return false;
  const slotStart = new Date(budapestISO(dateStr, hour));
  const slotEnd = new Date(budapestISO(dateStr, hour + 1));
  return busyIntervals.some((b) => {
    const busyStart = new Date(b.start);
    const busyEnd = new Date(b.end);
    return slotStart < busyEnd && busyStart < slotEnd;
  });
}
