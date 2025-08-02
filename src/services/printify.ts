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

  private async makeRequest<T>(
    action: string,
    body?: any,
    method: string = "POST",
  ): Promise<T> {
    const url = `/api/printify?action=${action}`;
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

  private async blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async uploadImage(imageBlob: Blob): Promise<PrintifyImage> {
    // Compress the image before uploading to reduce payload size
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = async () => {
        // Set max dimensions to reduce file size
        const maxWidth = 800;
        const maxHeight = 800;

        let { width, height } = img;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL with compression
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8); // 80% quality

        try {
          const result = await this.makeRequest<PrintifyImage>("upload", {
            imageUrl: dataUrl,
          });
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(imageBlob);
    });
  }

  async createProduct(payload: CreateProductPayload): Promise<PrintifyProduct> {
    return this.makeRequest<PrintifyProduct>("create-product", payload);
  }

  async publishProduct(productId: string): Promise<void> {
    await this.makeRequest("publish", { productId });
  }

  async getProduct(productId: string): Promise<PrintifyProduct> {
    const url = `/api/printify?action=get-product&productId=${productId}`;
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
    title: string,
    description: string = "",
    price: number = 3500, // $35.00 in cents
  ): Promise<{
    product: PrintifyProduct;
    variants: PrintifyVariant[];
    options: PrintifyOption[];
  }> {
    try {
      // 1. Convert image URL to blob and upload
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      const uploadedImage = await this.uploadImage(imageBlob);

      // 2. Use working values from script - Unisex Oversized Boxy Tee
      const availableVariantIds = [103548, 103547, 103546]; // White L, M, S

      // 3. Create product with working blueprint/provider
      const productPayload: CreateProductPayload = {
        title,
        description: description || `Custom design: ${title}`,
        blueprint_id: 1382, // Unisex Oversized Boxy Tee
        print_provider_id: 99, // Working provider from your products
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
                    scale: 1,
                    angle: 0,
                  },
                ],
              },
            ],
          },
        ],
      };

      const product = await this.createProduct(productPayload);

      // 4. Publish to Shopify
      await this.publishProduct(product.id);

      // 5. Wait for sync and get updated product details with variants
      await new Promise(resolve => setTimeout(resolve, 5000));
      const updatedProduct = await this.getProduct(product.id);

      return {
        product: updatedProduct,
        variants: updatedProduct.variants || [],
        options: updatedProduct.options || [],
      };
    } catch (error) {
      console.error("Failed to create shirt:", error);
      throw new Error(
        `Failed to create shirt: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}

export const printifyService = new PrintifyService();
