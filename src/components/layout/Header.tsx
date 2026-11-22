import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { experience, INTRO_DONE_EVENT } from "@/lib/experience";
import { site } from "@/config/site";

/** The official RideSync logo with the wordmark. 38px mark, 12px gap, centred on one line. */
export function Logo({ className = "", size = 38 }: { className?: string; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <img
        src="/ridesync_logo.png"
        alt=""
        width={size}
        height={size}
        decoding="async"
        className="block shrink-0 select-none object-contain"
        style={{ width: size, height: size }}
      />
      <span className="text-[17px] font-semibold leading-none tracking-tight">RideSync</span>
    </span>
  );
}

export default function Header() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const show = () =>
      gsap.to(el, { opacity: 1, y: 0, duration: 1.2, ease: "expo.out", delay: 0.45 });
    gsap.set(el, { opacity: 0, y: -16 });
    if (experience.introDone) show();
    window.addEventListener(INTRO_DONE_EVENT, show);
    return () => window.removeEventListener(INTRO_DONE_EVENT, show);
  }, []);

  return (
    <header ref={ref} className="fixed inset-x-0 top-0 z-40 opacity-0">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 py-5 lg:px-16">
        <a href="#top" aria-label="RideSync home">
          <Logo />
        </a>
        <nav className="flex items-center gap-6 text-sm text-white/70">
          <a href={site.githubUrl} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
            GitHub
          </a>
          <a
            href={site.apkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-white px-4 py-1.5 font-medium text-black transition-[transform,box-shadow] duration-300 ease-[var(--ease-expo)] hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_10px_24px_-10px_rgba(0,0,0,0.9)] active:translate-y-0 active:scale-[0.98]"
          >
            Download
          </a>
        </nav>
      </div>
    </header>
  );
}
