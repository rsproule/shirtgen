import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const SHOPIFY_URL = `https://shirt-slop.myshopify.com/collections/all?sort_by=created-descending`;
