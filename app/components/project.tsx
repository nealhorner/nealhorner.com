import Link from "next/link";

export type Project = {
  title: string;
  description: string;
  href: string;
  meta?: string;
};

type ProjectProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectProps) {
  return (
    <Link
      href={project.href}
      className="group flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm transition hover:scale-[1.02] hover:border-zinc-300 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
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
  );
}

