import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type BlogFont = "openai-sans" | "anthropic-serif" | "source-serif-4";

type PreferencesContextValue = {
  blogFont: BlogFont;
  setBlogFont: (font: BlogFont) => void;
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const STORAGE_KEY = "reader:blogFont";
const DEFAULT_FONT: BlogFont = "openai-sans";

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [blogFont, setBlogFontState] = useState<BlogFont>(DEFAULT_FONT);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(STORAGE_KEY) as BlogFont | null;
    if (stored) {
      setBlogFontState(stored);
    }
  }, []);

  const setBlogFont = (font: BlogFont) => {
    setBlogFontState(font);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, font);
    }
  };

  const value = useMemo(() => ({ blogFont, setBlogFont }), [blogFont]);

  return (
    <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}

export function getBlogFontFamily(font: BlogFont) {
  switch (font) {
    case "anthropic-serif":
      return "Georgia, 'Times New Roman', serif";
    case "source-serif-4":
      return "'Source Serif 4', Georgia, 'Times New Roman', serif";
    default:
      return "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  }
}
