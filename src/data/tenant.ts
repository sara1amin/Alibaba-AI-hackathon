/**
 * Tenant fixtures — the account the signed-in user belongs to.
 *
 * The shell treats org → repo → run as the tenancy chain, which is the shape a
 * real backend would persist. Swapping these fixtures for API responses should
 * not change any screen.
 */

export interface User {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatarHue: number;
  role: "owner" | "admin" | "member";
}

export interface Org {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "team" | "enterprise";
  githubInstallId: string;
  createdAt: string;
}

export const currentUser: User = {
  id: "usr_01",
  name: "Sara Amin",
  handle: "sara1amin",
  email: "sara@acme-payments.io",
  avatarHue: 210,
  role: "owner",
};

export const org: Org = {
  id: "org_01",
  name: "Acme Payments",
  slug: "acme-payments",
  plan: "team",
  githubInstallId: "48291043",
  createdAt: "2026-08-19T10:02:00Z",
};

export const members: (User & { lastActive: string })[] = [
  { ...currentUser, lastActive: "now" },
  { id: "usr_02", name: "Danish Raza", handle: "d.raza", email: "danish@acme-payments.io", avatarHue: 28, role: "admin", lastActive: "12 minutes ago" },
  { id: "usr_03", name: "Priya Nair", handle: "p.nair", email: "priya@acme-payments.io", avatarHue: 145, role: "member", lastActive: "3 hours ago" },
  { id: "usr_04", name: "Omar Sheikh", handle: "o.sheikh", email: "omar@acme-payments.io", avatarHue: 280, role: "member", lastActive: "yesterday" },
];

/** Plan limits, shown on billing and enforced (visually) on the repo list. */
export const plans = [
  {
    id: "free" as const,
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "For a single repository and one maintainer.",
    limits: ["1 repository", "Reasoning chains retained 7 days", "Flag and abstain only — no autonomous fixes"],
  },
  {
    id: "team" as const,
    name: "Team",
    price: "$29",
    cadence: "per repository / month",
    blurb: "Autonomous fixes, policy control, and the full audit trail.",
    limits: ["Unlimited repositories", "Reasoning retained 12 months", "Autonomous fixes under policy", "SAML and audit export"],
  },
  {
    id: "enterprise" as const,
    name: "Enterprise",
    price: "Custom",
    cadence: "annual",
    blurb: "Self-hosted gateway and your own model endpoint.",
    limits: ["Self-hosted analysis gateway", "Bring your own model", "Custom policy authoring", "Dedicated support"],
  },
];

/** Usage meter on billing — makes the plan feel real rather than decorative. */
export const usage = {
  repositories: { used: 5, included: null as number | null },
  scansThisMonth: { used: 1284, included: 5000 },
  autonomousFixes: { used: 109, included: 500 },
};
