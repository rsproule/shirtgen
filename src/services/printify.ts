import { db } from "./db";
import { generateImageHash } from "./imageHash";
import { createProductIdentifier } from "./nameGeneration";

// Shirt configuration presets
interface ShirtConfig {
  name: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: number[];
}

const SHIRT_CONFIGS: Record<string, ShirtConfig> = {
  shaka: {
    name: "Unisex Garment-Dyed Drop-Shoulder T-Shirt (Shaka)",
    blueprint_id: 1723,
    print_provider_id: 74,
    variants: [
      118073, 118074, 118075, 118081, 118082, 118083, 118089, 118090, 118091,
      118102, 118106, 118107,
    ],
  },
};

interface PrintifyImage {
  id: string;
  src: string;
  width: number;
  height: number;
}

interface PrintifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  variants: PrintifyVariant[];
  options: PrintifyOption[];
  external?: {
    id: string;
    handle: string;
  };
}

interface PrintifyOption {
  name: string;
  type: string;
  values: Array<{
    id: number;
    title: string;
    colors?: string[];
  }>;
}

interface PrintifyVariant {
  id: number;
  title: string;
  price: number;
  options: number[];
  external?: {
    id: string;
  };
}

interface CreateProductVariant {
  id: number;
  price: number; // Price in cents
  is_enabled: boolean;
}

interface CreateProductPayload {
  title: string;
  description: string;
  blueprint_id: number;
  print_provider_id: number;
  variants: CreateProductVariant[];
  print_areas: Array<{
    variant_ids: number[];
    placeholders: Array<{
      position: string;
      images: Array<{
        id: string;
        x: number;
        y: number;
        scale: number;
        angle: number;
      }>;
    }>;
  }>;
}

class PrintifyService {
  constructor() {
    // All API calls go through our server-side /api/printify endpoint
    // No need for credentials on the client-side
  }

  private async makeRequest<T>(
    action: string,
    body?: unknown,
    method: string = "POST",
  ): Promise<T> {
    const baseUrl = import.meta.env.DEV ? "http://localhost:3000" : "";
    const url = `${baseUrl}/api/printify?action=${action}`;
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async uploadImage(imageBlob: Blob): Promise<PrintifyImage> {
    // Compress image if it's too large
    return new Promise(async (resolve, reject) => {
      try {
        let processedBlob = imageBlob;

        // If image is larger than 2MB, compress it
        if (imageBlob.size > 2 * 1024 * 1024) {
          console.log(
            `🗜️ Compressing image from ${(imageBlob.size / 1024 / 1024).toFixed(2)}MB`,
          );
          processedBlob = await this.compressImage(imageBlob);
          console.log(
            `✅ Compressed to ${(processedBlob.size / 1024 / 1024).toFixed(2)}MB`,
          );
        }

        const reader = new FileReader();

        reader.onload = async () => {
          try {
            const dataUrl = reader.result as string;
            const result = await this.makeRequest<PrintifyImage>("upload", {
              imageUrl: dataUrl,
            });
            resolve(result);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = reject;
        reader.readAsDataURL(processedBlob);
      } catch (error) {
        reject(error);
      }
    });
  }

  private async compressImage(blob: Blob): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        // More aggressive sizing for large files
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
          0.7, // 70% quality for better compression
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  async createProduct(payload: CreateProductPayload): Promise<PrintifyProduct> {
    return this.makeRequest<PrintifyProduct>("create-product", payload);
  }

  async publishProduct(productId: string): Promise<void> {
    await this.makeRequest("publish", { productId });
  }

  async getProduct(productId: string): Promise<PrintifyProduct> {
    const baseUrl = import.meta.env.DEV ? "http://localhost:3000" : "";
    const url = `${baseUrl}/api/printify?action=get-product&productId=${productId}`;
    const response = await fetch(url);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createShirtFromDesign(
    imageUrl: string,
    prompt: string,
    productName: string,
    description: string = "",
    price: number = 3500, // $35.00 in cents
  ): Promise<{
    product: PrintifyProduct;
    variants: PrintifyVariant[];
    options: PrintifyOption[];
    imageHash: string;
  }> {
    console.log("🚀 Starting shirt creation process...");
    console.log("📝 Original prompt:", prompt);
    console.log("💰 Price:", `$${(price / 100).toFixed(2)}`);

    try {
      // 1. Convert image URL to blob and generate hash
      console.log("📷 Step 1: Fetching and processing image...");
      const imageResponse = await fetch(imageUrl);
      console.log(
        "✅ Image fetched, size:",
        imageResponse.headers.get("content-length"),
        "bytes",
      );

      const imageBlob = await imageResponse.blob();
      console.log("🔄 Converting to blob, size:", imageBlob.size, "bytes");

      // Generate hash from image content
      const imageHash = await generateImageHash(imageBlob);
      console.log("🔑 Generated image hash:", imageHash);

      // Store product info in IndexedDB using new hash-based schema
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
      console.log("🏷️ Using product name:", productName);

      console.log("⬆️ Uploading image to Printify...");
      const uploadedImage = await this.uploadImage(imageBlob);
      console.log("✅ Image uploaded successfully, ID:", uploadedImage.id);
      console.log(
        "📸 Uploaded image details:",
        JSON.stringify(uploadedImage, null, 2),
      );

      // 2. Use Shaka shirt configuration
      const shirtConfig = SHIRT_CONFIGS.shaka;
      console.log("📋 Step 2: Using shirt config:", shirtConfig.name);
      console.log("📋 Variant IDs:", shirtConfig.variants);

      // 3. Create product with Shaka shirt configuration
      console.log("🏭 Step 3: Creating product on Printify...");
      const identifier = createProductIdentifier(imageHash);
      const productPayload: CreateProductPayload = {
        title: productName,
        description:
          description ||
          `Created on https://shirtslop.com\n\n${prompt.length > 50 ? prompt.substring(0, 50) + "..." : prompt}\n\nID: ${identifier}`,
        blueprint_id: shirtConfig.blueprint_id,
        print_provider_id: shirtConfig.print_provider_id,
        variants: shirtConfig.variants.map(variantId => ({
          id: variantId,
          price: price,
          is_enabled: true,
        })),
        print_areas: [
          {
            variant_ids: shirtConfig.variants,
            placeholders: [
              {
                position: "front_dtg",
                images: [
                  {
                    id: uploadedImage.id,
                    x: 0.5, // Center horizontally
                    y: 0.5, // Center vertically
                    scale: 0.8, // Full size (same as bash script)
                    angle: 0,
                  },
                ],
              },
            ],
          },
        ],
      };

      console.log(
        `📦 Product payload prepared with blueprint ${shirtConfig.blueprint_id} and provider ${shirtConfig.print_provider_id}`,
      );
      console.log(
        "🖼️ Print areas config:",
        JSON.stringify(productPayload.print_areas, null, 2),
      );
      const product = await this.createProduct(productPayload);
      console.log("✅ Product created successfully, ID:", product.id);

      // 4. Publish to Shopify
      console.log("🛒 Step 4: Publishing to Shopify...");
      await this.publishProduct(product.id);
      console.log("✅ Product published to Shopify");

      // 5. Wait for sync and get updated product details with variants
      console.log("⏳ Step 5: Waiting 5 seconds for Shopify sync...");
      await new Promise(resolve => setTimeout(resolve, 5000));

      console.log("🔄 Fetching updated product details...");
      const updatedProduct = await this.getProduct(product.id);
      console.log(
        "✅ Updated product fetched, variants count:",
        updatedProduct.variants?.length || 0,
      );
      console.log("🔗 Product external data:", updatedProduct.external);

      // Use the external handle directly as it contains the full Shopify URL
      const shopifyUrl = updatedProduct.external?.handle;

      if (shopifyUrl) {
        console.log("🛒 Shopify product URL:", shopifyUrl);
      } else {
        console.log("⚠️ No Shopify handle found in external data");
      }

      // Update IndexedDB with published status
      await db.shirtHistory.update(imageHash, {
        isPublished: true,
        publishedAt: new Date().toISOString(),
        printifyProductId: product.id,
        shopifyUrl,
      });

      console.log("💾 Updated published status in database");
      console.log("🎉 Shirt creation process completed successfully!");

      return {
        product: updatedProduct,
        variants: updatedProduct.variants || [],
        options: updatedProduct.options || [],
        imageHash, // Include hash for tracking
      };
    } catch (error) {
      console.error("❌ Failed to create shirt:", error);
      throw new Error(
        `Failed to create shirt: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

export const printifyService = new PrintifyService();
