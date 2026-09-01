"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { AppSidebar } from "@/components/AppSidebar";
import { ModePill } from "@/components/ModePill";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useSession } from "@/components/session/SessionProvider";
import { Mark } from "@/components/Brand";

/**
 * Authenticated product shell.
 *
 * The guard is client-side because the site ships as a static export — there is
 * no server to redirect on. That is honest for what this is: the session is a
 * browser flag, and the guard exists to make the product *navigate* correctly,
 * not to protect anything. A real deployment moves this to middleware.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { status, needsOnboarding } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") router.replace("/signin");
    else if (needsOnboarding) router.replace("/onboarding");
  }, [status, needsOnboarding, router]);

  if (status !== "authenticated" || needsOnboarding) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <div className="flex items-center gap-2.5 text-mid">
          <Mark />
          <span className="text-body">Loading workspace…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="sticky top-0 hidden h-screen lg:block">
        <AppSidebar />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-hairline bg-canvas/85 px-5 backdrop-blur-md">
          <Breadcrumbs pathname={pathname} />
          <div className="ml-auto flex items-center gap-2.5">
            <ModePill />
            <ThemeToggle />
          </div>
        </header>

        <main className="min-w-0 flex-1 px-5 py-7">
          <div className="mx-auto max-w-wide">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Typographic only — chevrons and colour, no chrome. DESIGN.md breadcrumb. */
function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname.split("/").filter(Boolean).slice(1); // drop "app"
  const labels: Record<string, string> = {
    repos: "Repositories",
    analysis: "Analysis",
    trend: "Trends",
    settings: "Policy & team",
    billing: "Plan & usage",
  };

  const crumbs = parts.length === 0 ? ["Repositories"] : parts.map((p) => labels[p] ?? p);

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2 text-body">
      <span className="shrink-0 text-mid">Acme Payments</span>
      {crumbs.map((c, i) => (
        <React.Fragment key={`${c}-${i}`}>
          <span className="shrink-0 text-faint" aria-hidden>›</span>
          <span className={i === crumbs.length - 1 ? "truncate font-medium text-ink" : "shrink-0 text-mid"}>
            {c}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}
