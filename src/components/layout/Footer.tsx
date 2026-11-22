import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { site } from "@/config/site";
import { Logo } from "@/components/layout/Header";

interface FooterLink {
  label: string;
  href: string;
}

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#home" },
      { label: "How it Works", href: "#group" },
      { label: "Download", href: "#download" },
      { label: "Roadmap", href: site.roadmapUrl },
      { label: "FAQ", href: site.faqUrl },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "GitHub", href: site.githubUrl },
      { label: "Documentation", href: site.docsUrl },
      { label: "Changelog", href: site.changelogUrl },
      { label: "Privacy Policy", href: site.privacyUrl },
      { label: "Terms of Service", href: site.termsUrl },
    ],
  },
  {
    title: "Connect",
    links: [
      { label: "LinkedIn", href: site.linkedinUrl },
      { label: "GitHub", href: site.githubUrl },
      { label: "Email", href: `mailto:${site.email}` },
      { label: "Contact", href: `mailto:${site.email}?subject=RideSync` },
    ],
  },
];

function FooterAnchor({ href, children }: { href: string; children: string }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="relative inline-block text-[15px] text-white/50 transition-colors duration-500 ease-[var(--ease-expo)] hover:text-white
        after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-brand
        after:transition-transform after:duration-500 after:ease-[var(--ease-expo)] hover:after:scale-x-100
        focus-visible:text-white focus-visible:outline-none focus-visible:after:scale-x-100"
    >
      {children}
    </a>
  );
}

/**
 * A very faint GPS route map. Lines sit at about 3% white, waypoints a little
 * higher, and a few tiny purple rider dots pulse slowly. Decorative only.
 */
function RouteBackdrop() {
  const line = "rgba(255,255,255,0.032)";
  const node = "rgba(255,255,255,0.05)";
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 1600 720"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <g stroke={line} strokeWidth="2" strokeLinecap="round">
        <path d="M-60 560 C 240 420, 430 650, 760 480 S 1250 300, 1680 380" />
        <path d="M-60 170 C 300 270, 520 70, 900 200 S 1310 530, 1680 440" />
        <path d="M190 780 C 360 520, 700 430, 900 200" />
        <path d="M1110 780 C 1190 570, 1000 430, 1250 300 S 1500 100, 1680 50" />
        <path d="M420 -40 C 470 150, 380 330, 520 520" strokeWidth="1.5" />
        <path d="M1380 760 C 1330 600, 1450 520, 1420 380" strokeWidth="1.5" />
      </g>
      <g stroke={node} strokeWidth="1.5">
        {[
          [760, 480],
          [900, 200],
          [1250, 300],
          [520, 520],
          [1420, 380],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="4" fill={node} stroke="none" />
            <circle cx={x} cy={y} r="14" />
          </g>
        ))}
      </g>
      <g fill="#7c4dff">
        {[
          [545, 535],
          [905, 212],
          [1268, 318],
          [1415, 395],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} className="gps-dot" cx={x} cy={y} r="3" opacity="0.22" />
        ))}
      </g>
    </svg>
  );
}

/**
 * Oversized "RideSync" wordmark anchored to the bottom of the footer. Only the
 * upper part of the letters is visible. A faint GPS route flows through them.
 * Static, non-interactive, and always behind the footer content.
 */
function Wordmark() {
  const route = "rgba(150,110,255,0.085)";
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 bottom-0 select-none overflow-hidden"
      style={{ height: "calc(var(--fs) * 0.56)" }}
    >
      <span
        className="absolute left-1/2 whitespace-nowrap font-black leading-none tracking-[-0.04em]"
        style={{
          top: "calc(var(--fs) * -0.12)",
          fontSize: "var(--fs)",
          fontWeight: 900,
          color: "rgba(255,255,255,0.04)",
          transform: "translateX(-50%)",
        }}
      >
        RIDESYNC
      </span>

      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 200" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <filter id="route-glow" x="-10%" y="-60%" width="120%" height="220%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
          <filter id="dot-glow" x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        {/* Soft glow under the main route */}
        <path
          d="M-60 138 C 190 36, 370 198, 570 112 S 900 18, 1110 122 S 1450 196, 1680 66"
          stroke="rgba(124,77,255,0.06)"
          strokeWidth="9"
          strokeLinecap="round"
          filter="url(#route-glow)"
        />
        <g stroke={route} strokeWidth="2.5" strokeLinecap="round">
          <path d="M-60 138 C 190 36, 370 198, 570 112 S 900 18, 1110 122 S 1450 196, 1680 66" />
          <path d="M-60 40 C 240 120, 470 10, 760 96 S 1220 180, 1680 120" strokeWidth="1.8" />
        </g>
        {/* Waypoints */}
        <g stroke="rgba(150,110,255,0.11)" strokeWidth="1.5">
          {[
            [570, 112],
            [1110, 122],
            [330, 92],
            [880, 40],
            [1390, 150],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="3.5" fill="rgba(150,110,255,0.14)" stroke="none" />
              <circle cx={x} cy={y} r="11" />
            </g>
          ))}
        </g>
        {/* Rider dots with a soft glow */}
        {[
          [452, 150],
          [980, 62],
          [1262, 158],
        ].map(([x, y]) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="7" fill="#7c4dff" opacity="0.3" filter="url(#dot-glow)" />
            <circle cx={x} cy={y} r="3" fill="#a07cff" opacity="0.45" />
          </g>
        ))}
      </svg>
    </div>
  );
}

export default function Footer() {
  const rootRef = useRef<HTMLElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const colsRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const cols = Array.from(colsRef.current!.children);
      const bottom = bottomRef.current!;
      if (reduced) {
        gsap.set([bgRef.current, ...cols, bottom], { opacity: 1, y: 0 });
        return;
      }

      gsap.set(bgRef.current, { opacity: 0 });
      gsap.set([...cols, bottom], { opacity: 0, y: 28 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: rootRef.current, start: "top 85%", toggleActions: "play none none none" },
      });
      tl.to(bgRef.current, { opacity: 1, duration: 2.6, ease: "power2.out" }, 0);
      tl.to(cols, { opacity: 1, y: 0, duration: 1.2, stagger: 0.12, ease: "expo.out" }, 0.1);
      tl.to(bottom, { opacity: 1, y: 0, duration: 1.1, ease: "expo.out" }, 0.55);

      // Rider dots pulse gently, a few seconds apart.
      const dots = gsap.utils.toArray<SVGCircleElement>(".gps-dot", rootRef.current!);
      dots.forEach((dot, i) => {
        gsap.to(dot, {
          opacity: 0.6,
          attr: { r: 4.6 },
          duration: 1.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          repeatDelay: 1.4,
          delay: 1.2 + i * 0.9,
        });
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={rootRef}
      className="relative overflow-hidden bg-[#050505] text-white"
      style={{ ["--fs" as string]: "clamp(96px, 17vw, 420px)" }}
    >
      <div ref={bgRef}>
        <RouteBackdrop />
      </div>

      <Wordmark />

      <div
        className="relative mx-auto max-w-[1280px] px-6 pt-24 lg:px-16 lg:pt-32"
        style={{ paddingBottom: "calc(var(--fs) * 0.3)" }}
      >
        <div ref={colsRef} className="grid grid-cols-2 gap-x-8 gap-y-14 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="col-span-2 max-w-sm lg:col-span-1">
            <a href="#top" aria-label="RideSync home" className="inline-block">
              <Logo />
            </a>
            <p className="mt-5 text-[15px] leading-relaxed text-white/55">
              Ride together.
              <br />
              Ride smarter.
            </p>
            <p className="mt-3 text-[13px] text-white/35">Created by {site.author}.</p>
            <p className="mt-6 inline-flex items-center rounded-full border border-white/10 px-3.5 py-1.5 text-xs text-white/60">
              Open Source
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h3 className="text-xs uppercase tracking-[0.18em] text-white/35">{col.title}</h3>
              <ul className="mt-6 space-y-3.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterAnchor href={l.href}>{l.label}</FooterAnchor>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div ref={bottomRef} className="mt-20 lg:mt-28">
          <div className="h-px w-full bg-white/10" />
          <div className="mt-7 flex flex-col gap-4 text-[13px] text-white/40 sm:flex-row sm:items-start sm:justify-between">
            <p>© 2026 RideSync</p>
            <div className="space-y-1.5 sm:text-right">
              <p>Designed &amp; Developed by {site.author}</p>
              <p className="text-white/30">Built with Flutter • FastAPI • React • GSAP</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
