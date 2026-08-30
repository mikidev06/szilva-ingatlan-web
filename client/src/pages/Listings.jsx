import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { fetchListings } from "../api";

export default function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const city = searchParams.get("city") || "";
  const category = searchParams.get("category") || "";

  useEffect(() => {
    fetchListings()
      .then(setListings)
      .catch(() => setError("Nem sikerült betölteni az ingatlanokat."))
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
    return listings.filter((l) => {
      if (category && l.category !== category) return false;
      if (city && !l.city.toLowerCase().includes(city.toLowerCase()))
        return false;
      return true;
    });
  }, [listings, category, city]);

  const hasActiveFilters = Boolean(city || category);

  return (
    <>
      <div className="page-header">
        <div className="container">
          <span className="eyebrow">Ingatlanjaink</span>
          <h1>Böngésszen aktuális ajánlataink között</h1>
          <p>Nézze meg jelenlegi eladó ingatlanjainkat.</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <form className="search-bar" style={{ marginTop: 0 }} onSubmit={(e) => e.preventDefault()}>
            <div className="field">
              <label htmlFor="f-city">Helyszín</label>
              <input
                id="f-city"
                type="text"
                placeholder="Pl. Budapest"
                value={city}
                onChange={(e) => updateFilter("city", e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="f-category">Kategória</label>
              <select
                id="f-category"
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
                    Nincs a keresésnek megfelelő ingatlan. Próbálja meg
                    módosítani vagy törölni a szűrőket.
                  </>
                ) : (
                  <>
                    Jelenleg nincs aktív ingatlanhirdetésünk. Nézzen vissza
                    hamarosan, vagy vegye fel velünk a kapcsolatot!
                  </>
                )}
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div className="listing-grid">
                {filtered.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
