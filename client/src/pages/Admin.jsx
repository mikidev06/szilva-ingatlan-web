import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminListingForm from "../components/AdminListingForm";
import ThemeToggle from "../components/ThemeToggle";
import {
  login,
  verifyToken,
  fetchListings,
  createListing,
  updateListing,
  deleteListing,
  formatPrice,
} from "../api";

const TOKEN_KEY = "admin_token";

export default function Admin() {
  const [token, setToken] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [listings, setListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(false);
  const [listError, setListError] = useState(null);

  const [editing, setEditing] = useState(null); // null | "new" | listing object
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

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

  function loadListings() {
    setLoadingListings(true);
    setListError(null);
    fetchListings()
      .then(setListings)
      .catch(() => setListError("Nem sikerült betölteni az ingatlanokat."))
      .finally(() => setLoadingListings(false));
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
      loadListings();
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
            <h1>Ingatlanok kezelése</h1>
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

        {editing ? (
          <div className="admin-panel">
            <h2>{editing === "new" ? "Új ingatlan hozzáadása" : "Ingatlan szerkesztése"}</h2>
            {formError && <div className="form-status error">{formError}</div>}
            <AdminListingForm
              initial={editing === "new" ? null : editing}
              token={token}
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
                      <th>Típus</th>
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
                        <td>{listing.type}</td>
                        <td>{listing.city}</td>
                        <td>{formatPrice(listing.price, listing.type)}</td>
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
      </div>
    </div>
  );
}
