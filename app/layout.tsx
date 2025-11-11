import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ThemeProvider } from "./components/theme-provider";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme";
import Footer from "./components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "nealhorner.com",
  description: "Neal Horner's personal website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeInitializer = `(() => {
    const storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
    const defaultTheme = ${JSON.stringify(DEFAULT_THEME)};
    const root = document.documentElement;
    const applyTheme = (theme) => {
      if (!theme) return;
      root.dataset.theme = theme;
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.classList.toggle('dark', theme === 'dark');
      root.style.colorScheme = theme;
    };
    try {
      const stored = localStorage.getItem(storageKey);
      const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      const theme = stored === 'light' || stored === 'dark'
        ? stored
        : (defaultTheme === 'system' ? system : defaultTheme);
      applyTheme(theme);
    } catch (error) {
      // noop
    }
  })();`;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          defaultTheme={DEFAULT_THEME}
          storageKey={THEME_STORAGE_KEY}
        >
          {children}
          <Footer />
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId="G-YFBQ26G722" />
    </html>
  );
}
