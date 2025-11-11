'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  Theme,
  ThemePreference,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  userTheme: Theme | null;
  systemTheme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  clearUserTheme: () => void;
  hasMounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: ThemePreference;
  storageKey?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
  storageKey = THEME_STORAGE_KEY,
}: ThemeProviderProps) {
  const [userTheme, setUserTheme] = useState<Theme | null>(null);
  const [systemTheme, setSystemTheme] = useState<Theme>("light");
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const system = getSystemTheme();
    setSystemTheme(system);

    const stored = window.localStorage.getItem(storageKey);

    if (stored === "light" || stored === "dark") {
      setUserTheme(stored);
    } else if (defaultTheme === "light" || defaultTheme === "dark") {
      setUserTheme(defaultTheme);
    } else {
      setUserTheme(null);
    }

    setHasMounted(true);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (event: MediaQueryListEvent) => {
      const nextSystemTheme = event.matches ? "dark" : "light";
      setSystemTheme(nextSystemTheme);
    };

    media.addEventListener("change", handleMediaChange);

    return () => {
      media.removeEventListener("change", handleMediaChange);
    };
  }, [defaultTheme, storageKey]);

  const theme = useMemo<Theme>(() => {
    if (userTheme) {
      return userTheme;
    }

    if (defaultTheme === "light" || defaultTheme === "dark") {
      return defaultTheme;
    }

    return systemTheme;
  }, [defaultTheme, systemTheme, userTheme]);

  useEffect(() => {
    if (!hasMounted || typeof window === "undefined") {
      return;
    }

    applyThemeToDocument(theme);
  }, [hasMounted, theme]);

  const setTheme = useCallback(
    (nextTheme: Theme) => {
      if (typeof window === "undefined") {
        return;
      }

      window.localStorage.setItem(storageKey, nextTheme);
      applyThemeToDocument(nextTheme);
      setUserTheme(nextTheme);
    },
    [storageKey],
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const clearUserTheme = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(storageKey);
    const fallback =
      defaultTheme === "light" || defaultTheme === "dark"
        ? defaultTheme
        : systemTheme;
    applyThemeToDocument(fallback);
    setUserTheme(null);
  }, [defaultTheme, storageKey, systemTheme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      userTheme,
      systemTheme,
      setTheme,
      toggleTheme,
      clearUserTheme,
      hasMounted,
    }),
    [clearUserTheme, hasMounted, setTheme, systemTheme, theme, toggleTheme, userTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

