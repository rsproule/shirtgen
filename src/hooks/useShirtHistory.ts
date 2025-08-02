import { useLiveQuery } from "dexie-react-hooks";
import { db, type ShirtHistoryItem } from "@/services/db";
import type { ShirtData } from "@/types";

export type { ShirtHistoryItem };

const MAX_HISTORY_ITEMS = 100;

export function useShirtHistory() {
  // Use Dexie's useLiveQuery for reactive data
  const history =
    useLiveQuery(async () => {
      const items = await db.shirtHistory
        .orderBy("timestamp")
        .reverse()
        .limit(MAX_HISTORY_ITEMS)
        .toArray();

      // Migrate from localStorage on first load if needed
      if (items.length === 0) {
        try {
          const stored = localStorage.getItem("instashirt_history");
          if (stored) {
            console.log("Migrating from localStorage...");
            const parsedHistory = JSON.parse(stored);
            await db.shirtHistory.bulkAdd(parsedHistory);
            localStorage.removeItem("instashirt_history");
            return parsedHistory;
          }
        } catch (error) {
          console.warn("Migration failed:", error);
        }
      }

      return items;
    }, []) || [];

  const addToHistory = async (shirtData: ShirtData) => {
    if (!shirtData.imageUrl || !shirtData.prompt) return;

    const newItem: ShirtHistoryItem = {
      id: `shirt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt: shirtData.prompt,
      imageUrl: shirtData.imageUrl,
      generatedAt: shirtData.generatedAt || new Date().toISOString(),
      timestamp: Date.now(),
    };

    try {
      await db.shirtHistory.add(newItem);

      // Cleanup old items if needed
      const count = await db.shirtHistory.count();
      if (count > MAX_HISTORY_ITEMS) {
        const oldest = await db.shirtHistory
          .orderBy("timestamp")
          .limit(count - MAX_HISTORY_ITEMS)
          .toArray();
        await db.shirtHistory.bulkDelete(oldest.map(item => item.id));
      }

      return newItem.id;
    } catch (error) {
      console.error("Failed to save shirt history:", error);
      throw error;
    }
  };

  const clearHistory = async () => {
    try {
      await db.shirtHistory.clear();
    } catch (error) {
      console.error("Failed to clear shirt history:", error);
      throw error;
    }
  };

  const removeFromHistory = async (id: string) => {
    try {
      await db.shirtHistory.delete(id);
    } catch (error) {
      console.error("Failed to remove from shirt history:", error);
      throw error;
    }
  };

  const getShirtById = (id: string): ShirtHistoryItem | null => {
    return history.find((item: ShirtHistoryItem) => item.id === id) || null;
  };

  return {
    history,
    addToHistory,
    getShirtById,
    clearHistory,
    removeFromHistory,
  };
}
