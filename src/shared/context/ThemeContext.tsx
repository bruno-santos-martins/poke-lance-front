import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type ThemePreference = "light" | "dark" | "system";
export type ResolvedTheme = Exclude<ThemePreference, "system">;

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getInitialTheme(defaultTheme?: ThemePreference): ThemePreference {
  if (defaultTheme) return defaultTheme;
  const storedTheme = window.localStorage.getItem("pokemon-auction-theme");
  return storedTheme === "light" || storedTheme === "dark"
    ? storedTheme
    : "light";
}

export function ThemeProvider({
  children,
  defaultTheme
}: {
  children: ReactNode;
  defaultTheme?: ThemePreference;
}) {
  const [theme, setTheme] = useState<ThemePreference>(() => getInitialTheme(defaultTheme));
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const resolvedTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (event: MediaQueryListEvent) => {
      setSystemTheme(event.matches ? "dark" : "light");
    };

    systemThemeQuery.addEventListener("change", updateSystemTheme);
    return () => systemThemeQuery.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    const rootElement = document.documentElement;
    rootElement.dataset.theme = resolvedTheme;
    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.content = window.getComputedStyle(rootElement)
        .getPropertyValue("--color-background")
        .trim();
    }
    window.localStorage.setItem("pokemon-auction-theme", theme);
  }, [resolvedTheme, theme]);

  const contextValue = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme precisa ser usado dentro de ThemeProvider.");
  return context;
}
