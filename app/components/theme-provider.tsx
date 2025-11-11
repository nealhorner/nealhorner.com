"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";

import { DEFAULT_THEME, THEME_STORAGE_KEY, Theme, ThemePreference, ThemeType } from "@/lib/theme";

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
}

function applyThemeToDocument(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.remove(ThemeType.Light, ThemeType.Dark);
  root.classList.add(theme);
  root.classList.toggle(ThemeType.Dark, theme === ThemeType.Dark);
  root.style.colorScheme = theme;
}

function subscribeToSystemTheme(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  try {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      callback();
    };

    media.addEventListener("change", handleChange);

    return () => {
      media.removeEventListener("change", handleChange);
    };
  } catch {
    return () => undefined;
  }
}

function isTheme(value: unknown): value is Theme {
  return value === ThemeType.Light || value === ThemeType.Dark;
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
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemTheme,
    () => ThemeType.Light
  );
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(storageKey);

    const nextTheme: Theme | null = isTheme(stored)
      ? stored
      : isTheme(defaultTheme)
        ? defaultTheme
        : null;

    const timeoutId = window.setTimeout(() => {
      setUserTheme((current) => (current === nextTheme ? current : nextTheme));
      setHasMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [defaultTheme, storageKey]);

  const theme = useMemo<Theme>(() => {
    if (userTheme) {
      return userTheme;
    }

    if (isTheme(defaultTheme)) {
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
    [storageKey]
  );

  const toggleTheme = useCallback(() => {
    setTheme(theme === ThemeType.Dark ? ThemeType.Light : ThemeType.Dark);
  }, [setTheme, theme]);

  const clearUserTheme = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(storageKey);
    const fallback = isTheme(defaultTheme) ? defaultTheme : systemTheme;
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
    [clearUserTheme, hasMounted, setTheme, systemTheme, theme, toggleTheme, userTheme]
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
