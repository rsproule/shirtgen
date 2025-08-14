interface StreamEvent {
  type: string;
  response?: { id?: string };
  partial_image_b64?: string;
  partial_image_index?: number;
  result?: string;
  error?: { message?: string };
  response?: { error?: { message?: string } };
}

interface StreamCallbacks {
  onResponseId?: (responseId: string) => void;
  onPartialImage?: (imageUrl: string, partialIndex: number) => void;
  onFinalImage?: (imageUrl: string) => void;
  onError?: (error: string) => void;
}

export class ImageGenerationStreamProcessor {
  private responseId: string | undefined;
  private callbacks: StreamCallbacks;

  constructor(callbacks: StreamCallbacks) {
    this.callbacks = callbacks;
  }

  getResponseId(): string | undefined {
    return this.responseId;
  }

  async processStream(stream: AsyncIterable<any>): Promise<string | undefined> {
    try {
      for await (const event of stream) {
        await this.processEvent(event);
      }
      return this.responseId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Stream processing failed";
      this.callbacks.onError?.(errorMessage);
      throw error;
    }
  }

  private async processEvent(event: any): Promise<void> {
    const streamEvent = event as StreamEvent;

    // Capture response ID from completed event
    if (event.type === "response.completed" && event.response?.id) {
      this.responseId = event.response.id;
      console.log("🆔 Captured response ID:", this.responseId);
      this.callbacks.onResponseId?.(this.responseId);
      return;
    }

    // Handle errors
    if (streamEvent.type === "error" || streamEvent.error) {
      const errorMessage = 
        streamEvent.error?.message ||
        streamEvent.response?.error?.message ||
        "Stream error occurred";
      throw new Error(errorMessage);
    }

    // Handle response-level errors  
    if (streamEvent.type === "response.error" || streamEvent.response?.error) {
      const errorMessage = streamEvent.response?.error?.message || "Response error occurred";
      throw new Error(errorMessage);
    }

    // Handle partial images
    if (streamEvent.type === "response.image_generation_call.partial_image") {
      const imageBase64 = streamEvent.partial_image_b64;
      if (imageBase64) {
        const imageUrl = `data:image/png;base64,${imageBase64}`;
        const partialIndex = streamEvent.partial_image_index ?? 0;
        this.callbacks.onPartialImage?.(imageUrl, partialIndex);
      }
    }

    // Handle final images
    if (streamEvent.type === "response.image_generation_call.complete") {
      const imageData = streamEvent.result;
      if (imageData) {
        const imageUrl = `data:image/png;base64,${imageData}`;
        this.callbacks.onFinalImage?.(imageUrl);
      }
    }
  }
}
