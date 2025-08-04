/**
 * Image processing utilities for Printify integration
 * Handles image fetching, compression, and optimization
 */
export class ImageProcessor {
  /**
   * Fetch an image from URL and convert to Blob
   */
  static async fetchImageAsBlob(imageUrl: string): Promise<Blob> {
    console.log("📷 Fetching image from URL...");
    const imageResponse = await fetch(imageUrl);
    console.log(
      "✅ Image fetched, size:",
      imageResponse.headers.get("content-length"),
      "bytes",
    );

    const imageBlob = await imageResponse.blob();
    console.log("🔄 Converting to blob, size:", imageBlob.size, "bytes");
    return imageBlob;
  }

  /**
   * Compress image blob with specified quality
   * Maintains aspect ratio while reducing file size
   */
  static async compressImage(blob: Blob, quality: number = 0.9): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        const maxWidth = 800;
        const maxHeight = 1200;
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          compressedBlob => {
            if (compressedBlob) {
              resolve(compressedBlob);
            } else {
              reject(new Error("Failed to compress image"));
            }
          },
          "image/jpeg",
          quality,
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * Process image for Printify: resize and compress as needed
   */
  static async processForPrintify(blob: Blob, scale: number = 1.0): Promise<Blob> {
    console.log("🖨️ Processing image for Printify...");
    console.log("📏 Scale factor:", scale);
    
    // First resize for optimal DTG printing with scale factor
    const resizedBlob = await this.resizeForPrintify(blob, scale);
    
    // Then compress if still too large (Printify has 20MB limit)
    const maxSize = 20 * 1024 * 1024; // 20MB
    
    if (resizedBlob.size > maxSize) {
      console.log("🗜️ Image still too large, compressing...");
      return await this.compressImage(resizedBlob, 0.9);
    }
    
    return resizedBlob;
  }

  /**
   * Resize image for Printify DTG printing requirements with scale factor
   * Optimal dimensions for DTG printing are typically 12" x 16" at 300 DPI
   * This converts to approximately 3600 x 4800 pixels
   */
  static async resizeForPrintify(blob: Blob, scale: number = 1.0): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Printify DTG optimal dimensions
        const targetWidth = 3600;
        const targetHeight = 4800;
        
        // Calculate dimensions maintaining aspect ratio
        const imgAspectRatio = img.width / img.height;
        const targetAspectRatio = targetWidth / targetHeight;
        
        let finalWidth, finalHeight;
        
        if (imgAspectRatio > targetAspectRatio) {
          // Image is wider than target ratio - fit to width
          finalWidth = targetWidth;
          finalHeight = targetWidth / imgAspectRatio;
        } else {
          // Image is taller than target ratio - fit to height
          finalHeight = targetHeight;
          finalWidth = targetHeight * imgAspectRatio;
        }

        // Apply user's scale factor
        finalWidth *= scale;
        finalHeight *= scale;

        // Ensure minimum dimensions for quality
        const minDimension = 1800; // Minimum 1800px for quality
        if (finalWidth < minDimension || finalHeight < minDimension) {
          const scale = minDimension / Math.min(finalWidth, finalHeight);
          finalWidth *= scale;
          finalHeight *= scale;
        }

        canvas.width = finalWidth;
        canvas.height = finalHeight;

        // Enable high-quality image rendering
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";
        }

        // Draw the resized image
        ctx?.drawImage(img, 0, 0, finalWidth, finalHeight);

        // Convert to blob with high quality
        canvas.toBlob(
          resizedBlob => {
            if (resizedBlob) {
              console.log(`🖨️ Resized image for Printify: ${finalWidth}x${finalHeight}px (scale: ${scale})`);
              resolve(resizedBlob);
            } else {
              reject(new Error("Failed to resize image for Printify"));
            }
          },
          "image/png", // Use PNG for better quality
          1.0, // Maximum quality
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }
}
