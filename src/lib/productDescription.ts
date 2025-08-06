import type { EchoUser } from "@zdql/echo-react-sdk";

export const PRODUCT_DESCRIPTION_TEMPLATE = (
  creator: EchoUser | null,
  prompt?: string,
) => `
Created on <a href="https://shirtslop.com" target="_blank" rel="noopener noreferrer">shirtslop.com</a>
${prompt ? `<br><br>Design: <em>"${prompt}"</em>` : ""}
${creator ? `<br><br>by: ${creator.name || creator.email}` : ""}
${creator?.id ? `<br><br><span style="color: #888;">[${creator.id}]</span>` : ""}
`;
