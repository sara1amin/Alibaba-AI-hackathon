"use client";

import * as React from "react";

type Theme = "dark" | "light";

const ThemeCtx = React.createContext<{
  theme: Theme;
  toggle: () => void;
  /** Bumps whenever the theme changes, so token readers can re-sample. */
  epoch: number;
}>({ theme: "dark", toggle: () => {}, epoch: 0 });

const KEY = "pg.theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Dark is the default: this is a security console, and the demo room is dark.
  const [theme, setTheme] = React.useState<Theme>("dark");
  const [epoch, setEpoch] = React.useState(0);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(KEY) as Theme | null;
      if (stored === "light" || stored === "dark") setTheme(stored);
    } catch {
      /* private mode / blocked storage — the default is fine */
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    setEpoch((e) => e + 1);
    try {
      window.localStorage.setItem(KEY, theme);
    } catch {
      /* non-fatal */
    }
  }, [theme]);

  const value = React.useMemo(
    () => ({ theme, epoch, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }),
    [theme, epoch],
  );

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => React.useContext(ThemeCtx);

/**
 * Recharts sets colours as SVG presentation attributes, which do not resolve
 * `var(--x)`. So we sample the computed token values once per theme change and
 * hand Recharts concrete rgb() strings. This keeps the chart on the same
 * palette as everything else instead of maintaining a second set of hex codes.
 */
export function useTokens(names: string[]) {
  const { epoch } = useTheme();
  const [tokens, setTokens] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const next: Record<string, string> = {};
    for (const n of names) {
      const raw = cs.getPropertyValue(`--${n}`).trim();
      next[n] = raw ? `rgb(${raw})` : "currentColor";
    }
    setTokens(next);
    // `names` is a literal array at every call site; epoch drives re-sampling.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [epoch]);

  return tokens;
}
