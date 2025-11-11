import Link from "next/link";

const footerLinks = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/nealhorner",
  },
  {
    label: "GitHub",
    href: "https://github.com/nealhorner",
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/nealhorner.com",
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 py-10 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-6 px-6 text-sm text-zinc-600 sm:flex-row sm:text-base dark:text-zinc-400">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} Neal Horner. All rights reserved.
        </p>
        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-medium text-zinc-700 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

