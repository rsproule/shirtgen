import { useState, useEffect } from "react";

const PROMPT_HISTORY_KEY = "instashirt_prompt_history";
const MAX_HISTORY_ITEMS = 10;

export interface PromptHistoryItem {
  id: string;
  text: string;
  timestamp: string;
}

export function usePromptHistory() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROMPT_HISTORY_KEY);
      if (stored) {
        const parsedHistory = JSON.parse(stored);
        setHistory(parsedHistory);
      }
    } catch (error) {
      console.error("Failed to load prompt history:", error);
    }
  }, []);

  // Save prompt to history
  const addToHistory = (prompt: string) => {
    if (!prompt.trim() || prompt.length < 10) return;

    const newItem: PromptHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      text: prompt.trim(),
      timestamp: new Date().toISOString(),
    };

    setHistory(prevHistory => {
      // Remove duplicate if exists
      const filtered = prevHistory.filter(item => item.text !== newItem.text);

      // Add new item to beginning and limit to MAX_HISTORY_ITEMS
      const newHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);

      // Save to localStorage
      try {
        localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to save prompt history:", error);
      }

      return newHistory;
    });
  };

  // Clear all history
  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(PROMPT_HISTORY_KEY);
    } catch (error) {
      console.error("Failed to clear prompt history:", error);
    }
  };

  // Remove specific item from history
  const removeFromHistory = (id: string) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter(item => item.id !== id);
      try {
        localStorage.setItem(PROMPT_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Failed to update prompt history:", error);
      }
      return newHistory;
    });
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
  };
}
