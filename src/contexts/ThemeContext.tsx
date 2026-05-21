import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type SiteTheme = "green" | "blue";

interface ThemeContextType {
  theme: SiteTheme;
  toggleTheme: () => void;
  isBlue: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "green",
  toggleTheme: () => {},
  isBlue: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<SiteTheme>(() => {
    try {
      return (localStorage.getItem("htb_theme") as SiteTheme) || "green";
    } catch {
      return "green";
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("htb_theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "green" ? "blue" : "green"));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isBlue: theme === "blue" }}>
      {children}
    </ThemeContext.Provider>
  );
};
