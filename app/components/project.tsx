"use client";

import Link from "next/link";
import { ThemeType } from "@/lib/theme";
import { useTheme } from "./theme-provider";

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
  const { theme } = useTheme();

  const themeClasses =
    theme === ThemeType.Dark
      ? "border-stone-800 bg-stone-950 hover:border-stone-700"
      : "border-stone-200 bg-white hover:border-stone-300";

  return (
    <Link
      href={project.href}
      className={[
        "group flex flex-col gap-4 rounded-2xl border p-6 shadow-sm transition hover:scale-125 hover:shadow-md",
        themeClasses,
      ].join(" ")}
    >
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-stone-900 transition-colors group-hover:text-stone-700 dark:text-stone-50 dark:group-hover:text-stone-200">
          {project.title}
        </h3>
        {project.meta ? (
          <p className="text-sm font-medium uppercase tracking-wide text-stone-500 dark:text-stone-400">
            {project.meta}
          </p>
        ) : null}
      </div>
      <p className="text-base leading-7 text-stone-600 dark:text-stone-400">
        {project.description}
      </p>
      <span className="text-sm font-semibold text-stone-900 transition-colors group-hover:text-stone-600 dark:text-stone-100 dark:group-hover:text-stone-300">
        Visit project →
      </span>
    </Link>
  );
}
