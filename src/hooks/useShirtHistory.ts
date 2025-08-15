import {
  db,
  ImageLifecycleState,
  type ShirtDesign,
  type ShirtHistoryItem,
  type ShirtVersion,
} from "@/services/db";
import { generateDataUrlHash } from "@/services/imageHash";
import type { ShirtData } from "@/types";
import { useLiveQuery } from "dexie-react-hooks";

const MAX_HISTORY_ITEMS = 50;

export function useShirtHistory() {
  // Query both designs and their latest versions for the history view
  const history = useLiveQuery(async () => {
    try {
      // Get all designs, sorted by most recent
      const designs = await db.designs
        .orderBy("updatedAt")
        .reverse()
        .limit(MAX_HISTORY_ITEMS)
        .toArray();

      // Get the latest version for each design
      const historyItems: ShirtHistoryItem[] = [];

      for (const design of designs) {
        const latestVersion = await db.versions
          .where({ designId: design.designId, isLatestVersion: true })
          .first();

        if (latestVersion) {
          // Create a compatible ShirtHistoryItem for the UI
          const historyItem: ShirtHistoryItem = {
            hash: latestVersion.hash,
            originalPrompt: design.originalPrompt,
            generatedTitle: design.generatedTitle,
            imageUrl: latestVersion.imageUrl,
            createdAt: design.createdAt,
            updatedAt: design.updatedAt,
            lifecycle: design.lifecycle,
            designId: design.designId,
            versionNumber: latestVersion.versionNumber,
            isLatestVersion: true,
            responseId: latestVersion.responseId,
            // Legacy compatibility
            prompt: design.originalPrompt,
            generatedAt: design.createdAt,
          };
          historyItems.push(historyItem);
        }
      }

      return historyItems;
    } catch (error) {
      console.error("Failed to load shirt history:", error);
      return [];
    }
  });

  const isLoading = history === undefined;

  const addToHistory = async (shirtData: ShirtData): Promise<string> => {
    if (!shirtData.imageUrl || !shirtData.prompt) return "";

    console.log("💾 Adding to history with data:", {
      prompt: shirtData.prompt,
      responseId: shirtData.responseId,
      isPartial: shirtData.isPartial,
      hasImageUrl: !!shirtData.imageUrl,
      designId: shirtData.designId,
    });

    try {
      const hash = await generateDataUrlHash(shirtData.imageUrl);

      // Check if this is a new version of an existing design
      if (shirtData.designId) {
        console.log(
          "💾 This is a version of existing design:",
          shirtData.designId,
        );
        return await addVersionToExistingDesign(shirtData, hash);
      } else {
        console.log("💾 This is a new design, creating fresh entry");
        return await createNewDesign(shirtData, hash);
      }
    } catch (error) {
      console.error("Failed to save shirt history:", error);
      throw error;
    }
  };

  const createNewDesign = async (
    shirtData: ShirtData,
    hash: string,
  ): Promise<string> => {
    // Check if this exact image already exists
    const existingVersion = await db.versions.get(hash);
    if (existingVersion) {
      console.log("💾 Image hash already exists, updating responseId");

      // Update responseId if provided and different
      const updatedResponseId =
        shirtData.responseId || existingVersion.responseId;
      await db.versions.update(hash, {
        responseId: updatedResponseId,
      });

      // Also update the design's updatedAt
      await db.designs.update(existingVersion.designId, {
        updatedAt: new Date().toISOString(),
      });

      await setLastViewed(hash);
      return hash;
    }

    // Create completely new design and version
    const designId = crypto.randomUUID();
    const now = new Date().toISOString();

    // Create design entry
    const design: ShirtDesign = {
      designId,
      originalPrompt: shirtData.prompt,
      createdAt: shirtData.generatedAt || now,
      updatedAt: now,
      currentVersion: 1,
      lifecycle: ImageLifecycleState.DRAFTED,
    };

    // Create version entry
    const version: ShirtVersion = {
      hash,
      designId,
      versionNumber: 1,
      prompt: shirtData.prompt,
      imageUrl: shirtData.imageUrl,
      responseId: shirtData.responseId,
      createdAt: shirtData.generatedAt || now,
      quality: "high", // Default
      isLatestVersion: true,
      promptChain: [shirtData.prompt], // First version starts the chain
    };

    await db.designs.put(design);
    await db.versions.put(version);
    await setLastViewed(hash);

    // Clean up old designs if needed
    const designCount = await db.designs.count();
    if (designCount > MAX_HISTORY_ITEMS) {
      const oldestDesigns = await db.designs
        .orderBy("updatedAt")
        .limit(designCount - MAX_HISTORY_ITEMS)
        .toArray();

      for (const oldDesign of oldestDesigns) {
        // Delete all versions of this design
        await db.versions.where("designId").equals(oldDesign.designId).delete();
        // Delete the design
        await db.designs.delete(oldDesign.designId);
      }
    }

    console.log("💾 Created new design with designId:", designId);
    return hash;
  };

  const addVersionToExistingDesign = async (
    shirtData: ShirtData,
    hash: string,
  ): Promise<string> => {
    const designId = shirtData.designId;
    if (!designId) {
      throw new Error("designId is required for adding versions");
    }

    // Get the design
    const design = await db.designs.get(designId);
    if (!design) {
      console.warn("No design found for designId:", designId);
      return await createNewDesign(shirtData, hash);
    }

    // Get all existing versions of this design
    const existingVersions = await db.versions
      .where("designId")
      .equals(designId)
      .toArray();

    // Mark all existing versions as not latest
    for (const version of existingVersions) {
      await db.versions.update(version.hash, {
        isLatestVersion: false,
      });
    }

    // Determine the next version number and parent hash
    const maxVersionNumber = Math.max(
      ...existingVersions.map(v => v.versionNumber),
    );
    const parentVersion = existingVersions.find(v => v.isLatestVersion);
    const now = new Date().toISOString();

    // Build the prompt chain by extending the parent's chain
    const parentPromptChain = parentVersion?.promptChain || [];
    const newPromptChain = [...parentPromptChain, shirtData.prompt];

    console.log("🔗 Building prompt chain:", {
      parentChainLength: parentPromptChain.length,
      newPrompt: shirtData.prompt,
      fullChain: newPromptChain,
    });

    // Create new version entry
    const newVersion: ShirtVersion = {
      hash,
      designId: designId,
      versionNumber: maxVersionNumber + 1,
      prompt: shirtData.prompt,
      imageUrl: shirtData.imageUrl,
      responseId: shirtData.responseId,
      createdAt: now,
      quality: "high", // Default
      parentHash: parentVersion?.hash,
      isLatestVersion: true,
      promptChain: newPromptChain, // Full chain from original to current
    };

    // Update design
    const updatedDesign: Partial<ShirtDesign> = {
      updatedAt: now,
      currentVersion: maxVersionNumber + 1,
    };

    await db.versions.put(newVersion);
    await db.designs.update(designId, updatedDesign);
    await setLastViewed(hash);

    console.log(
      `💾 Added version ${maxVersionNumber + 1} to design:`,
      designId,
    );
    return hash;
  };

  const getDesignIdByHash = async (
    hash: string,
  ): Promise<string | undefined> => {
    try {
      const version = await db.versions.get(hash);
      return version?.designId;
    } catch (error) {
      console.error("Failed to get designId:", error);
      return undefined;
    }
  };

  const getVersionsByDesignId = async (
    designId: string,
  ): Promise<ShirtVersion[]> => {
    try {
      return await db.versions.where("designId").equals(designId).toArray();
    } catch (error) {
      console.error("Failed to get versions:", error);
      return [];
    }
  };

  const getByHash = async (
    hash: string,
  ): Promise<ShirtHistoryItem | undefined> => {
    try {
      const version = await db.versions.get(hash);
      if (!version) return undefined;

      const design = await db.designs.get(version.designId);
      if (!design) return undefined;

      // Create compatible ShirtHistoryItem
      const historyItem: ShirtHistoryItem = {
        hash: version.hash,
        originalPrompt: design.originalPrompt,
        generatedTitle: design.generatedTitle,
        imageUrl: version.imageUrl,
        createdAt: design.createdAt,
        updatedAt: design.updatedAt,
        lifecycle: design.lifecycle,
        designId: design.designId,
        versionNumber: version.versionNumber,
        isLatestVersion: version.isLatestVersion,
        responseId: version.responseId,
        // Legacy compatibility
        prompt: design.originalPrompt,
        generatedAt: design.createdAt,
      };

      return historyItem;
    } catch (error) {
      console.error("Failed to get shirt by hash:", error);
      return undefined;
    }
  };

  const updateLifecycle = async (
    hash: string,
    lifecycle: ImageLifecycleState,
  ) => {
    try {
      const version = await db.versions.get(hash);
      if (version) {
        await db.designs.update(version.designId, { lifecycle });
        console.log(
          `Updated lifecycle for design ${version.designId} to ${lifecycle}`,
        );
      }
    } catch (error) {
      console.error("Failed to update lifecycle:", error);
      throw error;
    }
  };

  const updateExternalIds = async (
    hash: string,
    updates: {
      generatedTitle?: string;
      printifyImageId?: string;
      printifyProductId?: string;
      shopifyProductId?: string;
      shopifyUrl?: string;
    },
  ) => {
    try {
      const version = await db.versions.get(hash);
      if (version) {
        await db.designs.update(version.designId, updates);
        console.log(`Updated external IDs for design ${version.designId}`);
      }
    } catch (error) {
      console.error("Failed to update external IDs:", error);
      throw error;
    }
  };

  const clearHistory = async () => {
    try {
      await db.versions.clear();
      await db.designs.clear();
      localStorage.removeItem("last_viewed_shirt");
      console.log("✅ All shirt history cleared");
    } catch (error) {
      console.error("Failed to clear history:", error);
      throw error;
    }
  };

  const removeFromHistory = async (hash: string) => {
    try {
      const version = await db.versions.get(hash);
      if (!version) return;

      // Get all versions of this design
      const allVersions = await db.versions
        .where("designId")
        .equals(version.designId)
        .toArray();

      if (allVersions.length === 1) {
        // This is the only version, delete the entire design
        await db.designs.delete(version.designId);
        await db.versions.delete(hash);
      } else {
        // Delete just this version
        await db.versions.delete(hash);

        // If this was the latest version, mark the previous one as latest
        if (version.isLatestVersion) {
          const remainingVersions = allVersions.filter(v => v.hash !== hash);
          const newLatest = remainingVersions.reduce((latest, current) =>
            current.versionNumber > latest.versionNumber ? current : latest,
          );

          await db.versions.update(newLatest.hash, { isLatestVersion: true });
          await db.designs.update(version.designId, {
            currentVersion: newLatest.versionNumber,
            updatedAt: newLatest.createdAt,
          });
        }
      }

      // Clear last viewed if it was this item
      const lastViewed = localStorage.getItem("last_viewed_shirt");
      if (lastViewed === hash) {
        localStorage.removeItem("last_viewed_shirt");
      }

      console.log("✅ Removed item from history");
    } catch (error) {
      console.error("Failed to remove from history:", error);
      throw error;
    }
  };

  const setLastViewed = async (hash: string) => {
    localStorage.setItem("last_viewed_shirt", hash);
  };

  const getLastViewed = async (): Promise<ShirtHistoryItem | null> => {
    try {
      const hash = localStorage.getItem("last_viewed_shirt");
      if (!hash) return null;

      return (await getByHash(hash)) || null;
    } catch (error) {
      console.error("Failed to get last viewed:", error);
      return null;
    }
  };

  // Legacy compatibility functions (for migration period)
  const addVersionToExisting = async (
    designId: string,
    prompt: string,
    imageUrl: string,
    responseId?: string,
  ) => {
    console.warn(
      "addVersionToExisting is deprecated, use addToHistory with designId",
    );
    const shirtData: ShirtData = {
      prompt,
      imageUrl,
      responseId,
      designId,
      generatedAt: new Date().toISOString(),
    };
    return await addToHistory(shirtData);
  };

  const getShirtById = async (
    id: string,
  ): Promise<ShirtHistoryItem | undefined> => {
    console.warn("getShirtById is deprecated, use getByHash");
    return await getByHash(id);
  };

  return {
    history: history || [],
    isLoading,
    addToHistory,
    addVersionToExisting,
    getShirtById,
    clearHistory,
    removeFromHistory,
    // New methods for proper schema
    getVersionsByDesignId,
    getDesignIdByHash,
    // Lifecycle management methods
    updateLifecycle,
    updateExternalIds,
    getByHash,
    // Last viewed tracking
    setLastViewed,
    getLastViewed,
  };
}
