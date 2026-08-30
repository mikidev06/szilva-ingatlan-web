import { useState } from "react";
import { sendMessage } from "../api";
import MapEmbed from "../components/MapEmbed";

const initialForm = { name: "", email: "", phone: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setStatus(null);
    try {
      await sendMessage(form);
      setStatus({ type: "success", text: "Köszönjük! Üzenetét megkaptuk, hamarosan felvesszük Önnel a kapcsolatot." });
      setForm(initialForm);
    } catch (err) {
      setStatus({ type: "error", text: "Hiba történt az üzenet küldése közben. Kérjük próbálja meg később." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Kapcsolat</span>
          <h1>Vegyük fel a kapcsolatot</h1>
          <p>
            Kérdése van, vagy szeretne időpontot egyeztetni? Töltse ki az
            űrlapot, vagy hívjon telefonon.
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container contact-layout">
          <form className="contact-form" onSubmit={handleSubmit}>
            <h2 style={{ marginBottom: 0 }}>Írjon üzenetet</h2>

            {status && (
              <div className={`form-status ${status.type}`}>{status.text}</div>
            )}

            <div className="field">
              <label htmlFor="name">Név *</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Teljes név"
              />
            </div>

            <div className="field">
              <label htmlFor="email">E-mail cím *</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="pelda@email.hu"
              />
            </div>

            <div className="field">
              <label htmlFor="phone">Telefonszám</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="+36 12 345 6789"
              />
            </div>

            <div className="field">
              <label htmlFor="message">Üzenet *</label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={form.message}
                onChange={handleChange}
                placeholder="Írja le, miben segíthetek…"
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Küldés…" : "Üzenet küldése"}
            </button>
          </form>

          <div>
            <span className="eyebrow">Elérhetőségek</span>
            <h2>Forduljon hozzám bizalommal</h2>
            <p>
              Hétköznapokon 9:00 és 18:00 között állok rendelkezésére,
              <br></br>
              de e-mailben bármikor elérhet.
            </p>

            <div className="contact-info-list">
              <div className="contact-info-item">
                <div className="contact-info-icon">📍</div>
                <div>
                  <strong>Iroda</strong>
                  <span>1013 Budapest, Krisztina körút 32.</span>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon">☎</div>
                <div>
                  <strong>Telefon</strong>
                  <span>+36 30 505 9660</span>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon">✉</div>
                <div>
                  <strong>E-mail</strong>
                  <span>szilagyi.szilva@otpip.hu</span>
                </div>
              </div>
              <div className="contact-info-item">
                <div className="contact-info-icon">🕒</div>
                <div>
                  <strong>Nyitvatartás</strong>
                  <span>Hétfő – Péntek: 9:00 – 18:00</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <MapEmbed
                title="Iroda helyszíne térképen"
                src="https://www.openstreetmap.org/export/embed.html?bbox=19.026869%2C47.4955247%2C19.034869%2C47.4995247&layer=mapnik&marker=47.4975247%2C19.0308690"
              />
            </div>
            <div className="map-embed-link">
              <a
                href="https://www.openstreetmap.org/?mlat=47.4975247&mlon=19.0308690#map=17/47.4975247/19.0308690"
                target="_blank"
                rel="noopener noreferrer"
              >
                Nagyobb térkép megnyitása
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
