// Utility functions for image hashing and tracking

/**
 * Generate a SHA-256 hash from image blob content
 */
export async function generateImageHash(imageBlob: Blob): Promise<string> {
  const arrayBuffer = await imageBlob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Generate a hash from a data URL
 */
export async function generateDataUrlHash(dataUrl: string): Promise<string> {
  // Extract base64 data from data URL
  const base64Data = dataUrl.split(',')[1];
  const binaryData = atob(base64Data);
  const uint8Array = new Uint8Array(binaryData.length);
  
  for (let i = 0; i < binaryData.length; i++) {
    uint8Array[i] = binaryData.charCodeAt(i);
  }
  
  const hashBuffer = await crypto.subtle.digest('SHA-256', uint8Array);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Store published product info in localStorage
 */
export function storePublishedProduct(imageHash: string, data: {
  productName: string;
  prompt: string;
  printifyProductId: string;
  shopifyUrl?: string;
  publishedAt: string;
}) {
  const key = `published_${imageHash}`;
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Get published product info from localStorage
 */
export function getPublishedProduct(imageHash: string): {
  productName: string;
  prompt: string;
  printifyProductId: string;
  shopifyUrl?: string;
  publishedAt: string;
} | null {
  const key = `published_${imageHash}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
}

/**
 * Check if an image has already been published
 */
export function isImagePublished(imageHash: string): boolean {
  return getPublishedProduct(imageHash) !== null;
}

/**
 * Extract product identifier from product description
 * Example: "Custom AI-generated shirt design: dragon breathing fire\n\nID: a1b2c3d4"
 */
export function extractIdentifierFromDescription(description: string): string | null {
  // Look for "ID: " followed by 8-char hex pattern
  const match = description.match(/ID:\s*([a-f0-9]{8})/i);
  return match ? match[1] : null;
}

/**
 * Find stored product by partial hash identifier
 */
export function findProductByIdentifier(identifier: string): {
  productName: string;
  prompt: string;
  printifyProductId: string;
  shopifyUrl?: string;
  publishedAt: string;
  imageHash: string;
} | null {
  // Search through localStorage for matching identifiers
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith('published_')) {
      const imageHash = key.replace('published_', '');
      if (imageHash.startsWith(identifier)) {
        const stored = localStorage.getItem(key);
        if (stored) {
          return { ...JSON.parse(stored), imageHash };
        }
      }
    }
  }
  return null;
}