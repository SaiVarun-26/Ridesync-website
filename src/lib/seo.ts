/**
 * Per-route head updates. index.html carries the home page metadata; document
 * pages rewrite the same tags on mount so each URL has its own title,
 * description and canonical.
 */
const ORIGIN = "https://ridesync-live.vercel.app";

function setMeta(attr: "name" | "property", key: string, content: string) {
  const el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (el) el.content = content;
}

export function applySeo({ title, description, path }: { title: string; description: string; path: string }) {
  const url = `${ORIGIN}${path}`;

  document.title = title;
  setMeta("name", "description", description);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);

  const canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical) canonical.href = url;
}
