import type { EchoUser } from "@zdql/echo-react-sdk";

export const PRODUCT_DESCRIPTION_TEMPLATE = (creator: EchoUser | null) =>
  `Created on https://shirtslop.com${
    creator ? ` by\n\nID: ${creator.name || creator.email}` : ""
  }
\n 
${creator?.id}
`;
