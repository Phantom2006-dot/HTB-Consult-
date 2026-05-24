import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type SiteTheme = "green" | "blue";
export type ColorMode = "light" | "dark";

interface ThemeContextType {
  theme: SiteTheme;
  toggleTheme: () => void;
  isBlue: boolean;
  mode: ColorMode;
  toggleMode: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "green",
  toggleTheme: () => {},
  isBlue: false,
  mode: "light",
  toggleMode: () => {},
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<SiteTheme>(() => {
    try { return (localStorage.getItem("htb_theme") as SiteTheme) || "green"; }
    catch { return "green"; }
  });

  const [mode, setMode] = useState<ColorMode>(() => {
    try { return (localStorage.getItem("htb_mode") as ColorMode) || "light"; }
    catch { return "light"; }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("htb_theme", theme); } catch {}
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "green" ? "blue" : "green"));

  const toggleMode = () => {
    setMode((prev) => {
      const next: ColorMode = prev === "light" ? "dark" : "light";
      try { localStorage.setItem("htb_mode", next); } catch {}
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
