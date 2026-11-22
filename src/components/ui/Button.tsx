import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

/** Small lift, a soft shadow and a tiny scale. Only transform, opacity and colour move. */
const base =
  "group inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[15px] font-medium tracking-tight " +
  "transition-[transform,box-shadow,background-color,color,border-color] duration-300 ease-[var(--ease-expo)] " +
  "hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_10px_24px_-10px_rgba(0,0,0,0.9)] " +
  "active:translate-y-0 active:scale-[0.98] active:shadow-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-[#8d63ff] hover:shadow-[0_10px_28px_-10px_rgba(124,77,255,0.55)]",
  secondary: "border border-white/25 text-white hover:border-white hover:bg-white hover:text-black",
  ghost: "text-white/80 hover:text-white",
};

interface ButtonProps {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
  /** Open in a new tab. */
  external?: boolean;
}

export default function Button({ href, variant = "primary", children, className = "", external = true }: ButtonProps) {
  return (
    <a
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

export function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden fill="currentColor">
      <path d="M3 1.5v11l9-5.5-9-5.5z" />
    </svg>
  );
}

export function GithubIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5z" />
    </svg>
  );
}

export function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14" />
    </svg>
  );
}
