"use client";

import * as React from "react";
import { currentUser, org, type Org, type User } from "@/data/tenant";

/**
 * Mocked authentication.
 *
 * Deliberately shaped like a real session provider — `useSession()` returns
 * `{ status, user, org }` with `status` moving through loading → signed-out →
 * signed-in — so swapping in NextAuth, Clerk or a custom JWT means replacing
 * this file and nothing else. Screens never read localStorage directly.
 *
 * There is no security claim here and none is implied: the session is a flag
 * in browser storage. It exists so the product *navigates* like a SaaS, not so
 * it protects anything.
 */

type Status = "loading" | "authenticated" | "unauthenticated";

interface Session {
  status: Status;
  user: User | null;
  org: Org | null;
  /** True until the user has connected at least one repository. */
  needsOnboarding: boolean;
  signIn: () => void;
  signOut: () => void;
  completeOnboarding: () => void;
}

const Ctx = React.createContext<Session>({
  status: "loading", user: null, org: null, needsOnboarding: false,
  signIn: () => {}, signOut: () => {}, completeOnboarding: () => {},
});

const SESSION_KEY = "pg.session";
const ONBOARDED_KEY = "pg.onboarded";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null; // private mode / blocked storage
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* non-fatal — the session simply will not persist */
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = React.useState<Status>("loading");
  const [onboarded, setOnboarded] = React.useState(false);

  React.useEffect(() => {
    setStatus(read(SESSION_KEY) === "active" ? "authenticated" : "unauthenticated");
    setOnboarded(read(ONBOARDED_KEY) === "true");
  }, []);

  const value = React.useMemo<Session>(
    () => ({
      status,
      user: status === "authenticated" ? currentUser : null,
      org: status === "authenticated" ? org : null,
      needsOnboarding: status === "authenticated" && !onboarded,
      signIn: () => {
        write(SESSION_KEY, "active");
        setStatus("authenticated");
      },
      signOut: () => {
        write(SESSION_KEY, null);
        write(ONBOARDED_KEY, null);
        setStatus("unauthenticated");
        setOnboarded(false);
      },
      completeOnboarding: () => {
        write(ONBOARDED_KEY, "true");
        setOnboarded(true);
      },
    }),
    [status, onboarded],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useSession = () => React.useContext(Ctx);
