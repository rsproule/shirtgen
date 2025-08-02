import type { TexturePlacement } from "./index";

export interface DesignConfig {
  id: string;
  prompt: string;
  imageUrl: string; // This will be loaded from IndexedDB when needed
  shirtColor: string;
  texturePlacement: TexturePlacement;
  createdAt: string;
  lastModified: string;
  lastAccessed: string; // For LRU eviction
  isSaved: boolean; // Manual save vs auto-save
  generatedName: string; // LLM-generated short name
  isGeneratingName?: boolean; // Loading state for name generation
  imageId?: string; // Reference to image in IndexedDB
}

export interface AutoSaveState {
  currentDesign: DesignConfig | null;
  lastViewedAt: string;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export interface SavedDesignsStorage {
  designs: DesignConfig[];
  maxSize: 50;
  version: '1.0';
}

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface RecoveryPromptData {
  hasUnsavedWork: boolean;
  unsavedDesign: DesignConfig | null;
  timeAgo: string;
}