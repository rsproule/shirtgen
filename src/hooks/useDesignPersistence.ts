import { useState, useCallback } from "react";
import type { DesignConfig, SavedDesignsStorage } from "@/types/design";

const SAVED_DESIGNS_KEY = "instashirt_saved_designs";
const MAX_SAVED_DESIGNS = 50;

export function useDesignPersistence() {
  const [isLoading, setIsLoading] = useState(false);

  // Get saved designs from localStorage
  const getSavedDesigns = useCallback((): DesignConfig[] => {
    try {
      const stored = localStorage.getItem(SAVED_DESIGNS_KEY);
      if (!stored) return [];

      const storage: SavedDesignsStorage = JSON.parse(stored);
      return storage.designs || [];
    } catch (error) {
      console.error("Failed to load saved designs:", error);
      return [];
    }
  }, []);

  // Save designs to localStorage with LRU eviction
  const saveSavedDesigns = useCallback((designs: DesignConfig[]) => {
    try {
      const storage: SavedDesignsStorage = {
        designs,
        maxSize: MAX_SAVED_DESIGNS,
        version: "1.0",
      };
      localStorage.setItem(SAVED_DESIGNS_KEY, JSON.stringify(storage));
    } catch (error) {
      console.error("Failed to save designs:", error);
      throw error;
    }
  }, []);

  // Save a design (manual save)
  const saveDesign = useCallback(async (design: DesignConfig): Promise<void> => {
    setIsLoading(true);
    try {
      const existingDesigns = getSavedDesigns();
      
      // Update timestamps
      const now = new Date().toISOString();
      const updatedDesign: DesignConfig = {
        ...design,
        isSaved: true,
        lastModified: now,
        lastAccessed: now,
      };

      // Check if design already exists (update) or is new (add)
      const existingIndex = existingDesigns.findIndex(d => d.id === design.id);
      
      let newDesigns: DesignConfig[];
      if (existingIndex >= 0) {
        // Update existing design
        newDesigns = [...existingDesigns];
        newDesigns[existingIndex] = updatedDesign;
      } else {
        // Add new design
        newDesigns = [updatedDesign, ...existingDesigns];
      }

      // Apply LRU eviction if over limit
      if (newDesigns.length > MAX_SAVED_DESIGNS) {
        // Sort by lastAccessed (oldest first) and remove excess
        newDesigns.sort((a, b) => 
          new Date(a.lastAccessed).getTime() - new Date(b.lastAccessed).getTime()
        );
        newDesigns = newDesigns.slice(newDesigns.length - MAX_SAVED_DESIGNS);
      }

      // Sort by lastAccessed (newest first) for display
      newDesigns.sort((a, b) => 
        new Date(b.lastAccessed).getTime() - new Date(a.lastAccessed).getTime()
      );

      saveSavedDesigns(newDesigns);
    } finally {
      setIsLoading(false);
    }
  }, [getSavedDesigns, saveSavedDesigns]);

  // Load a design and update lastAccessed
  const loadDesign = useCallback((designId: string): DesignConfig | null => {
    const designs = getSavedDesigns();
    const design = designs.find(d => d.id === designId);
    
    if (design) {
      // Update lastAccessed timestamp
      const updatedDesign = {
        ...design,
        lastAccessed: new Date().toISOString(),
      };
      
      // Update in storage
      const updatedDesigns = designs.map(d => 
        d.id === designId ? updatedDesign : d
      );
      saveSavedDesigns(updatedDesigns);
      
      return updatedDesign;
    }
    
    return null;
  }, [getSavedDesigns, saveSavedDesigns]);

  // Delete a design
  const deleteDesign = useCallback((designId: string): void => {
    const designs = getSavedDesigns();
    const filteredDesigns = designs.filter(d => d.id !== designId);
    saveSavedDesigns(filteredDesigns);
  }, [getSavedDesigns, saveSavedDesigns]);

  // Get storage info (for debugging/UI)
  const getStorageInfo = useCallback(() => {
    const designs = getSavedDesigns();
    return {
      count: designs.length,
      maxSize: MAX_SAVED_DESIGNS,
      remaining: MAX_SAVED_DESIGNS - designs.length,
    };
  }, [getSavedDesigns]);

  return {
    getSavedDesigns,
    saveDesign,
    loadDesign,
    deleteDesign,
    getStorageInfo,
    isLoading,
  };
}