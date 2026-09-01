import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModeProvider } from "@/components/ModeProvider";
import { SessionProvider } from "@/components/session/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PipelineGuard — the CI/CD agent that shows its work",
  description:
    "An agent that reads your pipeline, shows its reasoning, fixes what is provably safe, escalates what is a judgement call, and refuses what it cannot establish.",
};

export const viewport: Viewport = { themeColor: "#f5f5f5" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("pg.theme");if(t==="dark"||t==="light"){document.documentElement.setAttribute("data-theme",t)}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen font-sans text-body antialiased">
        <ThemeProvider>
          <SessionProvider>
            <ModeProvider>{children}</ModeProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
