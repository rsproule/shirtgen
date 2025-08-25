export interface TypingStats {
  wpm: number;
  accuracy: number;
  timeTyping: number;
  correctChars: number;
  totalChars: number;
}

export interface ShirtData {
  imageUrl: string;
  prompt: string;
  generatedAt?: string;
  isPartial?: boolean;
  partialIndex?: number;
}

export type TexturePlacement = "front" | "back";

export interface ImageGenerationResponse {
  output: Array<{
    type: string;
    result: string;
  }>;
}
