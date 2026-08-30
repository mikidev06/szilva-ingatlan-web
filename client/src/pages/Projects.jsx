import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { fetchListings } from "../api";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    fetchListings("projekt")
      .then(setProjects)
      .catch(() => setError("Nem sikerült betölteni a projekteket."))
      .finally(() => setLoading(false));
  }, []);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next);
  }

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (category && p.category !== category) return false;
      if (city && !p.city.toLowerCase().includes(city.toLowerCase()))
        return false;
      return true;
    });
  }, [projects, category, city]);

  const hasActiveFilters = Boolean(city || category);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Projektjeink</span>
          <h1>Böngésszen aktuális projektjeink között</h1>
          <p>Nézze meg jelenlegi új építésű fejlesztéseinket.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <form className="search-bar" style={{ marginTop: 0 }} onSubmit={(e) => e.preventDefault()}>
            <div className="field">
              <label htmlFor="pf-city">Helyszín</label>
              <input
                id="pf-city"
                type="text"
                placeholder="Pl. Budapest"
                value={city}
                onChange={(e) => updateFilter("city", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="pf-category">Kategória</label>
              <select
                id="pf-category"
                value={category}
                onChange={(e) => updateFilter("category", e.target.value)}
              >
                <option value="">Összes</option>
                <option value="Lakás">Lakás</option>
                <option value="Ház">Ház</option>
                <option value="Telek">Telek</option>
                <option value="Iroda">Iroda</option>
                <option value="Nyaraló">Nyaraló</option>
              </select>
            </div>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setSearchParams({})}
            >
              Szűrők törlése
            </button>
          </form>

          <div style={{ marginTop: 40 }}>
            {loading && <div className="loading-state">Betöltés…</div>}
            {error && <div className="empty-state">{error}</div>}

            {!loading && !error && filtered.length === 0 && (
              <div className="empty-state">
                {hasActiveFilters ? (
                  <>
                    Nincs a keresésnek megfelelő projekt. Próbálja meg
                    módosítani vagy törölni a szűrőket.
                  </>
                ) : (
                  <>
                    Jelenleg nincs aktív projektünk. Nézzen vissza hamarosan,
                    vagy vegye fel velünk a kapcsolatot!
                  </>
                )}
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="listing-grid">
                {filtered.map((project) => (
                  <ListingCard key={project._id} listing={project} basePath="/projektek" />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
