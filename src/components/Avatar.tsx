import { cn } from "@/lib/cn";

/**
 * Initials avatar. No image hosting, no gravatar call — the hue is derived
 * from the user record so it is stable per person across renders.
 */
export function Avatar({
  name, hue, size = 28, className,
}: { name: string; hue: number; size?: number; className?: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-medium", className)}
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: `hsl(${hue} 42% 92%)`,
        color: `hsl(${hue} 45% 30%)`,
        boxShadow: "inset 0 0 0 1px rgb(var(--hairline))",
      }}
    >
      {initials}
    </span>
  );
}
