import { useLiveQuery } from "dexie-react-hooks";
import { db, type ShirtHistoryItem, ImageLifecycleState } from "@/services/db";
import type { ShirtData } from "@/types";
import { generateDataUrlHash } from "@/services/imageHash";

export type { ShirtHistoryItem };

const MAX_HISTORY_ITEMS = 100;

export function useShirtHistory() {
  // Use Dexie's useLiveQuery for reactive data
  const history = useLiveQuery(async () => {
    const items = await db.shirtHistory
      .orderBy("createdAt")
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

          // Convert legacy items to new hash-based format
          const migratedItems = [];
          for (const legacyItem of parsedHistory) {
            if (legacyItem.imageUrl && legacyItem.prompt) {
              try {
                const hash = await generateDataUrlHash(legacyItem.imageUrl);
                const newItem: ShirtHistoryItem = {
                  hash,
                  originalPrompt: legacyItem.prompt,
                  imageUrl: legacyItem.imageUrl,
                  createdAt: legacyItem.generatedAt || new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  lifecycle: legacyItem.isPublished
                    ? ImageLifecycleState.PUBLISHED
                    : ImageLifecycleState.DRAFTED,
                  printifyProductId: legacyItem.printifyProductId,
                  shopifyUrl: legacyItem.shopifyUrl,
                  generatedTitle: legacyItem.productName,
                  publishedAt: legacyItem.publishedAt,

                  // Legacy compatibility
                  id: hash,
                  prompt: legacyItem.prompt,
                  generatedAt: legacyItem.generatedAt,
                  timestamp: legacyItem.timestamp,
                  productName: legacyItem.productName,
                  isPublished: legacyItem.isPublished,
                };
                migratedItems.push(newItem);
              } catch (error) {
                console.warn("Failed to migrate legacy item:", error);
              }
            }
          }

          if (migratedItems.length > 0) {
            await db.shirtHistory.bulkPut(migratedItems);
          }
          localStorage.removeItem("instashirt_history");
          return migratedItems;
        }
      } catch (error) {
        console.warn("Migration failed:", error);
      }
    }

    return items;
  }, []);

  const isLoading = history === undefined;

  const addToHistory = async (shirtData: ShirtData) => {
    if (!shirtData.imageUrl || !shirtData.prompt) return;

    try {
      // Generate hash from image data
      const hash = await generateDataUrlHash(shirtData.imageUrl);

      // Check if this image already exists
      const existingItem = await db.shirtHistory.get(hash);
      if (existingItem) {
        console.log("Image already exists in history with hash:", hash);
        // Update the existing item's timestamp to move it to the top
        await db.shirtHistory.update(hash, {
          updatedAt: new Date().toISOString(),
          // Update legacy timestamp for compatibility
          timestamp: Date.now(),
        });
        return hash;
      }

      // Create new item with hash as primary key
      const now = new Date().toISOString();
      const newItem: ShirtHistoryItem = {
        hash,
        originalPrompt: shirtData.prompt,
        imageUrl: shirtData.imageUrl,
        createdAt: shirtData.generatedAt || now,
        updatedAt: now,
        lifecycle: ImageLifecycleState.DRAFTED,

        // Legacy compatibility fields
        id: hash,
        prompt: shirtData.prompt,
        generatedAt: shirtData.generatedAt || now,
        timestamp: Date.now(),
      };

      await db.shirtHistory.put(newItem);

      // Cleanup old items if needed
      const count = await db.shirtHistory.count();
      if (count > MAX_HISTORY_ITEMS) {
        const oldest = await db.shirtHistory
          .orderBy("createdAt")
          .limit(count - MAX_HISTORY_ITEMS)
          .toArray();
        await db.shirtHistory.bulkDelete(oldest.map(item => item.hash));
      }

      return hash;
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

  const removeFromHistory = async (hashOrId: string) => {
    try {
      await db.shirtHistory.delete(hashOrId);
    } catch (error) {
      console.error("Failed to remove from shirt history:", error);
      throw error;
    }
  };

  const getShirtById = (hashOrId: string): ShirtHistoryItem | null => {
    return (
      history?.find(
        (item: ShirtHistoryItem) =>
          item.hash === hashOrId || item.id === hashOrId,
      ) || null
    );
  };

  // New methods for lifecycle management
  const updateLifecycle = async (
    hash: string,
    lifecycle: ImageLifecycleState,
  ) => {
    try {
      await db.shirtHistory.update(hash, {
        lifecycle,
        updatedAt: new Date().toISOString(),
        // Update legacy field for compatibility
        isPublished: lifecycle === ImageLifecycleState.PUBLISHED,
      });
    } catch (error) {
      console.error("Failed to update lifecycle:", error);
      throw error;
    }
  };

  const updateExternalIds = async (
    hash: string,
    updates: Partial<
      Pick<
        ShirtHistoryItem,
        | "printifyImageId"
        | "printifyProductId"
        | "shopifyProductId"
        | "shopifyUrl"
        | "generatedTitle"
      >
    >,
  ) => {
    try {
      await db.shirtHistory.update(hash, {
        ...updates,
        updatedAt: new Date().toISOString(),
        // Update legacy fields for compatibility
        productName: updates.generatedTitle,
      });
    } catch (error) {
      console.error("Failed to update external IDs:", error);
      throw error;
    }
  };

  const getByHash = async (hash: string): Promise<ShirtHistoryItem | null> => {
    try {
      return (await db.shirtHistory.get(hash)) || null;
    } catch (error) {
      console.error("Failed to get shirt by hash:", error);
      return null;
    }
  };

  const setLastViewed = async (hash: string) => {
    try {
      localStorage.setItem("last_viewed_shirt", hash);
      // Update the viewed timestamp in the database
      await db.shirtHistory.update(hash, {
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Failed to set last viewed:", error);
    }
  };

  const getLastViewed = async (): Promise<ShirtHistoryItem | null> => {
    try {
      const lastViewedHash = localStorage.getItem("last_viewed_shirt");
      if (lastViewedHash) {
        return await getByHash(lastViewedHash);
      }
      
      // Fallback to most recent shirt if no last viewed is set
      const recentShirts = await db.shirtHistory
        .orderBy("updatedAt")
        .reverse()
        .limit(1)
        .toArray();
      
      return recentShirts[0] || null;
    } catch (error) {
      console.error("Failed to get last viewed:", error);
      return null;
    }
  };

  return {
    history: history || [],
    isLoading,
    addToHistory,
    getShirtById,
    clearHistory,
    removeFromHistory,
    // New lifecycle management methods
    updateLifecycle,
    updateExternalIds,
    getByHash,
    // Last viewed tracking
    setLastViewed,
    getLastViewed,
  };
}
