import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { fetchListing, formatPrice } from "../api";
import Gallery from "../components/Gallery";

export default function ListingDetail() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchListing(id)
      .then(setListing)
      .catch(() => setError("Nem található ilyen ingatlan."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="loading-state">Betöltés…</div>;
  }

  if (error || !listing) {
    return (
      <div className="empty-state">
        {error || "Nem található ingatlan."}
        <div style={{ marginTop: 20 }}>
          <Link to="/ingatlanok" className="btn btn-outline">
            Vissza az ingatlanokhoz
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container">
        <Link to="/ingatlanok" className="back-link">
          ← Vissza az ingatlanokhoz
        </Link>

        <div className="detail-layout">
          <div>
            <Gallery images={listing.images} title={listing.title} />

            <div className="detail-meta-grid">
              <div className="detail-meta-item">
                <strong>{listing.size} m²</strong>
                <span>Alapterület</span>
              </div>
              <div className="detail-meta-item">
                <strong>{listing.rooms}</strong>
                <span>Szoba</span>
              </div>
              <div className="detail-meta-item">
                <strong>{listing.category}</strong>
                <span>Típus</span>
              </div>
            </div>

            <h2>Leírás</h2>
            <p>{listing.description || "Ehhez az ingatlanhoz még nincs részletes leírás megadva."}</p>
          </div>

          <div className="sidebar-card">
            <h1 style={{ fontSize: "1.4rem" }}>{listing.title}</h1>
            <div className="listing-location" style={{ marginBottom: 16 }}>
              📍 {listing.city}
              {listing.address ? `, ${listing.address}` : ""}
            </div>
            <div className="listing-price" style={{ fontSize: "1.6rem", marginBottom: 20 }}>
              {formatPrice(listing.price)}
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
