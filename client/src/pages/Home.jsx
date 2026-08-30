import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { fetchListings } from "../api";
import szilviaPhoto from "../assets/szilva-1.jpg";

const services = [
  {
    icon: "🏠",
    title: "Ingatlan értékesítés",
    text: "Teljes körű ügyintézés az első megtekintéstől az adásvételi szerződésen keresztül a birtokbaadásig.",
  },
  {
    icon: "🏗️",
    title: "Projektértékesítés",
    text: "Új építésű lakóparkok és fejlesztési projektek értékesítése az első egyeztetéstől a kulcsátadásig.",
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
  const [featuredProjects, setFeaturedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const navigate = useNavigate();

  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    fetchListings("ingatlan")
      .then((data) => setFeatured(data.filter((l) => l.featured).slice(0, 3)))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));

    fetchListings("projekt")
      .then((data) => setFeaturedProjects(data.filter((p) => p.featured).slice(0, 3)))
      .catch(() => setFeaturedProjects([]))
      .finally(() => setLoadingProjects(false));
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
            <h1>Újépítésű ingatlant keres?</h1>
            <h2>Segítek megtalálni az ideális otthonát.</h2>
            <p>
              Szilágyi Szilvia vagyok, ingatlanközvetítő, hitelszakértő.
              Segítek Önnek megtalálni az önhöz illő ingatlant.
            </p>
            <div className="hero-actions">
              <Link to="/ingatlanok" className="btn btn-primary">
                Ingatlanok böngészése
              </Link>
              <Link to="/projektek" className="btn btn-primary">
                Projektek böngészése
              </Link>
              <br></br>
              <Link to="/kapcsolat" className="btn btn-outline">
                Kapcsolatfelvétel
              </Link>
            </div>
            <div className="hero-stats">
              <div className="hero-stat">
                <strong>300+</strong>
                <span>Sikeres tranzakció</span>
              </div>
              <div className="hero-stat">
                <strong>11 év</strong>
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
              Otthonteremtési szakértő
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

      {(loadingProjects || featuredProjects.length > 0) && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="eyebrow">Kiemelt projektek</span>
              <h2>Nézze meg legfrissebb projektjeinket</h2>
              <p>Néhány aktuális, kiemelt fejlesztésünk.</p>
            </div>

            {loadingProjects && <div className="loading-state">Betöltés…</div>}

            {!loadingProjects && featuredProjects.length > 0 && (
              <div className="listing-grid">
                {featuredProjects.map((project) => (
                  <ListingCard key={project._id} listing={project} basePath="/projektek" />
                ))}
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 40 }}>
              <Link to="/projektek" className="btn btn-outline">
                Összes projekt megtekintése
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section section-alt">
        <div className="container">
          <div className="stats-strip">
            <div>
              <strong>1000+</strong>
              <span>Kezelt megbízás</span>
            </div>
            <div>
              <strong>200+</strong>
              <span>Sikeres hitelesítés</span>
            </div>
            <div>
              <strong>11</strong>
              <span>Év tapasztalat</span>
            </div>
            <div>
              <strong>20+</strong>
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
            <br></br>
            <Link to="/idopontfoglalas" className="btn btn-primary">
              Időpontot kérek
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
