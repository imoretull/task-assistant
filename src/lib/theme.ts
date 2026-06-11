export type Theme = "light" | "dark";

const KEY = "tasknotes-theme";

export function getTheme(): Theme {
  const t = document.documentElement.dataset.theme;
  return t === "dark" ? "dark" : "light";
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(KEY, theme);
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}
