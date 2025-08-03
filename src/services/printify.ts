import { db } from "./db";
import { generateImageHash } from "./imageHash";
import { createProductIdentifier, generateProductName } from "./nameGeneration";

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
  private readonly token: string;
  private readonly shopId: string;
  private readonly shopifyStore: string;

  constructor() {
    this.token = import.meta.env.VITE_PRINTIFY_TOKEN;
    this.shopId = import.meta.env.VITE_PRINTIFY_SHOP_ID;
    this.shopifyStore = import.meta.env.VITE_SHOPIFY_STORE;

    if (!this.token) {
      throw new Error("VITE_PRINTIFY_TOKEN environment variable is required");
    }
    if (!this.shopId) {
      throw new Error("VITE_PRINTIFY_SHOP_ID environment variable is required");
    }
    if (!this.shopifyStore) {
      throw new Error("VITE_SHOPIFY_STORE environment variable is required");
    }
  }

  private async generateAndStoreProductName(
    prompt: string,
    imageHash: string,
    imageUrl: string,
  ): Promise<string> {
    try {
      console.log("🤖 Generating product name with LLM...");
      const openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY;
      const productName = await generateProductName(prompt, openaiApiKey);
      console.log("✅ Generated product name:", productName);

      // Store in IndexedDB using image hash as ID
      await db.shirtHistory.put({
        id: imageHash,
        prompt,
        imageUrl,
        generatedAt: new Date().toISOString(),
        timestamp: Date.now(),
        productName,
        isPublished: false,
      });

      console.log("💾 Stored product info in IndexedDB with hash:", imageHash);
      return productName;
    } catch (error) {
      console.warn("Failed to generate/store product name:", error);
      return prompt.length > 30
        ? prompt.substring(0, 30).trim() + "..."
        : prompt.trim();
    }
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
    // Convert blob directly to base64 without any resizing or compression
    return new Promise((resolve, reject) => {
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
      reader.readAsDataURL(imageBlob);
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

  getShopifyUrl(productHandle: string): string {
    return `https://${this.shopifyStore}.myshopify.com/products/${productHandle}`;
  }

  async createShirtFromDesign(
    imageUrl: string,
    prompt: string,
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

      // Generate a marketable product name using LLM
      const productName = await this.generateAndStoreProductName(
        prompt,
        imageHash,
        imageUrl,
      );
      console.log("🏷️ Generated product name:", productName);

      console.log("⬆️ Uploading image to Printify...");
      const uploadedImage = await this.uploadImage(imageBlob);
      console.log("✅ Image uploaded successfully, ID:", uploadedImage.id);
      console.log(
        "📸 Uploaded image details:",
        JSON.stringify(uploadedImage, null, 2),
      );

      // 2. Use working values from script - Unisex Oversized Boxy Tee
      // Should include all the ones between these (inclusive) using an array function
      const availableVariantIds = [
        118073, 118074, 118075, 118081, 118082, 118083, 118089, 118090, 118091,
        118102, 118106, 118107,
      ];
      console.log("📋 Step 2: Using variant IDs:", availableVariantIds);

      // 3. Create product with working blueprint/provider
      console.log("🏭 Step 3: Creating product on Printify...");
      const identifier = createProductIdentifier(imageHash);
      const productPayload: CreateProductPayload = {
        title: productName,
        description:
          description ||
          `Custom AI-generated shirt design: ${prompt}\n\nID: ${identifier}`,
        blueprint_id: 1723,
        print_provider_id: 74,
        variants: availableVariantIds.map(variantId => ({
          id: variantId,
          price: price,
          is_enabled: true,
        })),
        print_areas: [
          {
            variant_ids: availableVariantIds,
            placeholders: [
              {
                position: "front",
                images: [
                  {
                    id: uploadedImage.id,
                    x: 0.5, // Center horizontally
                    y: 0.5, // Center vertically
                    scale: 0.8, // Slightly smaller than full size
                    angle: 0,
                  },
                ],
              },
            ],
          },
        ],
      };

      console.log(
        "📦 Product payload prepared with blueprint 1723 and provider 74",
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

      let shopifyUrl: string | undefined;
      if (updatedProduct.external?.handle) {
        // Extract handle from full URL if needed, or use as-is if it's just a handle
        const handleValue = updatedProduct.external.handle;
        const justHandle = handleValue.includes("/products/")
          ? handleValue.split("/products/")[1]?.split("?")[0]
          : handleValue;

        shopifyUrl = this.getShopifyUrl(justHandle);
      }

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
