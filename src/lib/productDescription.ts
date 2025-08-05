import type { EchoUser } from "@zdql/echo-react-sdk";

// Helper function to truncate prompt text
const truncatePrompt = (prompt: string, maxLength: number = 100): string => {
  if (prompt.length <= maxLength) return prompt;
  return prompt.substring(0, maxLength).trim() + "...";
};

export const PRODUCT_DESCRIPTION_TEMPLATE = (
  creator: EchoUser | null,
  prompt?: string
) => `
Created on <a href="https://shirtslop.com" target="_blank" rel="noopener noreferrer">shirtslop.com</a>
${prompt ? `<br><br>Design: "${truncatePrompt(prompt)}"` : ""}
${creator ? `<br><br>by: ${creator.name || creator.email}` : ""}
${creator?.id ? `<br><br><span style="color: #888;">[${creator.id}]</span>` : ""}
`;
