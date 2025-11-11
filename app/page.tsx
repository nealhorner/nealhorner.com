import Biography from "./components/biography";
import Projects from "./components/projects";
import IsometricCity from "./components/isometric-city";
import Heading from "./components/heading";

export default function Home() {
  return (
    <main className="space-y-16">
      <Heading />
      <IsometricCity />
      <Biography />
      <Projects />
    </main>
  );
}
