"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Mark } from "./Brand";
import { OrgSwitcher } from "./OrgSwitcher";
import { Avatar } from "./Avatar";
import { useSession } from "./session/SessionProvider";
import { repos } from "@/data/repos";

/**
 * Product navigation.
 *
 * DESIGN.md puts the sidebar one tonal step off the canvas with no divider —
 * the surface change is the separation. The connected repositories are listed
 * inline rather than hidden behind the Repositories page, because "this watches
 * a fleet" is the single fact that distinguishes a platform from a dashboard.
 */

const NAV = [
  {
    href: "/app",
    label: "Repositories",
    icon: (
      <>
        <rect x="2.5" y="3" width="11" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2.5 6h11" stroke="currentColor" strokeWidth="1.3" />
      </>
    ),
  },
  {
    href: "/app/trend",
    label: "Trends",
    icon: (
      <path d="M2.5 11.5 6 7.5l2.5 2.5 5-6" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: "/app/settings",
    label: "Policy & team",
    icon: (
      <>
        <circle cx="8" cy="8" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 1.8v1.6M8 12.6v1.6M1.8 8h1.6M12.6 8h1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M12.4 3.6l-1.1 1.1M4.7 11.3l-1.1 1.1"
          stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </>
    ),
  },
  {
    href: "/app/billing",
    label: "Plan & usage",
    icon: (
      <>
        <rect x="2" y="4" width="12" height="8" rx="2" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M2 7h12" stroke="currentColor" strokeWidth="1.3" />
      </>
    ),
  },
];

function NavLink({
  href, label, icon, exact,
}: { href: string; label: string; icon: React.ReactNode; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-nested px-2.5 py-1.5 text-body transition-colors",
        active ? "bg-nested font-medium text-ink" : "text-mid hover:bg-nested/60 hover:text-ink",
      )}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="shrink-0">
        {icon}
      </svg>
      {label}
    </Link>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { user, signOut } = useSession();

  return (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r border-hairline bg-elevated">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <Link href="/app" className="flex items-center gap-2.5">
          <Mark />
          <span className="text-body font-semibold tracking-tight text-ink">PipelineGuard</span>
        </Link>
      </div>

      <div className="px-3 pb-2">
        <OrgSwitcher />
      </div>

      <nav className="flex flex-col gap-0.5 px-3" aria-label="Product">
        <NavLink href="/app" label="Repositories" icon={NAV[0].icon} exact />
        {NAV.slice(1).map((n) => (
          <NavLink key={n.href} {...n} />
        ))}
      </nav>

      {/* Connected repositories — the fleet, always visible */}
      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-3">
        <div className="flex items-center justify-between px-2.5 pb-1.5">
          <span className="text-micro font-medium uppercase tracking-wider text-faint">
            Connected
          </span>
          <span className="text-micro text-faint tnum">{repos.length}</span>
        </div>
        <ul className="flex flex-col gap-0.5">
          {repos.map((r) => {
            const href = `/app/repos/${r.name}`;
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={r.id}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-2 rounded-nested px-2.5 py-1.5 transition-colors",
                    active ? "bg-nested" : "hover:bg-nested/60",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 shrink-0 rounded-full",
                      r.status === "scanning" ? "animate-pulse-dot bg-medium"
                        : r.status === "paused" ? "bg-faint"
                        : r.riskScore > 50 ? "bg-high" : "bg-verified",
                    )}
                    aria-hidden
                  />
                  <span className={cn("min-w-0 flex-1 truncate font-mono text-[12px]", active ? "text-ink" : "text-mid")}>
                    {r.name}
                  </span>
                  {r.openFindings > 0 && (
                    <span className="shrink-0 text-micro text-faint tnum">{r.openFindings}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Account */}
      <div className="border-t border-hairline p-3">
        <div className="flex items-center gap-2.5 px-1">
          {user && <Avatar name={user.name} hue={user.avatarHue} size={26} />}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-caption font-medium tracking-normal text-ink">
              {user?.name}
            </span>
            <span className="block truncate text-micro tracking-normal text-faint">{user?.email}</span>
          </span>
          <button
            type="button"
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
            className="shrink-0 rounded-small p-1 text-faint transition-colors hover:text-ink"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M5.5 2.2H3.4A1.2 1.2 0 0 0 2.2 3.4v7.2a1.2 1.2 0 0 0 1.2 1.2h2.1" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M9 4.6 11.4 7 9 9.4M11.4 7H5.8" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
