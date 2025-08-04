import { db } from "../db";

/**
 * Database operations for shirt tracking and lifecycle management
 * Handles creation, updates, and status management of shirt records
 */
export class ShirtDatabase {
  /**
   * Create initial draft record when shirt creation begins
   */
  static async createDraftRecord(
    imageHash: string,
    prompt: string,
    imageUrl: string,
    productName: string,
  ): Promise<void> {
    const now = new Date().toISOString();
    await db.shirtHistory.put({
      hash: imageHash,
      originalPrompt: prompt,
      imageUrl,
      createdAt: now,
      updatedAt: now,
      lifecycle: "drafted" as const,
      generatedTitle: productName,

      // Legacy compatibility fields
      id: imageHash,
      prompt,
      generatedAt: now,
      timestamp: Date.now(),
      productName,
      isPublished: false,
    });
    console.log("💾 Stored product info in IndexedDB with hash:", imageHash);
  }

  /**
   * Update record with published status and external service IDs
   */
  static async updatePublishedRecord(
    imageHash: string,
    productId: string,
    shopifyUrl?: string,
  ): Promise<void> {
    await db.shirtHistory.update(imageHash, {
      isPublished: true,
      publishedAt: new Date().toISOString(),
      printifyProductId: productId,
      shopifyUrl,
    });
    console.log("💾 Updated published status in database");
  }
}
