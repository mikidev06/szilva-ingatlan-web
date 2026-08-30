import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import AdminListingForm from "../components/AdminListingForm";
import ThemeToggle from "../components/ThemeToggle";
import {
  login,
  verifyToken,
  fetchListings,
  createListing,
  updateListing,
  deleteListing,
  fetchAppointments,
  deleteAppointment,
  fetchMessages,
  deleteMessage,
  fetchGoogleStatus,
  fetchGoogleAuthUrl,
  disconnectGoogle,
  formatPrice,
} from "../api";

const TOKEN_KEY = "admin_token";

export default function Admin() {
  const [token, setToken] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [view, setView] = useState("listings"); // "listings" | "projects" | "appointments" | "messages"

  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listError, setListError] = useState(null);

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectError, setProjectError] = useState(null);

  const [editing, setEditing] = useState(null); // null | "new" | listing/project object
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  const [appointments, setAppointments] = useState([]);
  // Igazra inditjuk, hogy elso megnyitaskor ne villanjon fel tevesen az
  // "ures" allapot, mielott a tenyleges lekerdezes lefutna.
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState(null);

  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [messagesError, setMessagesError] = useState(null);

  const [googleStatus, setGoogleStatus] = useState(null); // null | { configured, connected }
  const [googleError, setGoogleError] = useState(null);
  const [connectingGoogle, setConnectingGoogle] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const googleRedirectResult = searchParams.get("google"); // "connected" | "error" | null

  useEffect(() => {
    if (!googleRedirectResult) return;
    setSearchParams({}, { replace: true });
  }, [googleRedirectResult, setSearchParams]);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setCheckingSession(false);
      return;
    }
    verifyToken(stored)
      .then((valid) => {
        if (valid) {
          setToken(stored);
        } else {
          localStorage.removeItem(TOKEN_KEY);
        }
      })
      .finally(() => setCheckingSession(false));
  }, []);

  useEffect(() => {
    if (token) {
      loadListings();
    }
  }, [token]);

  useEffect(() => {
    if (token && view === "projects") {
      loadProjects();
    }
  }, [token, view]);

  useEffect(() => {
    if (token && view === "appointments") {
      loadAppointments();
      loadGoogleStatus();
    }
  }, [token, view, googleRedirectResult]);

  useEffect(() => {
    if (token && view === "messages") {
      loadMessages();
    }
  }, [token, view]);

  function loadListings() {
    setLoadingListings(true);
    setListError(null);
    fetchListings("ingatlan")
      .then(setListings)
      .catch(() => setListError("Nem sikerült betölteni az ingatlanokat."))
      .finally(() => setLoadingListings(false));
  }

  function loadProjects() {
    setLoadingProjects(true);
    setProjectError(null);
    fetchListings("projekt")
      .then(setProjects)
      .catch(() => setProjectError("Nem sikerült betölteni a projekteket."))
      .finally(() => setLoadingProjects(false));
  }

  function loadAppointments() {
    setLoadingAppointments(true);
    setAppointmentsError(null);
    fetchAppointments(token)
      .then(setAppointments)
      .catch(() => setAppointmentsError("Nem sikerült betölteni a foglalásokat."))
      .finally(() => setLoadingAppointments(false));
  }

  function loadGoogleStatus() {
    setGoogleError(null);
    fetchGoogleStatus(token)
      .then(setGoogleStatus)
      .catch(() => setGoogleStatus(null));
  }

  async function handleConnectGoogle() {
    setConnectingGoogle(true);
    setGoogleError(null);
    try {
      const { url } = await fetchGoogleAuthUrl(token);
      window.location.href = url;
    } catch (err) {
      setGoogleError(err.message);
      setConnectingGoogle(false);
    }
  }

  async function handleDisconnectGoogle() {
    if (!window.confirm("Biztosan leválasztod a Google Naptárt?")) return;
    try {
      await disconnectGoogle(token);
      loadGoogleStatus();
    } catch (err) {
      setGoogleError(err.message);
    }
  }

  function loadMessages() {
    setLoadingMessages(true);
    setMessagesError(null);
    fetchMessages(token)
      .then(setMessages)
      .catch(() => setMessagesError("Nem sikerült betölteni az üzeneteket."))
      .finally(() => setLoadingMessages(false));
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError(null);
    try {
      const { token: newToken } = await login(password);
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setPassword("");
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoggingIn(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setListings([]);
    setProjects([]);
    setAppointments([]);
    setMessages([]);
  }

  async function handleFormSubmit(payload) {
    setSaving(true);
    setFormError(null);
    try {
      if (editing === "new") {
        await createListing(token, payload);
      } else {
        await updateListing(token, editing._id, payload);
      }
      setEditing(null);
      if (view === "projects") {
        loadProjects();
      } else {
        loadListings();
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(listing) {
    if (!window.confirm(`Biztosan törlöd: „${listing.title}”?`)) return;
    try {
      await deleteListing(token, listing._id);
      loadListings();
    } catch (err) {
      setListError(err.message);
    }
  }

  async function handleDeleteProject(project) {
    if (!window.confirm(`Biztosan törlöd: „${project.title}”?`)) return;
    try {
      await deleteListing(token, project._id);
      loadProjects();
    } catch (err) {
      setProjectError(err.message);
    }
  }

  async function handleCancelAppointment(appointment) {
    if (!window.confirm(`Biztosan lemondod ${appointment.name} időpontját (${appointment.date} ${appointment.time})?`)) {
      return;
    }
    try {
      await deleteAppointment(token, appointment._id);
      loadAppointments();
    } catch (err) {
      setAppointmentsError(err.message);
    }
  }

  async function handleDeleteMessage(msg) {
    if (!window.confirm(`Biztosan törlöd ${msg.name} üzenetét?`)) return;
    try {
      await deleteMessage(token, msg._id);
      loadMessages();
    } catch (err) {
      setMessagesError(err.message);
    }
  }

  if (checkingSession) {
    return <div className="loading-state">Munkamenet ellenőrzése…</div>;
  }

  if (!token) {
    return (
      <div className="admin-login-wrap">
        <div className="admin-login-theme-toggle">
          <ThemeToggle />
        </div>
        <div className="admin-login-card">
          <Link to="/" className="back-link">
            ← Vissza a főoldalra
          </Link>
          <span className="eyebrow">Admin felület</span>
          <h1>Bejelentkezés</h1>
          <p>Add meg az adminisztrátori jelszót az ingatlanok kezeléséhez.</p>

          <form onSubmit={handleLogin} className="admin-form">
            {loginError && <div className="form-status error">{loginError}</div>}
            <div className="field">
              <label htmlFor="admin-password">Jelszó</label>
              <input
                id="admin-password"
                type="password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={loggingIn}>
              {loggingIn ? "Belépés…" : "Belépés"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="eyebrow">Admin felület</span>
            <h1>
              {view === "listings" && "Ingatlanok kezelése"}
              {view === "projects" && "Projektek kezelése"}
              {view === "appointments" && "Időpontfoglalások"}
              {view === "messages" && "Üzenetek"}
            </h1>
          </div>
          <div className="admin-header-actions">
            <Link to="/" className="btn btn-outline">
              Oldal megtekintése
            </Link>
            <button className="btn btn-outline" onClick={handleLogout}>
              Kijelentkezés
            </button>
            <ThemeToggle />
          </div>
        </div>

        {!editing && (
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab ${view === "listings" ? "active" : ""}`}
              onClick={() => setView("listings")}
            >
              Ingatlanok
            </button>
            <button
              type="button"
              className={`admin-tab ${view === "projects" ? "active" : ""}`}
              onClick={() => setView("projects")}
            >
              Projektek
            </button>
            <button
              type="button"
              className={`admin-tab ${view === "appointments" ? "active" : ""}`}
              onClick={() => setView("appointments")}
            >
              Időpontfoglalások
            </button>
            <button
              type="button"
              className={`admin-tab ${view === "messages" ? "active" : ""}`}
              onClick={() => setView("messages")}
            >
              Üzenetek
            </button>
          </div>
        )}

        {view === "listings" && (
          <>
            {editing ? (
              <div className="admin-panel">
                <h2>{editing === "new" ? "Új ingatlan hozzáadása" : "Ingatlan szerkesztése"}</h2>
                {formError && <div className="form-status error">{formError}</div>}
                <AdminListingForm
                  initial={editing === "new" ? null : editing}
                  token={token}
                  kind="ingatlan"
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setEditing(null);
                    setFormError(null);
                  }}
                  submitting={saving}
                />
              </div>
            ) : (
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <h2>Ingatlanok ({listings.length})</h2>
                  <button className="btn btn-primary" onClick={() => setEditing("new")}>
                    + Új ingatlan
                  </button>
                </div>

                {listError && <div className="form-status error">{listError}</div>}
                {loadingListings && <div className="loading-state">Betöltés…</div>}

                {!loadingListings && listings.length === 0 && !listError && (
                  <div className="empty-state">Még nincs felvett ingatlan.</div>
                )}

                {!loadingListings && listings.length > 0 && (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Cím</th>
                          <th>Kategória</th>
                          <th>Település</th>
                          <th>Ár</th>
                          <th>Kiemelt</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {listings.map((listing) => (
                          <tr key={listing._id}>
                            <td>{listing.title}</td>
                            <td>{listing.category}</td>
                            <td>{listing.city}</td>
                            <td>{formatPrice(listing.price)}</td>
                            <td>{listing.featured ? "Igen" : "—"}</td>
                            <td className="admin-table-actions">
                              <button
                                className="btn btn-outline btn-small"
                                onClick={() => setEditing(listing)}
                              >
                                Szerkesztés
                              </button>
                              <button
                                className="btn btn-danger btn-small"
                                onClick={() => handleDelete(listing)}
                              >
                                Törlés
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {view === "projects" && (
          <>
            {editing ? (
              <div className="admin-panel">
                <h2>{editing === "new" ? "Új projekt hozzáadása" : "Projekt szerkesztése"}</h2>
                {formError && <div className="form-status error">{formError}</div>}
                <AdminListingForm
                  initial={editing === "new" ? null : editing}
                  token={token}
                  kind="projekt"
                  onSubmit={handleFormSubmit}
                  onCancel={() => {
                    setEditing(null);
                    setFormError(null);
                  }}
                  submitting={saving}
                />
              </div>
            ) : (
              <div className="admin-panel">
                <div className="admin-panel-header">
                  <h2>Projektek ({projects.length})</h2>
                  <button className="btn btn-primary" onClick={() => setEditing("new")}>
                    + Új projekt
                  </button>
                </div>

                {projectError && <div className="form-status error">{projectError}</div>}
                {loadingProjects && <div className="loading-state">Betöltés…</div>}

                {!loadingProjects && projects.length === 0 && !projectError && (
                  <div className="empty-state">Még nincs felvett projekt.</div>
                )}

                {!loadingProjects && projects.length > 0 && (
                  <div className="admin-table-wrap">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Cím</th>
                          <th>Kategória</th>
                          <th>Település</th>
                          <th>Ár</th>
                          <th>Kiemelt</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {projects.map((project) => (
                          <tr key={project._id}>
                            <td>{project.title}</td>
                            <td>{project.category}</td>
                            <td>{project.city}</td>
                            <td>{formatPrice(project.price)}</td>
                            <td>{project.featured ? "Igen" : "—"}</td>
                            <td className="admin-table-actions">
                              <button
                                className="btn btn-outline btn-small"
                                onClick={() => setEditing(project)}
                              >
                                Szerkesztés
                              </button>
                              <button
                                className="btn btn-danger btn-small"
                                onClick={() => handleDeleteProject(project)}
                              >
                                Törlés
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {view === "appointments" && (
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h2>Időpontfoglalások ({appointments.length})</h2>
            </div>

            <div className="google-sync-card">
              {googleRedirectResult === "connected" && (
                <div className="form-status success">Google Naptár sikeresen összekapcsolva.</div>
              )}
              {googleRedirectResult === "error" && (
                <div className="form-status error">
                  A Google összekapcsolás sikertelen volt, próbáld újra.
                </div>
              )}
              {googleError && <div className="form-status error">{googleError}</div>}

              {googleStatus && !googleStatus.configured && (
                <p>
                  A Google Naptár integráció nincs beállítva a szerveren (hiányzó
                  GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REDIRECT_URI).
                </p>
              )}

              {googleStatus?.configured && (
                <div className="google-sync-row">
                  <div>
                    <strong>Google Naptár</strong>
                    <span className={`google-sync-status ${googleStatus.connected ? "connected" : ""}`}>
                      {googleStatus.connected ? "Összekapcsolva" : "Nincs összekapcsolva"}
                    </span>
                  </div>
                  {googleStatus.connected ? (
                    <button className="btn btn-outline btn-small" onClick={handleDisconnectGoogle}>
                      Leválasztás
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-small"
                      onClick={handleConnectGoogle}
                      disabled={connectingGoogle}
                    >
                      {connectingGoogle ? "Átirányítás…" : "Összekapcsolás"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {appointmentsError && <div className="form-status error">{appointmentsError}</div>}
            {loadingAppointments && <div className="loading-state">Betöltés…</div>}

            {!loadingAppointments && appointments.length === 0 && !appointmentsError && (
              <div className="empty-state">Jelenleg nincs foglalás.</div>
            )}

            {!loadingAppointments && appointments.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Dátum</th>
                      <th>Idő</th>
                      <th>Szolgáltatás</th>
                      <th>Név</th>
                      <th>Elérhetőség</th>
                      <th>Megjegyzés</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((appt) => (
                      <tr key={appt._id}>
                        <td>{appt.date}</td>
                        <td>{appt.time}</td>
                        <td>{appt.serviceType}</td>
                        <td>{appt.name}</td>
                        <td>
                          <div>{appt.email}</div>
                          {appt.phone && <div>{appt.phone}</div>}
                        </td>
                        <td>{appt.notes || "—"}</td>
                        <td className="admin-table-actions">
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleCancelAppointment(appt)}
                          >
                            Lemondás
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {view === "messages" && (
          <div className="admin-panel">
            <div className="admin-panel-header">
              <h2>Üzenetek ({messages.length})</h2>
            </div>

            {messagesError && <div className="form-status error">{messagesError}</div>}
            {loadingMessages && <div className="loading-state">Betöltés…</div>}

            {!loadingMessages && messages.length === 0 && !messagesError && (
              <div className="empty-state">Még nem érkezett üzenet.</div>
            )}

            {!loadingMessages && messages.length > 0 && (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Dátum</th>
                      <th>Név</th>
                      <th>Elérhetőség</th>
                      <th>Üzenet</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map((msg) => (
                      <tr key={msg._id}>
                        <td>{new Date(msg.createdAt).toLocaleString("hu-HU")}</td>
                        <td>{msg.name}</td>
                        <td>
                          <div>{msg.email}</div>
                          {msg.phone && <div>{msg.phone}</div>}
                        </td>
                        <td>{msg.message}</td>
                        <td className="admin-table-actions">
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleDeleteMessage(msg)}
                          >
                            Törlés
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
