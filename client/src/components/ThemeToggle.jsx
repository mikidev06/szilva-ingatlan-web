import { useState } from "react";
import { getEffectiveTheme, setTheme } from "../theme";

export default function ThemeToggle() {
  const [theme, setThemeState] = useState(getEffectiveTheme);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Világos mód bekapcsolása" : "Sötét mód bekapcsolása"}
      title={theme === "dark" ? "Világos mód" : "Sötét mód"}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
