import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center px-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          HTTP 404
        </p>
        <h1 className="text-4xl sm:text-5xl font-semibold text-zinc-900 dark:text-zinc-100">
          This page could not be found.
        </h1>
        <p className="text-base text-neutral-600 dark:text-neutral-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Image src="/images/404.gif" alt="404" width={400} height={400} className="mx-auto" />
      </div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-5 py-2 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-100 dark:hover:bg-neutral-800/60"
      >
        Go back home
      </Link>
    </main>
  );
}

