import { useState } from "react";
import { NavLink } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const links = [
  { to: "/", label: "Főoldal" },
  { to: "/ingatlanok", label: "Ingatlanok" },
  { to: "/projektek", label: "Projektek" },
  { to: "/rolam", label: "Rólam" },
  { to: "/idopontfoglalas", label: "Időpontfoglalás" },
  { to: "/kapcsolat", label: "Kapcsolat" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">SZ</span>
          Szilágyi Szilvia
        </NavLink>

        <nav className={`nav-links ${open ? "open" : ""}`}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {link.label}
            </NavLink>
          ))}
          <a
            href="tel:+36305059660"
            className="btn btn-primary nav-phone-btn nav-links-phone"
            onClick={() => setOpen(false)}
          >
            +36 30 505 9660
          </a>
        </nav>

        <div className="nav-actions">
          <a href="tel:+36305059660" className="btn btn-primary nav-phone-btn">
            +36 30 505 9660
          </a>
          <ThemeToggle />
          <button
            className="nav-toggle"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Menü megnyitása"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
