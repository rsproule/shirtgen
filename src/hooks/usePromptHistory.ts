import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/services/db";

const MAX_HISTORY_ITEMS = 50;

export interface PromptHistoryItem {
  id: string;
  text: string;
  timestamp: string;
}

export function usePromptHistory() {
  // Use Dexie's useLiveQuery for reactive data
  const history = useLiveQuery(async () => {
    const items = await db.promptHistory
      .orderBy('timestamp')
      .reverse()
      .limit(MAX_HISTORY_ITEMS)
      .toArray();
    return items;
  }, []) || [];

  const addToHistory = async (prompt: string) => {
    if (!prompt.trim() || prompt.length < 10) return;

    const newItem: PromptHistoryItem = {
      id: `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: prompt.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await db.promptHistory.add(newItem);
      
      // Cleanup old items if needed
      const count = await db.promptHistory.count();
      if (count > MAX_HISTORY_ITEMS) {
        const oldest = await db.promptHistory
          .orderBy('timestamp')
          .limit(count - MAX_HISTORY_ITEMS)
          .toArray();
        await db.promptHistory.bulkDelete(oldest.map(item => item.id));
      }
    } catch (error) {
      console.error("Failed to save prompt history:", error);
      throw error;
    }
  };

  const clearHistory = async () => {
    try {
      await db.promptHistory.clear();
    } catch (error) {
      console.error("Failed to clear prompt history:", error);
      throw error;
    }
  };

  const removeFromHistory = async (id: string) => {
    try {
      await db.promptHistory.delete(id);
    } catch (error) {
      console.error("Failed to remove from prompt history:", error);
      throw error;
    }
  };

  return {
    history,
    addToHistory,
    clearHistory,
    removeFromHistory,
    isLoading: false,
  };
}
