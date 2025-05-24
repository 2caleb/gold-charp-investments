
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<ThemeProviderState | undefined>(undefined);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);

  // Initialize theme from localStorage on client-side only
  useEffect(() => {
    const savedTheme = localStorage.getItem(storageKey) as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [storageKey]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    root.classList.remove("light", "dark");
    
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      
      root.classList.add(systemTheme);
      
      // Apply premium gradient backgrounds based on theme
      if (systemTheme === "dark") {
        document.body.style.background = "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)";
      } else {
        document.body.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
      }
      return;
    }
    
    root.classList.add(theme);
    
    // Apply premium gradient backgrounds
    if (theme === "dark") {
      document.body.style.background = "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)";
    } else {
      document.body.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    }
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  
  return context;
};
