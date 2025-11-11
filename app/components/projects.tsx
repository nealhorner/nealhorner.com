import Link from "next/link";

type Project = {
  title: string;
  description: string;
  href: string;
  meta?: string;
};

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
          <Link
            key={project.title}
            href={project.href}
            className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
          >
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-50 dark:group-hover:text-zinc-200">
                {project.title}
              </h3>
              {project.meta ? (
                <p className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  {project.meta}
                </p>
              ) : null}
            </div>
            <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
              {project.description}
            </p>
            <span className="text-sm font-semibold text-zinc-900 transition-colors group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
              Visit project →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

