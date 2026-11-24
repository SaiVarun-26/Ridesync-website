import { lazy, Suspense } from "react";
import Hero from "@/components/sections/Hero";
import Feature from "@/components/sections/Feature";
import FinalCta from "@/components/sections/FinalCta";
import Footer from "@/components/layout/Footer";
import Button, { GithubIcon } from "@/components/ui/Button";
import DocumentPage from "@/pages/DocumentPage";
import { chapters } from "@/config/content";
import { site } from "@/config/site";
import { getRoute } from "@/lib/route";

// The story shell owns the Three.js scene. Loading it on demand keeps the
// document pages free of that download.
const Experience = lazy(() => import("@/components/Experience"));

export default function App() {
  const route = getRoute();

  // Privacy, Terms and FAQ share the header, footer and motion, no phone story.
  if (route !== "home") return <DocumentPage page={route} />;

  return (
    <Suspense fallback={null}>
      <Experience>
        <Hero />
        <Feature pose="home" chapter={chapters.home} />
        <Feature pose="group" chapter={chapters.group} />
        <Feature pose="solo" chapter={chapters.solo} />
        <Feature pose="complete" chapter={chapters.complete} />
        <Feature pose="history" chapter={chapters.history} />
        <Feature pose="profile" chapter={chapters.profile} />
        <Feature pose="flex" chapter={chapters.flex} />
        <Feature pose="open" chapter={chapters.open} heightVh={150}>
          <Button href={site.githubUrl} variant="primary">
            <GithubIcon />
            View on GitHub
          </Button>
        </Feature>
        <FinalCta />
        <Footer />
      </Experience>
    </Suspense>
  );
}
