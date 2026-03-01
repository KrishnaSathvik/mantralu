import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface SettingsContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  language: "en" | "te" | "both";
  setLanguage: (lang: "en" | "te" | "both") => void;
  recentlyViewed: string[];
  addRecentlyViewed: (id: string) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem("mv-fontSize");
    return saved ? Number(saved) : 22;
  });

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("mv-darkMode") === "true";
  });

  const [language, setLanguage] = useState<"en" | "te" | "both">(() => {
    return (localStorage.getItem("mv-language") as "en" | "te" | "both") || "both";
  });

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(() => {
    const saved = localStorage.getItem("mv-recent");
    return saved ? JSON.parse(saved) : [];
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("mv-favorites");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("mv-fontSize", String(fontSize));
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("mv-darkMode", String(darkMode));
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem("mv-language", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("mv-recent", JSON.stringify(recentlyViewed));
  }, [recentlyViewed]);

  useEffect(() => {
    localStorage.setItem("mv-favorites", JSON.stringify(favorites));
  }, [favorites]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const addRecentlyViewed = (id: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((i) => i !== id);
      return [id, ...filtered].slice(0, 10);
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <SettingsContext.Provider
      value={{
        fontSize, setFontSize,
        darkMode, toggleDarkMode,
        language, setLanguage,
        recentlyViewed, addRecentlyViewed,
        favorites, toggleFavorite,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
