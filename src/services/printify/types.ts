/**
 * Shared type definitions for Printify service integration
 */

export interface PrintifyImage {
  id: string;
  src: string;
  width: number;
  height: number;
}

export interface PrintifyProduct {
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

export interface PrintifyOption {
  name: string;
  type: string;
  values: Array<{
    id: number;
    title: string;
    colors?: string[];
  }>;
}

export interface PrintifyVariant {
  id: number;
  title: string;
  price: number;
  options: number[];
  external?: {
    id: string;
  };
}

export interface ShirtCreationResult {
  product: PrintifyProduct;
  variants: PrintifyVariant[];
  options: PrintifyOption[];
  imageHash: string;
}
