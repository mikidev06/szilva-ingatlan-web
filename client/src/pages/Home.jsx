import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ListingCard from "../components/ListingCard";
import { fetchListings } from "../api";
import szilviaPhoto from "../assets/szilva-1.webp";

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
  // The live combined count of standalone properties and of the individual
  // apartments inside projects, for the hero statistic (not the number of
  // projects, but of the apartments within them). Null until the results of
  // both queries are available.
  const [totalCount, setTotalCount] = useState(null);

  useEffect(() => {
    let listingsCount = null;
    let projectUnitsCount = null;

    function maybeSetTotal() {
      if (listingsCount !== null && projectUnitsCount !== null) {
        setTotalCount(listingsCount + projectUnitsCount);
      }
    }

    fetchListings("ingatlan")
      .then((data) => {
        setFeatured(data.filter((l) => l.featured).slice(0, 3));
        listingsCount = data.length;
      })
      .catch(() => {
        setFeatured([]);
        listingsCount = 0;
      })
      .finally(() => {
        setLoading(false);
        maybeSetTotal();
      });

    fetchListings("projekt")
      .then((data) => {
        setFeaturedProjects(data.filter((p) => p.featured).slice(0, 3));
        projectUnitsCount = data.reduce((sum, p) => sum + (Number(p.availableUnits) || 0), 0);
      })
      .catch(() => {
        setFeaturedProjects([]);
        projectUnitsCount = 0;
      })
      .finally(() => {
        setLoadingProjects(false);
        maybeSetTotal();
      });
  }, []);

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
                <strong>{totalCount === null ? "–" : totalCount}</strong>
                <span>Elérhető ingatlan</span>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <img
              src={szilviaPhoto}
              alt="Szilágyi Szilvia ingatlanközvetítő"
              width="1200"
              height="1200"
              fetchPriority="high"
              decoding="async"
            />
            <div className="hero-badge">
              <strong>Szilágyi Szilvia</strong>
              Otthonteremtési szakértő
            </div>
          </div>
        </div>
      </section>

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
              <span>Sikeres hitelügyintézés</span>
            </div>
            <div>
              <strong>11</strong>
              <span>Év tapasztalat</span>
            </div>
            <div>
              <strong>22</strong>
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
