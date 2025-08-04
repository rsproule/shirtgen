import type { EchoUser } from "@zdql/echo-react-sdk";

export const PRODUCT_DESCRIPTION_TEMPLATE = (creator: EchoUser | null) => `
Created on <a href="https://shirtslop.com" target="_blank" rel="noopener noreferrer">shirtslop.com</a>
${creator ? `<br><br>by: ${creator.name || creator.email}` : ""}
${creator?.id ? `<br><br><span style="color: #888;">[${creator.id}]</span>` : ""}
`;
