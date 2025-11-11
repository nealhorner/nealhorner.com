"use client";

import { useEffect, useMemo, useState } from "react";

import { ThemeType, type Theme } from "@/lib/theme";
import { useTheme } from "./theme-provider";

type ThemeSwitcherProps = {
  className?: string;
};

export default function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, toggleTheme, hasMounted } = useTheme();

  const [browserPreference, setBrowserPreference] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return ThemeType.Light;
    }

    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? ThemeType.Dark
        : ThemeType.Light;
    } catch {
      return ThemeType.Light;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (event: MediaQueryListEvent) => {
        setBrowserPreference(event.matches ? ThemeType.Dark : ThemeType.Light);
      };

      media.addEventListener("change", handleChange);

      return () => {
        media.removeEventListener("change", handleChange);
      };
    } catch {
      // noop
    }
  }, []);

  const resolvedTheme = useMemo<Theme>(() => {
    if (hasMounted) {
      return theme;
    }

    return browserPreference;
  }, [browserPreference, hasMounted, theme]);

  const isDark = resolvedTheme === ThemeType.Dark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      disabled={!hasMounted}
      aria-pressed={isDark}
      aria-label={`Switch to ${isDark ? ThemeType.Light : ThemeType.Dark} theme`}
      className={[
        "inline-flex items-center gap-3 rounded-full border px-3 py-1 text-sm font-medium transition-all",
        "border-stone-300 bg-stone-100 text-stone-800 hover:bg-stone-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-500",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100 dark:hover:bg-stone-700 dark:focus-visible:outline-stone-300",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span
        aria-hidden
        className={[
          "relative inline-flex h-5 w-10 items-center rounded-full transition-colors",
          isDark ? "bg-stone-700" : "bg-amber-300",
          "dark:bg-stone-700",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span
          className={[
            "absolute h-4 w-4 rounded-full bg-white shadow transition-transform",
            isDark ? "translate-x-[22px]" : "translate-x-[2px]",
          ]
            .filter(Boolean)
            .join(" ")}
        />
      </span>
      <span className="sr-only">{isDark ? "Switch to light theme" : "Switch to dark theme"}</span>
      <span aria-hidden>{isDark ? "Dark" : "Light"}</span>
    </button>
  );
}
