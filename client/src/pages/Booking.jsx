import { useEffect, useState } from "react";
import Calendar, { toDateKey } from "../components/Calendar";
import { fetchAvailability, createAppointment } from "../api";

const SERVICE_TYPES = ["Személyes találkozó", "Hitelügyintézés"];

const emptyForm = { name: "", email: "", phone: "", serviceType: SERVICE_TYPES[0], notes: "" };

function formatDateHu(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });
}

export default function Booking() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [slots, setSlots] = useState([]);
  const [booked, setBooked] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedTime(null);
    fetchAvailability(selectedDate)
      .then((data) => {
        setSlots(data.slots || []);
        setBooked(data.booked || []);
      })
      .catch(() => {
        setSlots([]);
        setBooked([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  function isPastToday(time) {
    if (selectedDate !== toDateKey(new Date())) return false;
    const hour = Number(time.slice(0, 2));
    return hour <= new Date().getHours();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedDate || !selectedTime) return;

    setSubmitting(true);
    setStatus(null);
    try {
      await createAppointment({ ...form, date: selectedDate, time: selectedTime });
      setStatus({
        type: "success",
        text: `Köszönjük, ${form.name}! Az időpontot lefoglaltuk: ${formatDateHu(selectedDate)}, ${selectedTime}. Hamarosan felvesszük Önnel a kapcsolatot.`,
      });
      setForm(emptyForm);
      setSelectedTime(null);
      const fresh = await fetchAvailability(selectedDate);
      setBooked(fresh.booked || []);
    } catch (err) {
      setStatus({ type: "error", text: err.message });
      const fresh = await fetchAvailability(selectedDate).catch(() => null);
      if (fresh) setBooked(fresh.booked || []);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Időpontfoglalás</span>
          <h1>Foglaljon időpontot személyes találkozóra</h1>
          <p>
            Válasszon egy Önnek megfelelő napot és időpontot személyes
            találkozóra vagy hitelügyintézési konzultációra.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container booking-layout">
          <div>
            <h2 className="booking-step-title">1. Válasszon dátumot</h2>
            <Calendar selectedDate={selectedDate} onSelectDate={setSelectedDate} />
          </div>

          <div>
            <h2 className="booking-step-title">2. Válasszon időpontot</h2>

            {status && (
              <div className={`form-status ${status.type}`} style={{ marginBottom: 16 }}>
                {status.text}
              </div>
            )}

            {!selectedDate && (
              <div className="empty-state booking-placeholder">
                Először válasszon egy napot a naptárban.
              </div>
            )}

            {selectedDate && loadingSlots && (
              <div className="loading-state">Betöltés…</div>
            )}

            {selectedDate && !loadingSlots && (
              <div className="time-slot-grid">
                {slots.map((time) => {
                  const disabled = booked.includes(time) || isPastToday(time);
                  return (
                    <button
                      type="button"
                      key={time}
                      className={`time-slot ${selectedTime === time ? "selected" : ""}`}
                      disabled={disabled}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedDate && selectedTime && (
              <form className="contact-form booking-form" onSubmit={handleSubmit}>
                <h2 style={{ marginBottom: 0 }}>3. Adja meg adatait</h2>
                <p style={{ marginBottom: 0, color: "var(--color-text-muted)" }}>
                  Kiválasztott időpont: <strong>{formatDateHu(selectedDate)}, {selectedTime}</strong>
                </p>

                <div className="field">
                  <label htmlFor="bk-service">Szolgáltatás</label>
                  <select
                    id="bk-service"
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleChange}
                  >
                    {SERVICE_TYPES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label htmlFor="bk-name">Név *</label>
                  <input
                    id="bk-name"
                    name="name"
                    type="text"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Teljes név"
                  />
                </div>

                <div className="field">
                  <label htmlFor="bk-email">E-mail cím *</label>
                  <input
                    id="bk-email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="pelda@email.hu"
                  />
                </div>

                <div className="field">
                  <label htmlFor="bk-phone">Telefonszám</label>
                  <input
                    id="bk-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+36 30 505 9660"
                  />
                </div>

                <div className="field">
                  <label htmlFor="bk-notes">Megjegyzés</label>
                  <textarea
                    id="bk-notes"
                    name="notes"
                    rows={3}
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Röviden írja le, miben segíthetek…"
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? "Foglalás…" : "Időpont lefoglalása"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
