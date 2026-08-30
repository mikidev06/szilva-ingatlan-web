import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchListing, formatPriceRange } from "../api";
import Gallery from "../components/Gallery";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchListing(id)
      .then(setProject)
      .catch(() => setError("Nem található ilyen projekt."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="loading-state">Betöltés…</div>;
  }

  if (error || !project) {
    return (
      <div className="empty-state">
        {error || "Nem található projekt."}
        <div style={{ marginTop: 20 }}>
          <Link to="/projektek" className="btn btn-outline">
            Vissza a projektekhez
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <Link to="/projektek" className="back-link">
          ← Vissza a projektekhez
        </Link>

        <div className="detail-layout">
          <div>
            <Gallery images={project.images} title={project.title} />

            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <strong>{project.size} m²</strong>
                <span>Alapterület</span>
              </div>
              <div className="detail-meta-item">
                <strong>{project.rooms}</strong>
                <span>Szoba</span>
              </div>
              <div className="detail-meta-item">
                <strong>{project.category}</strong>
                <span>Típus</span>
              </div>
            </div>

            <h2>Leírás</h2>
            <p>{project.description || "Ehhez a projekthez még nincs részletes leírás megadva."}</p>
          </div>

          <div className="sidebar-card">
            <h1 style={{ fontSize: "1.4rem" }}>{project.title}</h1>
            <div className="listing-location" style={{ marginBottom: 16 }}>
              📍 {project.city}
              {project.address ? `, ${project.address}` : ""}
            </div>
            <div className="listing-price" style={{ fontSize: "1.6rem", marginBottom: 20 }}>
              {formatPriceRange(project.priceMin, project.priceMax)}
            </div>

            <Link to="/kapcsolat" className="btn btn-primary btn-block">
              Érdeklődöm
            </Link>

            <div className="contact-info-list">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
