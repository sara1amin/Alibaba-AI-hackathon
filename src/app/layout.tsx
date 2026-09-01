import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModeProvider } from "@/components/ModeProvider";
import { AppShell } from "@/components/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "PipelineGuard — CI/CD supply-chain agent",
  description:
    "An agent that reads your pipeline, shows its reasoning, fixes what is provably safe, escalates what is a judgement call, and refuses what it cannot establish.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
    { media: "(prefers-color-scheme: light)", color: "#f5f5f5" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen font-sans text-body antialiased">
        <ThemeProvider>
          <ModeProvider>
            <AppShell>{children}</AppShell>
          </ModeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
