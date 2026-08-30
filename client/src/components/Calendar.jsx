import { useEffect, useState } from "react";
import { fetchFullDays } from "../api";

const WEEKDAY_LABELS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];

export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isWeekend(date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export default function Calendar({ selectedDate, onSelectDate }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewDate, setViewDate] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const [fullDays, setFullDays] = useState(new Set());

  useEffect(() => {
    let cancelled = false;
    fetchFullDays(year, month + 1)
      .then((data) => {
        if (!cancelled) setFullDays(new Set(data.fullDays || []));
      })
      .catch(() => {
        if (!cancelled) setFullDays(new Set());
      });
    return () => {
      cancelled = true;
    };
  }, [year, month]);

  const firstOfMonth = new Date(year, month, 1);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = hétfő
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  const monthLabel = viewDate.toLocaleDateString("hu-HU", { year: "numeric", month: "long" });

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          disabled={isCurrentMonth}
          aria-label="Előző hónap"
        >
          ‹
        </button>
        <span className="calendar-month-label">{monthLabel}</span>
        <button
          type="button"
          className="calendar-nav"
          onClick={() => setViewDate(new Date(year, month + 1, 1))}
          aria-label="Következő hónap"
        >
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w}>{w}</div>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} className="calendar-cell-empty" />;

          const key = toDateKey(date);
          const isFull = fullDays.has(key);
          const disabled = date < today || isWeekend(date) || isFull;
          const isSelected = selectedDate === key;

          return (
            <button
              type="button"
              key={key}
              className={`calendar-cell ${isSelected ? "selected" : ""} ${isFull ? "full" : ""}`}
              disabled={disabled}
              title={isFull ? "Erre a napra nincs szabad időpont" : undefined}
              onClick={() => onSelectDate(key)}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
