import Dexie, { type EntityTable } from "dexie";

export const ImageLifecycleState = {
  DRAFTED: 'drafted',           // Generated locally, not uploaded anywhere
  UPLOADING: 'uploading',       // Currently being uploaded to Printify
  UPLOADED: 'uploaded',         // Uploaded to Printify, not yet published
  PUBLISHING: 'publishing',     // Currently being published to Shopify
  PUBLISHED: 'published',       // Successfully published to Shopify
  FAILED: 'failed'             // Publishing failed, can retry
} as const;

export type ImageLifecycleState = typeof ImageLifecycleState[keyof typeof ImageLifecycleState];

export interface ShirtHistoryItem {
  hash: string; // SHA-256 hash as PRIMARY KEY - guaranteed unique
  originalPrompt: string; // Full original user prompt
  generatedTitle?: string; // LLM-generated short title/summary
  imageUrl: string; // Base64 data URL of the image
  createdAt: string; // ISO timestamp of creation
  updatedAt: string; // ISO timestamp of last update
  lifecycle: ImageLifecycleState; // Current lifecycle state
  
  // External platform tracking
  printifyImageId?: string; // Printify uploaded image ID
  printifyProductId?: string; // Printify product ID
  shopifyProductId?: string; // Shopify product ID
  shopifyUrl?: string; // Direct Shopify store link
  
  // Generation metadata
  generationParams?: {
    model: string;
    resolution: string;
    style?: string;
  };
  
  // Publishing metadata
  publishedAt?: string;
  publishError?: string; // Last publishing error if any
  
  // Legacy fields for backward compatibility
  id?: string; // Will be same as hash
  prompt?: string; // Will be same as originalPrompt
  generatedAt?: string; // Will be same as createdAt
  timestamp?: number; // Will be derived from createdAt
  productName?: string; // Will be same as generatedTitle
  isPublished?: boolean; // Will be derived from lifecycle state
}

export interface PromptHistoryItem {
  id: string;
  text: string;
  timestamp: string;
}

const db = new Dexie("InstashirtDB") as Dexie & {
  shirtHistory: EntityTable<ShirtHistoryItem, "hash">;
  promptHistory: EntityTable<PromptHistoryItem, "id">;
};

db.version(1).stores({
  shirtHistory: "id, timestamp", // Legacy schema
  promptHistory: "id, timestamp",
});

// Version 2: Migration to hash-based primary key
db.version(2).stores({
  shirtHistory: "hash, createdAt, lifecycle, printifyProductId, shopifyProductId", 
  promptHistory: "id, timestamp",
}).upgrade(async (tx) => {
  // Migrate existing data to use hash as primary key
  const oldItems = await tx.table("shirtHistory").toArray();
  
  for (const item of oldItems) {
    if (item.id && item.imageUrl && item.prompt) {
      try {
        // Generate hash from existing image URL
        const { generateDataUrlHash } = await import("./imageHash");
        const hash = await generateDataUrlHash(item.imageUrl);
        
        // Create new item with hash-based structure
        const newItem: ShirtHistoryItem = {
          hash,
          originalPrompt: item.prompt,
          imageUrl: item.imageUrl,
          createdAt: item.generatedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lifecycle: item.isPublished ? ImageLifecycleState.PUBLISHED : ImageLifecycleState.DRAFTED,
          printifyProductId: item.printifyProductId,
          shopifyUrl: item.shopifyUrl,
          generatedTitle: item.productName,
          publishedAt: item.publishedAt,
          
          // Legacy compatibility fields
          id: hash,
          prompt: item.prompt,
          generatedAt: item.generatedAt,
          timestamp: item.timestamp,
          productName: item.productName,
          isPublished: item.isPublished,
        };
        
        // Add the migrated item (will replace due to same hash)
        await tx.table("shirtHistory").put(newItem);
      } catch (error) {
        console.warn(`Failed to migrate item ${item.id}:`, error);
      }
    }
  }
});

export { db };
