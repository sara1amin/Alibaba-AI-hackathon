"use client";

import Link from "next/link";
import { Wordmark } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/primitives";
import { useSession } from "./session/SessionProvider";

export function MarketingNav() {
  const { status } = useSession();
  const signedIn = status === "authenticated";

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-canvas/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-page items-center gap-8 px-5">
        <Wordmark />
        <nav className="hidden items-center gap-6 md:flex" aria-label="Marketing">
          {[
            ["How it works", "#how"],
            ["The three outcomes", "#outcomes"],
            ["Pricing", "#pricing"],
          ].map(([label, href]) => (
            <a key={href} href={href} className="text-body text-mid transition-colors hover:text-ink">
              {label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          {signedIn ? (
            <Link href="/app"><Button variant="primary" size="sm">Open dashboard</Button></Link>
          ) : (
            <>
              <Link href="/signin" className="hidden text-body text-mid transition-colors hover:text-ink sm:block">
                Sign in
              </Link>
              <Link href="/signin"><Button variant="primary" size="sm">Start free</Button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
