import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type SiteTheme = "green" | "blue";
export type ColorMode = "light" | "dark";

const THEME_STORAGE_KEY = "htb_theme_v2";

interface ThemeContextType {
  theme: SiteTheme;
  toggleTheme: () => void;
  isBlue: boolean;
  mode: ColorMode;
  toggleMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "blue",
  toggleTheme: () => {},
  isBlue: true,
  mode: "light",
  toggleMode: () => {},
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<SiteTheme>(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return savedTheme === "green" || savedTheme === "blue" ? savedTheme : "blue";
    } catch { return "blue"; }
  });

  const [mode, setMode] = useState<ColorMode>(() => {
    try { return (localStorage.getItem("htb_mode") as ColorMode) || "light"; }
    catch { return "light"; }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(THEME_STORAGE_KEY, theme); } catch { /* Storage can be unavailable in private browsing. */ }
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "green" ? "blue" : "green"));

  const toggleMode = () => {
    setMode((prev) => {
      const next: ColorMode = prev === "light" ? "dark" : "light";
      try { localStorage.setItem("htb_mode", next); } catch { /* Storage can be unavailable in private browsing. */ }
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{
      theme, toggleTheme, isBlue: theme === "blue",
      mode, toggleMode, isDark: mode === "dark",
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
