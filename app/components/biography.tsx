import Link from "next/link";

export default function Biography() {
  return (
    <section className="space-y-6 text-left">
      <div className="px-4 text-lg text-zinc-700 dark:text-zinc-300 max-w-full lg:max-w-[90vw] xl:max-w-[80vw] mx-auto">
        <p>
          I&apos;m a geographer, programmer, and analytics leader based in the
          San Francisco Bay Area. This site is a home for projects I&apos;m
          building, ideas I&apos;m exploring, and things I find interesting.
        </p>
        <p>
          These days you can find me working in Cupertino as an Analytics
          Manager, helping teams translate data into decisions.
        </p>
        <p>
          I earned my B.S. in{" "}
          <Link
            href="https://geography.uoregon.edu/"
            className="underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-900 hover:decoration-zinc-600 dark:hover:text-zinc-100"
          >
            Geography
          </Link>{" "}
          from the{" "}
          <Link
            href="https://uoregon.edu/"
            className="underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-900 hover:decoration-zinc-600 dark:hover:text-zinc-100"
          >
            University of Oregon
          </Link>
          , with minors in{" "}
          <Link
            href="https://www.cs.uoregon.edu/"
            className="underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-900 hover:decoration-zinc-600 dark:hover:text-zinc-100"
          >
            Computer Information Technology
          </Link>{" "}
          and{" "}
          <Link
            href="http://envs.uoregon.edu/"
            className="underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-900 hover:decoration-zinc-600 dark:hover:text-zinc-100"
          >
            Environmental Studies
          </Link>
          .
        </p>
        <p>
          Want to collaborate or just say hi?{" "}
          <a
            href="mailto:thenealhorner@gmail.com"
            className="font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition-colors hover:decoration-zinc-600 dark:text-zinc-100"
          >
            Send me an email
          </a>
          .
        </p>
      </div>
    </section>
  );
}

