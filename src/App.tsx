import Experience from "@/components/Experience";
import Hero from "@/components/sections/Hero";
import Feature from "@/components/sections/Feature";
import FinalCta from "@/components/sections/FinalCta";
import Footer from "@/components/layout/Footer";
import Button, { GithubIcon } from "@/components/ui/Button";
import { chapters } from "@/config/content";
import { site } from "@/config/site";

export default function App() {
  return (
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
  );
}