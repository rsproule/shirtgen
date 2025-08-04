// Note: createProductIdentifier is used by the main service, not directly here

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

interface CreateProductVariant {
  id: number;
  price: number; // Price in cents
  is_enabled: boolean;
}

export interface CreateProductPayload {
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

// Printify placement mapping
export type PrintifyPlacement = "front_dtg" | "back_dtg";

/**
 * Product configuration and payload building utilities
 * Handles product descriptions, configurations, and API payload creation
 */
export class ProductBuilder {
  /**
   * Create standardized product description with branding
   */
  static createDescription(
    identifier: string,
    customDescription?: string,
  ): string {
    return (
      customDescription ||
      `Created on <a href="https://shirtslop.com" target="_blank">https://shirtslop.com</a>\n\nShirtSlop Tees\nSo Soft. So Shirt. So Slop.\n\nAt ShirtSlop, we take your ideas, inside jokes, and designs — and print them on Comfort Colors tees.\n\nProduct Details:\n– Printed on 100% ring-spun cotton Comfort Colors tees\n– Pre-shrunk, soft-washed, garment-dyed fabric\n– Relaxed fit with vintage fade\n– Double-stitched for durability\n– Unisex sizing: comfortable, built for slopping\n\nID: ${identifier}`
    );
  }

  /**
   * Convert UI placement to Printify placement
   */
  static getPrintifyPlacement(placement: "front" | "back"): PrintifyPlacement {
    return placement === "front" ? "front_dtg" : "back_dtg";
  }

  /**
   * Create complete product payload for Printify API
   */
  static createProductPayload(
    productName: string,
    description: string,
    uploadedImageId: string,
    price: number,
    placement: "front" | "back" = "front",
    imageScale: number = 1.0,
    imagePosition: { x: number; y: number } = { x: 0, y: 0 },
  ): CreateProductPayload {
    const shirtConfig = SHIRT_CONFIGS.shaka;
    const printifyPlacement = this.getPrintifyPlacement(placement);

    // Convert position from normalized coordinates (-1 to 1) to Printify coordinates (0 to 1)
    // Printify uses 0.5 as center, so we map our -1 to 1 range to 0 to 1
    const printifyX = 0.5 + (imagePosition.x * 0.3); // Scale position to reasonable bounds
    const printifyY = 0.5 + (imagePosition.y * 0.3); // Scale position to reasonable bounds

    // Apply scale to the Printify scale parameter
    const printifyScale = 0.8 * imageScale; // Base scale of 0.8, then apply user's scale

    return {
      title: productName,
      description,
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
              position: printifyPlacement,
              images: [
                {
                  id: uploadedImageId,
                  x: printifyX, // Use calculated position
                  y: printifyY, // Use calculated position
                  scale: printifyScale, // Use calculated scale
                  angle: 0,
                },
              ],
            },
          ],
        },
      ],
    };
  }

  /**
   * Get available shirt configurations
   */
  static getShirtConfigs(): Record<string, ShirtConfig> {
    return SHIRT_CONFIGS;
  }
}
