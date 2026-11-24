import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { fadeUp, splitReveal } from "@/lib/timelines/textReveal";
import { applySeo } from "@/lib/seo";
import { docs, type DocBlock, type DocKey, type Paragraph } from "@/config/legal";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SmoothScroll from "@/components/SmoothScroll";

const linkClass =
  "relative text-white/85 transition-colors duration-500 ease-[var(--ease-expo)] hover:text-white " +
  "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-brand " +
  "after:transition-transform after:duration-500 after:ease-[var(--ease-expo)] hover:after:scale-x-100 " +
  "focus-visible:text-white focus-visible:outline-none focus-visible:after:scale-x-100";

function DocLink({ href, children }: { href: string; children: string }) {
  const external = /^https?:/.test(href);
  return (
    <a
      href={href}
      className={linkClass}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function Text({ body }: { body: Paragraph }) {
  const parts = typeof body === "string" ? [{ t: body }] : body;
  return (
    <p className="text-pretty text-[15px] leading-[1.75] text-white/60 sm:text-base sm:leading-[1.8]">
      {parts.map((part, i) =>
        part.href ? (
          <DocLink key={i} href={part.href}>
            {part.t}
          </DocLink>
        ) : (
          <span key={i}>{part.t}</span>
        ),
      )}
    </p>
  );
}

function Block({ block }: { block: DocBlock }) {
  if (block.kind === "list") {
    return (
      <div className="space-y-4">
        {block.intro && <Text body={block.intro} />}
        <ul className="space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3.5 text-[15px] leading-[1.75] text-white/60 sm:text-base">
              <span aria-hidden className="mt-[0.68em] h-[3px] w-[3px] shrink-0 rounded-full bg-brand" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return <Text body={block.body} />;
}

/**
 * Shared shell for the Privacy Policy, Terms of Service and FAQ pages. Same
 * dark surface, type scale, reveal timeline and footer as the landing page,
 * with the copy held in one readable column.
 */
export default function DocumentPage({ page }: { page: DocKey }) {
  const doc = docs[page];
  const rootRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLParagraphElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    applySeo({ title: doc.metaTitle, description: doc.description, path: doc.path });

    // The pages always open at the top, whatever the browser restored.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = rootRef.current!;
    const overlay = overlayRef.current!;

    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>("[data-doc-block]", root);

      if (reduced) {
        gsap.set([eyebrowRef.current, titleRef.current, subtitleRef.current, ...blocks], {
          visibility: "visible",
          opacity: 1,
          y: 0,
        });
        overlay.style.display = "none";
        return;
      }

      // The page itself arrives: a short black veil lifts, then the header rises.
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        onComplete: () => {
          overlay.style.display = "none";
        },
      });

      gsap.set([eyebrowRef.current, subtitleRef.current], { visibility: "visible", opacity: 0, y: 14 });
      gsap.to([eyebrowRef.current, subtitleRef.current], {
        opacity: 1,
        y: 0,
        duration: 1.2,
        delay: 0.35,
        stagger: 0.1,
        ease: "expo.out",
      });

      const title = splitReveal(titleRef.current!, { by: "lines", stagger: 0.12, duration: 1.4 });
      gsap.delayedCall(0.25, title.play);

      // Body copy reveals as it enters the viewport, one block at a time.
      blocks.forEach((el) => fadeUp(el, el, { start: "top 90%", y: 22 }));
    }, rootRef);

    return () => ctx.revert();
  }, [doc]);

  const siblings = (Object.keys(docs) as DocKey[]).filter((key) => key !== page);

  return (
    <>
      <SmoothScroll />
      <Header immediate />

      <main ref={rootRef} className="relative z-[2]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[620px] bg-[radial-gradient(ellipse_60%_100%_at_50%_0%,rgba(124,77,255,0.09),transparent_72%)]"
        />

        <article className="relative mx-auto w-full max-w-[760px] px-6 pb-24 pt-[max(148px,22vh)] sm:px-8 lg:pb-32">
          <p ref={eyebrowRef} data-reveal className="text-xs uppercase tracking-[0.2em] text-white/45">
            {doc.eyebrow}
          </p>

          <h1
            ref={titleRef}
            data-reveal
            className="mt-5 text-balance text-[clamp(2.3rem,6vw,4.2rem)] font-semibold leading-[1.03] tracking-[-0.04em]"
          >
            {doc.title}
          </h1>

          <p ref={subtitleRef} data-reveal className="mt-5 text-sm text-white/40">
            {doc.subtitle}
          </p>

          <div className="mt-14 h-px w-full bg-white/10 lg:mt-16" />

          <div className="mt-14 space-y-12 lg:mt-16 lg:space-y-14">
            {doc.intro.map((body, i) => (
              <div key={i} data-doc-block data-reveal>
                <Text body={body} />
              </div>
            ))}

            {doc.sections?.map((section) => (
              <section key={section.heading} data-doc-block data-reveal className="scroll-mt-28">
                <h2 className="text-[17px] font-medium tracking-[-0.01em] text-white sm:text-lg">
                  {section.heading}
                </h2>
                <div className="mt-4 space-y-4">
                  {section.blocks.map((block, i) => (
                    <Block key={i} block={block} />
                  ))}
                </div>
              </section>
            ))}

            {doc.faqs && (
              <div className="divide-y divide-white/10 border-t border-white/10">
                {doc.faqs.map((item) => (
                  <section key={item.q} data-doc-block data-reveal className="py-7 sm:py-8">
                    <h2 className="text-[15px] font-medium tracking-[-0.01em] text-white sm:text-lg">
                      {item.q}
                    </h2>
                    <div className="mt-3">
                      <Text body={item.a} />
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          <nav aria-label="More about RideSync" className="mt-20 lg:mt-24">
            <div className="h-px w-full bg-white/10" />
            <div className="flex flex-col gap-5 pt-7 text-sm sm:flex-row sm:items-center sm:justify-between">
              <a href="/" className="text-white/50 transition-colors duration-500 ease-[var(--ease-expo)] hover:text-white">
                ← Back to RideSync
              </a>
              <div className="flex flex-wrap gap-6">
                {siblings.map((key) => (
                  <a
                    key={key}
                    href={docs[key].path}
                    className="text-white/50 transition-colors duration-500 ease-[var(--ease-expo)] hover:text-white"
                  >
                    {docs[key].navLabel}
                  </a>
                ))}
              </div>
            </div>
          </nav>
        </article>
      </main>

      <Footer />

      <div ref={overlayRef} aria-hidden className="pointer-events-none fixed inset-0 z-[60] bg-black" />
    </>
  );
}
