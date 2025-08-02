import { useState, useEffect } from "react";
import type { ShirtData } from "@/types";

const SHIRT_HISTORY_KEY = "instashirt_history";
const MAX_HISTORY_ITEMS = 20;

export interface ShirtHistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  generatedAt: string;
  timestamp: number;
}

export function useShirtHistory() {
  const [history, setHistory] = useState<ShirtHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SHIRT_HISTORY_KEY);
      if (stored) {
        const parsedHistory = JSON.parse(stored);
        // Sort by timestamp descending (newest first)
        const sortedHistory = parsedHistory.sort((a: ShirtHistoryItem, b: ShirtHistoryItem) => 
          b.timestamp - a.timestamp
        );
        setHistory(sortedHistory);
      }
    } catch (error) {
      console.error("Failed to load shirt history:", error);
    }
  }, []);

  // Add shirt to history
  const addToHistory = (shirtData: ShirtData) => {
    if (!shirtData.imageUrl || !shirtData.prompt) return;

    const newItem: ShirtHistoryItem = {
      id: `shirt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt: shirtData.prompt,
      imageUrl: shirtData.imageUrl,
      generatedAt: shirtData.generatedAt || new Date().toISOString(),
      timestamp: Date.now(),
    };

    setHistory(prevHistory => {
      // Remove any existing item with the same image URL (avoid duplicates)
      const filtered = prevHistory.filter(item => item.imageUrl !== newItem.imageUrl);
      
      // Add new item to beginning and limit to MAX_HISTORY_ITEMS
      const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Save to localStorage
      try {
        localStorage.setItem(SHIRT_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save shirt history:", error);
      }
      
      return newHistory;
    });

    return newItem.id;
  };

  // Get shirt by ID
  const getShirtById = (id: string): ShirtHistoryItem | null => {
    return history.find(item => item.id === id) || null;
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(SHIRT_HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear shirt history:", error);
    }
  };

  // Remove specific item from history
  const removeFromHistory = (id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      try {
        localStorage.setItem(SHIRT_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to update shirt history:", error);
      }
      return newHistory;
    });
  };

  return {
    history,
    addToHistory,
    getShirtById,
    clearHistory,
    removeFromHistory,
  };
}