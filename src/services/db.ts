import Dexie, { type EntityTable } from "dexie";

export interface ShirtHistoryItem {
  id: string; // Image hash as unique identifier
  prompt: string;
  imageUrl: string;
  generatedAt: string;
  timestamp: number;
  productName?: string; // LLM-generated product name
  printifyProductId?: string; // Printify product ID
  shopifyUrl?: string; // Direct Shopify product URL
  isPublished?: boolean; // Whether product was successfully published
  publishedAt?: string; // When it was published
}

export interface PromptHistoryItem {
  id: string;
  text: string;
  timestamp: string;
}

const db = new Dexie("InstashirtDB") as Dexie & {
  shirtHistory: EntityTable<ShirtHistoryItem, "id">;
  promptHistory: EntityTable<PromptHistoryItem, "id">;
};

db.version(1).stores({
  shirtHistory: "id, timestamp",
  promptHistory: "id, timestamp",
});

export { db };
