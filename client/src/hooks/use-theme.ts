import { create } from "zustand";

type Theme = "dark" | "light" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: 
    (typeof window !== "undefined" && 
    window.localStorage.getItem("theme") as Theme) || "system",
  setTheme: (theme) => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem("theme", theme);
    set({ theme });
  },
}));

// Initialize theme
if (typeof window !== "undefined") {
  const theme = localStorage.getItem("theme") as Theme | null;
  const root = window.document.documentElement;
  
  if (theme === "system" || !theme) {
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    root.classList.add(systemTheme);
  } else {
    root.classList.add(theme);
  }
}
