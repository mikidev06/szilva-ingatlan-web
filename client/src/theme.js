const STORAGE_KEY = "theme";

export function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getEffectiveTheme() {
  return getStoredTheme() || getSystemTheme();
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function setTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // pl. privát böngészés - a valasztas ekkor csak a munkamenetre ervenyes
  }
  applyTheme(theme);
}

export function bootstrapTheme() {
  const stored = getStoredTheme();
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  }
}

// Temavaltas egy kort noveszto "reveal" animacioval, ami a valto gombtol
// indul es az egesz oldalt lefedi - a View Transitions API-val, mert az a
// teljes oldalt pillanatkepkent kezeli, igy a hatterszinek mellett a
// CSS valtozokbol epulo gradienseket (pl. a hero-szekcio) is szepen,
// ugras nelkul valtja at, amit egy sima CSS transition nem tudna.
export function setThemeWithTransition(theme, origin, onApplied) {
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (typeof document === "undefined" || !document.startViewTransition || reducedMotion) {
    setTheme(theme);
    onApplied?.();
    return;
  }

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // A kor kozeppontjat es vegso sugarat CSS valtozokent adjuk at (nem
  // document.documentElement.animate()-tel, kesobb) - a
  // ::view-transition-new(root) csomopont a "theme-reveal" CSS
  // kulcskocka-animaciot mar a legelso kirajzolt framen a "0px" allapotbol
  // inditja, igy nincs egy pillanatnyi res, amiben a leplezetlen uj tema
  // felvillanna, majd a kor animacio inditasakor visszaugrana a regire.
  const root = document.documentElement;
  root.style.setProperty("--theme-reveal-x", `${x}px`);
  root.style.setProperty("--theme-reveal-y", `${y}px`);
  root.style.setProperty("--theme-reveal-r", `${endRadius}px`);

  // onApplied-et (pl. a gomb ikonjat valto React allapotot) is a
  // callbacken belul, flushSync-kel kell meghivni, kulonben a React
  // renderelese a "regi"/"uj" pillanatkep felvetele KOZOTT, kulon
  // frame-ben villanna be - ettol tunt "akadozonak" a valtas.
  const transition = document.startViewTransition(() => {
    setTheme(theme);
    onApplied?.();
  });

  transition.finished.finally(() => {
    root.style.removeProperty("--theme-reveal-x");
    root.style.removeProperty("--theme-reveal-y");
    root.style.removeProperty("--theme-reveal-r");
  });
}
