/**
 * Central place for links and brand values.
 * Replace the placeholder URLs before deploying.
 */
const github = "https://github.com/your-username/ridesync";

export const site = {
  name: "RideSync",
  author: "Sai Varun",
  apkUrl: `${github}/releases/latest`,
  githubUrl: github,
  demoUrl: "https://www.youtube.com/watch?v=your-demo-id",
  // Footer links. Replace the placeholders before deploying.
  roadmapUrl: `${github}/issues`,
  faqUrl: `${github}#faq`,
  docsUrl: `${github}#readme`,
  changelogUrl: `${github}/releases`,
  privacyUrl: `${github}/blob/main/PRIVACY.md`,
  termsUrl: `${github}/blob/main/TERMS.md`,
  linkedinUrl: "https://www.linkedin.com/in/your-handle",
  email: "hello@example.com",
} as const;

export const colors = {
  brand: "#7c4dff",
  pink: "#ff4d9d",
  purple: "#b07cff",
  green: "#2ee59d",
  blue: "#3aa0ff",
  orange: "#ff9a3c",
} as const;
