/**
 * Copy for the document pages. Kept as data so the page shell stays fixed and
 * every route shares the same layout and motion.
 */

export type InlineText = { t: string; href?: string };
/** A paragraph is either plain text or a run of fragments, some of which link. */
export type Paragraph = string | InlineText[];

export type DocBlock =
  | { kind: "text"; body: Paragraph }
  | { kind: "list"; intro?: Paragraph; items: string[] };

export interface DocSection {
  heading: string;
  blocks: DocBlock[];
}

export interface FaqItem {
  q: string;
  a: Paragraph;
}

export interface Doc {
  eyebrow: string;
  title: string;
  /** Short label used in the cross-page navigation. */
  navLabel: string;
  subtitle: string;
  /** Browser title for this route. */
  metaTitle: string;
  description: string;
  path: string;
  intro: Paragraph[];
  sections?: DocSection[];
  faqs?: FaqItem[];
}

const email = "k.saivaruntej@gmail.com";
const repo = "https://github.com/SaiVarun-26/Ridesync";

const privacy: Doc = {
  eyebrow: "Legal",
  title: "Privacy Policy",
  navLabel: "Privacy",
  subtitle: "Last Updated: November 2026",
  metaTitle: "Privacy Policy | RideSync",
  description:
    "How RideSync handles information. The website is an informational landing page that does not require accounts or collect personal information.",
  path: "/privacy",
  intro: [
    "RideSync is an open-source project created by Sai Varun Tej.",
    "The RideSync website is an informational landing page. It does not require user accounts or collect personal information.",
  ],
  sections: [
    {
      heading: "Information Collection",
      blocks: [
        { kind: "text", body: "The website does not collect:" },
        {
          kind: "list",
          items: [
            "Names",
            "Email addresses",
            "Passwords",
            "GPS locations",
            "Ride history",
            "Personal identifiers",
          ],
        },
        {
          kind: "text",
          body: "Anonymous website traffic statistics may be collected through Vercel Analytics to understand overall visitor activity. This information is aggregated and is not used to identify individual users.",
        },
      ],
    },
    {
      heading: "External Links",
      blocks: [
        {
          kind: "text",
          body: "The website contains links to GitHub, LinkedIn and email. Those services are governed by their own privacy policies.",
        },
      ],
    },
    {
      heading: "Open Source",
      blocks: [
        {
          kind: "text",
          body: "RideSync is fully open source. The complete source code is publicly available on GitHub.",
        },
      ],
    },
    {
      heading: "Contact",
      blocks: [
        { kind: "text", body: "Questions regarding this website may be directed to:" },
        { kind: "text", body: [{ t: email, href: `mailto:${email}` }] },
      ],
    },
  ],
};

const terms: Doc = {
  eyebrow: "Legal",
  title: "Terms of Service",
  navLabel: "Terms",
  subtitle: "Last Updated: November 2026",
  metaTitle: "Terms of Service | RideSync",
  description:
    "The terms that apply to the RideSync website and the open-source RideSync application.",
  path: "/terms",
  intro: [],
  sections: [
    {
      heading: "Website Usage",
      blocks: [
        {
          kind: "text",
          body: "RideSync exists to showcase the project, provide documentation and distribute releases.",
        },
      ],
    },
    {
      heading: "Open Source",
      blocks: [
        {
          kind: "text",
          body: [
            { t: "The RideSync application is open source. Licensing information is available in the " },
            { t: "GitHub repository", href: repo },
            { t: "." },
          ],
        },
      ],
    },
    {
      heading: "Ownership",
      blocks: [
        {
          kind: "text",
          body: "The RideSync branding, website design, animations and visual assets belong to the RideSync project unless otherwise stated.",
        },
      ],
    },
    {
      heading: "No Warranty",
      blocks: [
        {
          kind: "text",
          body: 'RideSync is provided "as is" without warranties of any kind.',
        },
      ],
    },
    {
      heading: "Limitation of Liability",
      blocks: [
        {
          kind: "text",
          body: "The creator shall not be held responsible for damages resulting from the use of the website or application.",
        },
      ],
    },
    {
      heading: "Updates",
      blocks: [
        { kind: "text", body: "These terms may change as RideSync evolves." },
      ],
    },
  ],
};

const faq: Doc = {
  eyebrow: "Support",
  title: "Frequently Asked Questions",
  navLabel: "FAQ",
  subtitle: "Answers about RideSync",
  metaTitle: "FAQ | RideSync",
  description:
    "Answers about RideSync: what it is, whether it is free, supported platforms, ride data and how to contribute.",
  path: "/faq",
  intro: [],
  faqs: [
    {
      q: "What is RideSync?",
      a: "RideSync is an open-source Flutter application built for motorcycle group rides. It provides live rider tracking, intelligent route sharing and ride summaries.",
    },
    {
      q: "Is RideSync free?",
      a: "Yes. RideSync is completely free and open source.",
    },
    {
      q: "Which platforms are supported?",
      a: "Currently Android.",
    },
    {
      q: "Does RideSync collect ride data?",
      a: "The website does not collect ride data. Any future in-app data collection will be clearly documented inside the application.",
    },
    {
      q: "Can I contribute?",
      a: [
        { t: "Yes. Contributions, bug reports and feature requests are welcome through " },
        { t: "GitHub", href: repo },
        { t: "." },
      ],
    },
    {
      q: "Who built RideSync?",
      a: "RideSync was created by Sai Varun Tej.",
    },
    {
      q: "Where can I download it?",
      a: [
        { t: "The latest release is available on " },
        { t: "GitHub Releases", href: `${repo}/releases` },
        { t: "." },
      ],
    },
  ],
};

export const docs = { privacy, terms, faq } as const;

export type DocKey = keyof typeof docs;
