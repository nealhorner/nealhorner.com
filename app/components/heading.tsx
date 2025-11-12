"use client";

import { ThemeType } from "@/lib/theme";
import { useTheme } from "./theme-provider";
import ThemeSwitcher from "./theme-switcher";

export default function Heading() {
  const { theme } = useTheme();

  const themeClasses = theme === ThemeType.Dark ? "text-stone-100" : "text-stone-900";

  return (
    <header className="m-0 py-4">
      <div className="relative mx-auto flex w-full items-center justify-center px-4">
        <h1 className={["text-center text-5xl", themeClasses].join(" ")}>Neal Horner</h1>
        <ThemeSwitcher className="absolute right-0 top-1/2 -translate-y-1/2" />
      </div>
    </header>
  );
}
