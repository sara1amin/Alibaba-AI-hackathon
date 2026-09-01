import type { Config } from "tailwindcss";

/**
 * PipelineGuard design system.
 *
 * Base is the monochrome "clinical blueprint" system from DESIGN.md:
 * three-tone surface stack, hairline borders, radius encodes hierarchy
 * (18px interactive / 24px container), type carries hierarchy.
 *
 * Two documented extensions (see DESIGN-NOTES.md):
 *   1. A dark theme, derived by inverting the surface stack. Dark is the
 *      default — this is a security console, not a marketing page.
 *   2. A four-family functional colour budget. Colour is never decorative;
 *      it only ever encodes severity or verdict.
 */
const config: Config = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        elevated: "rgb(var(--elevated) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        nested: "rgb(var(--nested) / <alpha-value>)",
        hairline: "rgb(var(--hairline) / <alpha-value>)",
        "hairline-strong": "rgb(var(--hairline-strong) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        "ink-soft": "rgb(var(--ink-soft) / <alpha-value>)",
        mid: "rgb(var(--mid) / <alpha-value>)",
        faint: "rgb(var(--faint) / <alpha-value>)",
        inverse: "rgb(var(--inverse) / <alpha-value>)",
        critical: "rgb(var(--critical) / <alpha-value>)",
        high: "rgb(var(--high) / <alpha-value>)",
        medium: "rgb(var(--medium) / <alpha-value>)",
        verified: "rgb(var(--verified) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        micro: ["11px", { lineHeight: "1.45", letterSpacing: "0.06em" }],
        caption: ["12px", { lineHeight: "1.33", letterSpacing: "0.05em" }],
        body: ["14px", { lineHeight: "1.43" }],
        "body-lg": ["16px", { lineHeight: "1.5" }],
        subheading: ["18px", { lineHeight: "1.56", letterSpacing: "-0.01em" }],
        "heading-sm": ["24px", { lineHeight: "1.33", letterSpacing: "-0.025em" }],
        heading: ["30px", { lineHeight: "1.2", letterSpacing: "-0.025em" }],
        "heading-lg": ["36px", { lineHeight: "1.11", letterSpacing: "-0.025em" }],
        display: ["48px", { lineHeight: "1.1", letterSpacing: "-0.05em" }],
      },
      borderRadius: {
        small: "6px",
        nested: "10px",
        control: "18px",
        card: "24px",
      },
      spacing: {
        "4.5": "18px",
        "18": "72px",
      },
      maxWidth: { page: "1280px", wide: "1600px" },
      boxShadow: {
        card: "0 0 0 1px rgb(var(--shadow-ring) / var(--shadow-ring-a)), 0 1px 3px rgb(0 0 0 / var(--shadow-a1)), 0 1px 2px -1px rgb(0 0 0 / var(--shadow-a1))",
        lifted:
          "0 0 0 1px rgb(var(--shadow-ring) / var(--shadow-ring-a)), 0 8px 24px -6px rgb(0 0 0 / var(--shadow-a2)), 0 2px 6px -2px rgb(0 0 0 / var(--shadow-a2))",
      },
      keyframes: {
        "step-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "sweep": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(300%)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "trace": { from: { strokeDashoffset: "1" }, to: { strokeDashoffset: "0" } },
      },
      animation: {
        "step-in": "step-in 260ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 200ms ease-out both",
        sweep: "sweep 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
        "pulse-dot": "pulse-dot 1.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
