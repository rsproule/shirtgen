import Dexie, { type EntityTable } from "dexie";

export interface ShirtHistoryItem {
  id: string;
  prompt: string;
  imageUrl: string;
  generatedAt: string;
  timestamp: number;
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
