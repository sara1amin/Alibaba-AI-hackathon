"use client";

import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="flex h-8 items-center gap-1.5 rounded-control border border-hairline px-2.5 text-mid transition-colors hover:border-hairline-strong hover:text-ink"
    >
      {theme === "dark" ? (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <circle cx="7" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 .8v1.6M7 11.6v1.6M1.4 7H3M11 7h1.6M3.05 3.05l1.13 1.13M9.82 9.82l1.13 1.13M10.95 3.05 9.82 4.18M4.18 9.82l-1.13 1.13"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M12 8.6A5.6 5.6 0 1 1 5.4 2a4.4 4.4 0 0 0 6.6 6.6Z"
            fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      )}
      <span className="hidden text-caption font-medium tracking-normal sm:inline">
        {theme === "dark" ? "Light" : "Dark"}
      </span>
    </button>
  );
}
