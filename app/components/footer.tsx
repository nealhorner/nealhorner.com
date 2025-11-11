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
    <footer className="mt-4 pt-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-6 text-sm text-stone-600 sm:text-base dark:text-stone-400">
        <nav className="flex flex-wrap items-center justify-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="font-medium text-stone-700 transition-colors hover:text-stone-900 dark:text-stone-300 dark:hover:text-stone-100"
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="text-center">
          © {new Date().getFullYear()} Neal Horner. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
