import { useState, useCallback, useEffect } from "react";

const FAVORITE_THEMES_KEY = "instashirt_favorite_themes";
const MAX_FAVORITE_THEMES = 20;

interface FavoriteTheme {
  theme: string;
  lastUsed: string;
  useCount: number;
}

interface FavoriteThemesStorage {
  themes: FavoriteTheme[];
  maxSize: number;
  version: "1.0";
}

export function useFavoriteThemes() {
  const [favoriteThemes, setFavoriteThemes] = useState<FavoriteTheme[]>([]);

  // Load favorite themes from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        const stored = localStorage.getItem(FAVORITE_THEMES_KEY);
        if (!stored) return;

        const storage: FavoriteThemesStorage = JSON.parse(stored);
        setFavoriteThemes(storage.themes || []);
      } catch (error) {
        console.error("Failed to load favorite themes:", error);
      }
    };

    loadFavorites();
  }, []);

  // Save favorite themes to localStorage
  const saveFavoriteThemes = useCallback((themes: FavoriteTheme[]) => {
    try {
      const storage: FavoriteThemesStorage = {
        themes,
        maxSize: MAX_FAVORITE_THEMES,
        version: "1.0",
      };
      localStorage.setItem(FAVORITE_THEMES_KEY, JSON.stringify(storage));
      setFavoriteThemes(themes);
    } catch (error) {
      console.error("Failed to save favorite themes:", error);
    }
  }, []);

  // Add or update a theme in favorites
  const addToFavorites = useCallback((theme: string) => {
    const now = new Date().toISOString();
    const currentFavorites = [...favoriteThemes];
    
    const existingIndex = currentFavorites.findIndex(t => t.theme === theme);
    
    if (existingIndex >= 0) {
      // Update existing theme
      currentFavorites[existingIndex] = {
        ...currentFavorites[existingIndex],
        lastUsed: now,
        useCount: currentFavorites[existingIndex].useCount + 1,
      };
    } else {
      // Add new theme
      const newTheme: FavoriteTheme = {
        theme,
        lastUsed: now,
        useCount: 1,
      };
      currentFavorites.unshift(newTheme);
    }

    // Sort by last used (newest first)
    currentFavorites.sort((a, b) => 
      new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime()
    );

    // Apply size limit
    if (currentFavorites.length > MAX_FAVORITE_THEMES) {
      currentFavorites.splice(MAX_FAVORITE_THEMES);
    }

    saveFavoriteThemes(currentFavorites);
  }, [favoriteThemes, saveFavoriteThemes]);

  // Remove a theme from favorites
  const removeFromFavorites = useCallback((theme: string) => {
    const filteredThemes = favoriteThemes.filter(t => t.theme !== theme);
    saveFavoriteThemes(filteredThemes);
  }, [favoriteThemes, saveFavoriteThemes]);

  // Check if a theme is in favorites
  const isFavorite = useCallback((theme: string) => {
    return favoriteThemes.some(t => t.theme === theme);
  }, [favoriteThemes]);

  // Get favorite theme names
  const getFavoriteThemeNames = useCallback(() => {
    return favoriteThemes.map(t => t.theme);
  }, [favoriteThemes]);

  return {
    favoriteThemes,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    getFavoriteThemeNames,
  };
} 