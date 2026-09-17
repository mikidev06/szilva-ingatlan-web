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
    // e.g. private browsing - the choice then only applies to this session
  }
  applyTheme(theme);
}

export function bootstrapTheme() {
  const stored = getStoredTheme();
  if (stored === "light" || stored === "dark") {
    applyTheme(stored);
  }
}

// Theme switching with a growing circular "reveal" animation that starts at
// the toggle button and covers the whole page - done with the View Transitions
// API, because that treats the entire page as a snapshot, so besides the
// background colors it also cross-fades the gradients built from CSS variables
// (the hero section, for instance) smoothly, with no jump, which a plain CSS
// transition could not do.
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

  // The center and final radius of the circle are passed in as CSS variables
  // (rather than later, via document.documentElement.animate()) - that way the
  // ::view-transition-new(root) node starts the "theme-reveal" CSS keyframe
  // animation from its "0px" state on the very first rendered frame, so there
  // is no momentary gap in which the unmasked new theme would flash up and
  // then jump back to the old one as the circle animation starts.
  const root = document.documentElement;
  root.style.setProperty("--theme-reveal-x", `${x}px`);
  root.style.setProperty("--theme-reveal-y", `${y}px`);
  root.style.setProperty("--theme-reveal-r", `${endRadius}px`);

  // onApplied (the React state that swaps the button icon, for instance) also
  // has to be called inside the callback, with flushSync, otherwise React's
  // render would flash in BETWEEN the capture of the "old" and "new"
  // snapshots, in a separate frame - which is what made the switch look
  // "janky".
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
