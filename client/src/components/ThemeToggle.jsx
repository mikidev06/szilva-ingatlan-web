import { useRef, useState } from "react";
import { getEffectiveTheme, setThemeWithTransition } from "../theme";

export default function ThemeToggle() {
  const [theme, setThemeState] = useState(getEffectiveTheme);
  const isDark = theme === "dark";
  const buttonRef = useRef(null);

  function toggle() {
    const next = isDark ? "light" : "dark";
    const rect = buttonRef.current?.getBoundingClientRect();
    const origin = rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
    setThemeWithTransition(next, origin);
    setThemeState(next);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`theme-toggle ${isDark ? "is-dark" : ""}`}
      onClick={toggle}
      aria-label={isDark ? "Világos mód bekapcsolása" : "Sötét mód bekapcsolása"}
      title={isDark ? "Világos mód" : "Sötét mód"}
    >
      <svg
        className="theme-toggle-icon theme-toggle-sun"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8l1.8-1.8M18 6l1.8-1.8" />
      </svg>
      <svg
        className="theme-toggle-icon theme-toggle-moon"
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.5 14.5a8.5 8.5 0 1 1-9-9 7 7 0 0 0 9 9Z" />
      </svg>
    </button>
  );
}
