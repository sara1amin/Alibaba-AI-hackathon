"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mark } from "@/components/Brand";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button, Card, Divider } from "@/components/ui/primitives";
import { useSession } from "@/components/session/SessionProvider";

/**
 * Sign in.
 *
 * The GitHub button is mocked, and the page says so plainly. A convincing fake
 * OAuth screen that never asks for authorisation is exactly the sort of thing
 * this product exists to complain about — so the demo label stays, and it costs
 * the pitch nothing.
 */
export default function SignInPage() {
  const { status, needsOnboarding, signIn } = useSession();
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (status === "authenticated") router.replace(needsOnboarding ? "/onboarding" : "/app");
  }, [status, needsOnboarding, router]);

  function handleSignIn() {
    setBusy(true);
    // Deliberate beat so the transition reads as a round-trip rather than a jump.
    window.setTimeout(() => {
      signIn();
      router.push("/onboarding");
    }, 550);
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="flex h-14 items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="text-body font-semibold tracking-tight text-ink">PipelineGuard</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-12">
        <div className="w-full max-w-[400px]">
          <h1 className="text-heading font-semibold text-ink">Sign in</h1>
          <p className="mt-2 text-body leading-relaxed text-mid">
            PipelineGuard reads your workflows through a read-only GitHub App. It
            never writes to your repository without a policy that says it may.
          </p>

          <Card className="mt-6 p-5">
            <Button variant="primary" className="w-full" onClick={handleSignIn} disabled={busy}>
              {busy ? (
                <>
                  <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-inverse" aria-hidden />
                  Authorising…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden fill="currentColor">
                    <path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.34c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" />
                  </svg>
                  Continue with GitHub
                </>
              )}
            </Button>

            <div className="mt-3.5 flex items-center gap-2.5 rounded-nested border border-dashed border-mid/40 px-3 py-2">
              <svg width="13" height="13" viewBox="0 0 13 13" aria-hidden className="shrink-0 text-mid">
                <circle cx="6.5" cy="6.5" r="5.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6.5 3.4v3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="6.5" cy="9.2" r="0.7" fill="currentColor" />
              </svg>
              <p className="text-micro leading-relaxed tracking-normal text-mid">
                Demo build — this does not contact GitHub or request any authorisation.
                It signs you into a local session with sample data.
              </p>
            </div>

            <Divider className="my-4" />

            <p className="text-caption leading-relaxed tracking-normal text-faint">
              By continuing you agree to the terms and privacy policy. PipelineGuard
              requests <span className="text-mid">contents: read</span> and{" "}
              <span className="text-mid">actions: read</span> — nothing else.
            </p>
          </Card>

          <p className="mt-5 text-center text-caption tracking-normal text-mid">
            Not ready?{" "}
            <Link href="/" className="text-ink underline underline-offset-2">
              Read how it works
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
