/**
 * Central place for links and brand values.
 * Every external link on the site comes from here.
 */
const repo = "https://github.com/SaiVarun-26/Ridesync";

export const site = {
  name: "RideSync",
  author: "Sai Varun",
  /** Latest release. The Download buttons open this page. */
  apkUrl: `${repo}/releases/tag/v1.1.0`,
  githubUrl: "https://github.com/SaiVarun-26/Ridesync",
  /** The author's GitHub profile, used by the footer's Connect column. */
  profileUrl: "https://github.com/SaiVarun-26",
  linkedinUrl: "https://www.linkedin.com/in/saivaruntej/",
  email: "k.saivaruntej@gmail.com",
  /** Footer: real pages of the open source repository. */
  docsUrl: `${repo}#readme`,
  changelogUrl: `${repo}/releases`,
  /** Document pages rendered by this site. */
  privacyUrl: "/privacy",
  termsUrl: "/terms",
  faqUrl: "/faq",
} as const;

export const colors = {
  brand: "#7c4dff",
  pink: "#ff4d9d",
  purple: "#b07cff",
  green: "#2ee59d",
  blue: "#3aa0ff",
  orange: "#ff9a3c",
} as const;
