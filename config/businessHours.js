// Nyitvatartas: hetfo-pentek, 9:00-18:00, oras idopontokkal (utolso kezdes 17:00).
export const BUSINESS_HOUR_SLOTS = [9, 10, 11, 12, 13, 14, 15, 16, 17];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

// A "YYYY-MM-DD" datumot mindig UTC-kent ertelmezzuk, es getUTCDay()-jal
// olvassuk ki a het napjat, hogy a szerver sajat idozonaja (pl. Vercelen UTC)
// soha ne csusztassa el a napot egy nappal.
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

// A "YYYY-MM-DD" + oraszam parost RFC3339 idobelyeggé alakitja a
// budapesti idozona tenyleges (nyari/teli) UTC-eltolasaval, hogy a Google
// Naptar API-hoz mindig a helyes pillanatot kuldjuk - fuggetlenul attol,
// hogy a szerver sajat idozonaja mit mutat.
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
  // hour >= 24: a kovetkezo nap 00:00-ja (honap-hatarokhoz).
  const next = new Date(`${dateStr}T00:00:00Z`);
  next.setUTCDate(next.getUTCDate() + 1);
  const nextDateStr = next.toISOString().slice(0, 10);
  return `${nextDateStr}T00:00:00${sign}${abs}:00`;
}

// Egy adott nap adott orai slotja (hour:00 - hour+1:00) es a Google
// busy-intervallumok atfedeset vizsgalja.
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
