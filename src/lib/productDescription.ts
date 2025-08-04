export const PRODUCT_DESCRIPTION_TEMPLATE = (identifier?: string) => `Created on https://shirtslop.com

ShirtSlop Tees
So Soft. So Shirt. So Slop.

At ShirtSlop, we take your ideas, inside jokes, and designs — and print them on Comfort Colors tees.

Product Details:
• Printed on 100% ring-spun cotton Comfort Colors tees
• Pre-shrunk, soft-washed, garment-dyed fabric
• Relaxed fit with vintage fade
• Double-stitched for durability
• Unisex sizing: comfortable, built for slopping${identifier ? `\n\nID: ${identifier}` : ''}`; 