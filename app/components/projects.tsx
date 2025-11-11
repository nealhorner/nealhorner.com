import { Project, ProjectCard } from "./project";

const projects: Project[] = [
  {
    title: "Random Walkers",
    description:
      "Interactive visualization of stochastic walk patterns rendered directly in the browser with requestAnimationFrame and canvas.",
    href: "https://github.com/nealhorner/random-walkers",
    meta: "JavaScript · Canvas · Visualization",
  },
  {
    title: "Bay Area Transit Explorer",
    description:
      "A geospatial dashboard built on Mapbox GL that layers service coverage, ridership data, and live GTFS feeds.",
    href: "https://github.com/nealhorner/bay-area-transit",
    meta: "Mapbox · GTFS · React",
  },
  {
    title: "Cupertino Analytics Toolkit",
    description:
      "A curated set of SQL, dbt models, and notebooks that power daily reporting pipelines for analytics teams.",
    href: "https://github.com/nealhorner/cupertino-analytics-toolkit",
    meta: "dbt · DuckDB · Analytics Engineering",
  },
  {
    title: "Field Notes",
    description:
      "A collection of essays and technical write-ups on spatial data science, reproducible research, and maps.",
    href: "/posts",
    meta: "Writing · Spatial Data · R & Python",
  },
];

export default function Projects() {
  return (
    <section className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}

