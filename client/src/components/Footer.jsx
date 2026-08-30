import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div className="footer-brand">Szilágyi Szilvia</div>
            <p>
              Otthonteremtési szakértő
            </p>
            <div className="footer-social">
              <a
                href="https://www.facebook.com/p/Szil%C3%A1gyi-Szilvia-Ingatlank%C3%B6zvet%C3%ADt%C5%91-100057325964629/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.86c0-2.51 1.49-3.9 3.77-3.9 1.09 0 2.24.2 2.24.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.88h2.78l-.44 2.91h-2.34V22c4.78-.76 8.44-4.92 8.44-9.94Z" />
                </svg>
              </a>
              <a
                href="https://www.youtube.com/@donnafatamiseriadsilva9448"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
                  <path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 0 0 .5 6.19 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.81 3.02 3.02 0 0 0 2.12 2.14C4.5 20.5 12 20.5 12 20.5s7.5 0 9.38-.55a3.02 3.02 0 0 0 2.12-2.14A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.81ZM9.6 15.6V8.4l6.32 3.6-6.32 3.6Z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Navigáció</h4>
            <ul>
              <li>
                <Link to="/">Főoldal</Link>
              </li>
              <li>
                <Link to="/ingatlanok">Ingatlanok</Link>
              </li>
              <li>
                <Link to="/projektek">Projektek</Link>
              </li>
              <li>
                <Link to="/rolam">Rólam</Link>
              </li>
              <li>
                <Link to="/kapcsolat">Kapcsolat</Link>
              </li>
              <li>
                <Link to="/idopontfoglalas">Időpontfoglalás</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Szolgáltatások</h4>
            <ul>
              <li>
                <span>Ingatlan értékesítés</span>
              </li>
              <li>
                <span>Projektértékesítés</span>
              </li>
              <li>
                <span>Hitelügyintézés</span>
              </li>
              <li>
                <span>Jogi ügyintézés</span>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Elérhetőség</h4>
            <ul>
              <li>
                <span>1013 Budapest, Krisztina körút 32.</span>
              </li>
              <li>
                <a href="tel:+36305059660">+36 30 505 9660</a>
              </li>
              <li>
                <a href="mailto:szilagyi.szilva@otpip.hu">
                  szilagyi.szilva@otpip.hu
                </a>
              </li>
              <li>
                <a
                  href="https://partner.ingatlan.com/szilagyi.szilvia3"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ingatlan.com profil
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Szilva Ingatlan Kft. Minden jog fenntartva.</span>
          <Link to="/adatvedelem">Adatvédelmi tájékoztató</Link>
        </div>
      </div>
    </footer>
  );
}
