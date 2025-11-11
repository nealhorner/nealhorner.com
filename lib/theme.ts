export enum ThemeType {
  Light = "light",
  Dark = "dark",
}

export type Theme = ThemeType.Light | ThemeType.Dark;

export type ThemePreference = Theme | "system";

export const THEME_STORAGE_KEY = "nealhorner-theme";

export const DEFAULT_THEME: ThemePreference = "system";
