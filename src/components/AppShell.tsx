"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useTheme } from "./ThemeProvider";
import { ModePill } from "./ModePill";

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/analysis", label: "Analysis" },
  { href: "/trend", label: "Trend" },
];

function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      {/* A shield built from a pipeline arrow — geometric, no gradient, no emoji. */}
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden className="shrink-0">
        <path
          d="M10 1.6 17 4.1v5.6c0 4.1-2.8 7.2-7 8.7-4.2-1.5-7-4.6-7-8.7V4.1L10 1.6Z"
          fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"
          className="text-ink"
        />
        <path
          d="M6.4 9.9 9 12.4l4.6-4.8"
          fill="none" stroke="currentColor" strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round" className="text-critical"
        />
      </svg>
      <span className="text-body font-semibold tracking-tight text-ink">PipelineGuard</span>
    </Link>
  );
}

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className="flex h-8 w-8 items-center justify-center rounded-control border border-hairline text-mid transition-colors hover:text-ink"
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
    </button>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-wide items-center gap-6 px-5">
          <Wordmark />

          <nav className="flex items-center gap-1" aria-label="Primary">
            {NAV.map((item) => {
              const active =
                item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-control px-3 py-1.5 text-body transition-colors",
                    active ? "bg-nested font-medium text-ink" : "text-mid hover:text-ink",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2.5">
            <ModePill />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-wide px-5 py-7">{children}</main>
    </div>
  );
}
