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
              Több éves tapasztalattal segítek ügyfeleimnek sikeresen
              értékesíteni vagy kiadni ingatlanukat.
            </p>
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
                <Link to="/rolam">Rólam</Link>
              </li>
              <li>
                <Link to="/kapcsolat">Kapcsolat</Link>
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
                <span>Ingatlan bérbeadás</span>
              </li>
              <li>
                <span>Ingatlan értékbecslés</span>
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
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} Szilágyi Szilvia Ingatlanközvetítő. Minden jog fenntartva.</span>
        </div>
      </div>
    </footer>
  );
}
