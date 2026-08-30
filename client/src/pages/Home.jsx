import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { fetchListings } from "../api";
import szilviaPhoto from "../assets/szilva-1.jpg";

const services = [
  {
    icon: "🏠",
    title: "Ingatlan értékesítés",
    text: "Teljes körű ügyintézés a hirdetéstől az adásvételi szerződésig, hogy Ön a lehető legjobb áron, gyorsan adhassa el ingatlanát.",
  },
  {
    icon: "🏗️",
    title: "Projektépítkezés",
    text: "Új építésű lakóparkok és fejlesztési projektek értékesítésében is segítek, az első egyeztetéstől a kulcsátadásig.",
  },
  {
    icon: "🏦",
    title: "Hitelügyintézés",
    text: "Segítek eligazodni a lakáshitel-lehetőségek között, és végigkísérem a teljes hitelügyintézési folyamatot.",
  },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchListings()
      .then((data) => setFeatured(data.filter((l) => l.featured).slice(0, 3)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location) params.set("city", location);
    if (category) params.set("category", category);
    navigate(`/ingatlanok${params.toString() ? `?${params.toString()}` : ""}`);
  }

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">Ingatlanközvetítés bizalommal</span>
            <h1>Adja el ingatlanát magabiztosan</h1>
            <p>
              Szilágyi Szilvia vagyok, ingatlanközvetítő.
              Segítek Önnek ingatlanát gyorsan, átláthatóan és
              stresszmentesen értékesíteni.
            </p>
            <div className="hero-actions">
              <Link to="/ingatlanok" className="btn btn-primary">
                Ingatlanok böngészése
              </Link>
              <Link to="/kapcsolat" className="btn btn-outline">
                Kapcsolatfelvétel
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>120+</strong>
                <span>Sikeres tranzakció</span>
              </div>
              <div className="hero-stat">
                <strong>10 év</strong>
                <span>Szakmai tapasztalat</span>
              </div>
              <div className="hero-stat">
                <strong>Magyar, Angol, Olasz</strong>
                <span>Nyelvtudás</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src={szilviaPhoto}
              alt="Szilágyi Szilvia ingatlanközvetítő"
            />
            <div className="hero-badge">
              <strong>Szilágyi Szilvia</strong>
              Ingatlanközvetítő
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="field">
            <label htmlFor="q-location">Helyszín</label>
            <input
              id="q-location"
              type="text"
              placeholder="Pl. Budapest"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="q-category">Kategória</label>
            <select
              id="q-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Összes</option>
              <option value="Lakás">Lakás</option>
              <option value="Ház">Ház</option>
              <option value="Telek">Telek</option>
              <option value="Iroda">Iroda</option>
              <option value="Nyaraló">Nyaraló</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">
            Keresés
          </button>
        </form>
      </div>

      {(loading || featured.length > 0) && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Kiemelt ajánlatok</span>
              <h2>Nézze meg legfrissebb ingatlanjainkat</h2>
              <p>Néhány aktuális, kiemelt hirdetésünk.</p>
            </div>

            {loading && <div className="loading-state">Betöltés…</div>}

            {!loading && featured.length > 0 && (
              <div className="listing-grid">
                {featured.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} />
                ))}
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link to="/ingatlanok" className="btn btn-outline">
                Összes ingatlan megtekintése
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section section-alt">
        <div className="container">
          <div className="stats-strip">
            <div>
              <strong>250+</strong>
              <span>Kezelt ingatlan</span>
            </div>
            <div>
              <strong>120+</strong>
              <span>Elégedett ügyfél</span>
            </div>
            <div>
              <strong>10</strong>
              <span>Év tapasztalat</span>
            </div>
            <div>
              <strong>15</strong>
              <span>Kiszolgált település</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Szolgáltatások</span>
            <h2>Miben segíthetek Önnek?</h2>
            <p>A legfontosabb szolgáltatásaim röviden.</p>
          </div>
          <div className="services-grid">
            {services.map((service) => (
              <div className="service-card" key={service.title}>
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="cta-band">
            <h2>Készen áll a következő lépésre?</h2>
            <p>
              Vegye fel velem a kapcsolatot egy ingyenes, nem kötelező
              érvényű konzultációért.
            </p>
            <Link to="/idopontfoglalas" className="btn btn-primary">
              Időpontot kérek
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
