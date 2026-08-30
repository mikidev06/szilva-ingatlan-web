import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container not-found">
        <span className="eyebrow">404</span>
        <h1>Ez az oldal nem található</h1>
        <p>
          Lehet, hogy elavult a link, vagy elgépelte a címet. Nézzen körül az
          alábbi oldalakon.
        </p>
        <div className="not-found-actions">
          <Link to="/" className="btn btn-primary">
            Vissza a főoldalra
          </Link>
          <Link to="/ingatlanok" className="btn btn-outline">
            Ingatlanok böngészése
          </Link>
        </div>
      </div>
    </section>
  );
}
