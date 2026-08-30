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
